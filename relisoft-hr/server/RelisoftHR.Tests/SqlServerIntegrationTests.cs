using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Tests;

public sealed class SqlServerFactAttribute : FactAttribute
{
    public SqlServerFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("RELISOFT_TEST_SQLSERVER")))
            Skip = "Set RELISOFT_TEST_SQLSERVER to run SQL Server integration tests.";
    }
}

public sealed class SqlServerFixture : IAsyncLifetime
{
    private readonly string _databaseName = $"RelisoftHR_Integration_{Guid.NewGuid():N}";

    public string ConnectionString { get; private set; } = "";
    public Exception? InitializationException { get; private set; }

    public async Task InitializeAsync()
    {
        var configuredConnection = Environment.GetEnvironmentVariable("RELISOFT_TEST_SQLSERVER");
        if (string.IsNullOrWhiteSpace(configuredConnection))
            return;

        ConnectionString = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(configuredConnection)
        {
            InitialCatalog = _databaseName
        }.ConnectionString;

        try
        {
            await using var db = CreateContext();
            await db.Database.MigrateAsync();
        }
        catch (Exception exception)
        {
            InitializationException = exception;
        }
    }

    public async Task DisposeAsync()
    {
        if (InitializationException != null || string.IsNullOrWhiteSpace(ConnectionString))
            return;

        await using var db = CreateContext();
        await db.Database.EnsureDeletedAsync();
    }

    public AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(ConnectionString)
            .Options;
        return new AppDbContext(options);
    }

    public void AssertAvailable()
    {
        Assert.False(string.IsNullOrWhiteSpace(ConnectionString));
        Assert.Null(InitializationException);
    }
}

public class SqlServerIntegrationTests : IClassFixture<SqlServerFixture>
{
    private readonly SqlServerFixture _fixture;

    public SqlServerIntegrationTests(SqlServerFixture fixture) => _fixture = fixture;

    [SqlServerFact]
    [Trait("Category", "Integration")]
    public async Task Complete_migration_chain_applies_without_pending_migrations()
    {
        _fixture.AssertAvailable();
        await using var db = _fixture.CreateContext();

        Assert.Empty(await db.Database.GetPendingMigrationsAsync());
    }

    [SqlServerFact]
    [Trait("Category", "Integration")]
    public async Task Onboarding_document_cannot_reference_another_profiles_experience()
    {
        _fixture.AssertAvailable();
        await using var db = _fixture.CreateContext();
        var firstProfile = new EmployeeOnboardingProfile { EmployeeId = 1 };
        var secondProfile = new EmployeeOnboardingProfile { EmployeeId = 2 };
        db.EmployeeOnboardingProfiles.AddRange(firstProfile, secondProfile);
        await db.SaveChangesAsync();

        var experience = new EmployeeOnboardingExperience
        {
            OnboardingProfileId = firstProfile.Id,
            CompanyName = "Integration Test",
            JobTitle = "Engineer"
        };
        db.EmployeeOnboardingExperiences.Add(experience);
        await db.SaveChangesAsync();

        db.EmployeeOnboardingDocuments.Add(new EmployeeOnboardingDocument
        {
            OnboardingProfileId = secondProfile.Id,
            ExperienceId = experience.Id,
            DocumentType = "ExperienceLetter",
            OriginalFileName = "test.pdf",
            StoredFilePath = "integration/test.pdf"
        });

        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [SqlServerFact]
    [Trait("Category", "Integration")]
    public async Task Survey_response_question_must_belong_to_the_same_survey()
    {
        _fixture.AssertAvailable();
        await using var db = _fixture.CreateContext();
        var firstSurvey = CreateSurvey("Integration survey A");
        var secondSurvey = CreateSurvey("Integration survey B");
        db.Surveys.AddRange(firstSurvey, secondSurvey);
        await db.SaveChangesAsync();

        var question = new SurveyQuestion
        {
            SurveyId = firstSurvey.Id,
            QuestionText = "Question",
            QuestionType = "text"
        };
        db.SurveyQuestions.Add(question);
        await db.SaveChangesAsync();

        db.SurveyResponses.Add(new SurveyResponse
        {
            SurveyId = secondSurvey.Id,
            QuestionId = question.Id,
            EmployeeId = 1,
            Response = "Invalid parent"
        });

        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [SqlServerFact]
    [Trait("Category", "Integration")]
    public async Task Sql_server_enforces_unique_and_check_constraints()
    {
        _fixture.AssertAvailable();

        await using (var db = _fixture.CreateContext())
        {
            var date = new DateTime(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);
            db.AttendanceRecords.AddRange(
                new AttendanceRecord { EmployeeId = 1, Date = date },
                new AttendanceRecord { EmployeeId = 1, Date = date });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }

        await using (var db = _fixture.CreateContext())
        {
            db.TimesheetEntries.Add(new TimesheetEntry
            {
                EmployeeId = 1,
                Date = new DateTime(2030, 1, 11, 0, 0, 0, DateTimeKind.Utc),
                Hours = 25,
                Description = "Invalid hours",
                Category = "Development"
            });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
        }
    }

    [SqlServerFact]
    [Trait("Category", "Integration")]
    public async Task Row_version_rejects_a_stale_update()
    {
        _fixture.AssertAvailable();
        int assetId;
        await using (var setup = _fixture.CreateContext())
        {
            var asset = new Asset
            {
                Name = "Concurrency laptop",
                AssetTag = $"IT-{Guid.NewGuid():N}",
                Status = "Available"
            };
            setup.Assets.Add(asset);
            await setup.SaveChangesAsync();
            assetId = asset.Id;
        }

        await using var first = _fixture.CreateContext();
        await using var second = _fixture.CreateContext();
        var firstAsset = await first.Assets.SingleAsync(asset => asset.Id == assetId);
        var staleAsset = await second.Assets.SingleAsync(asset => asset.Id == assetId);

        firstAsset.Status = "Assigned";
        await first.SaveChangesAsync();

        staleAsset.Status = "Retired";
        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => second.SaveChangesAsync());
    }

    [SqlServerFact]
    [Trait("Category", "Integration")]
    public async Task Soft_deleted_unique_record_can_be_recreated_and_history_is_retained()
    {
        _fixture.AssertAvailable();
        await using var db = _fixture.CreateContext();
        var skillName = $"Integration-{Guid.NewGuid():N}";
        var original = new EmployeeSkill
        {
            EmployeeId = 1,
            SkillName = skillName,
            Category = "Integration"
        };
        db.EmployeeSkills.Add(original);
        await db.SaveChangesAsync();

        db.SoftDelete(original, 1);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        db.EmployeeSkills.Add(new EmployeeSkill
        {
            EmployeeId = 1,
            SkillName = skillName,
            Category = "Integration"
        });
        await db.SaveChangesAsync();

        Assert.Equal(1, await db.EmployeeSkills.CountAsync(skill => skill.SkillName == skillName));
        var history = await db.EmployeeSkills
            .IgnoreQueryFilters()
            .Where(skill => skill.SkillName == skillName)
            .OrderBy(skill => skill.Id)
            .ToListAsync();
        Assert.Equal(2, history.Count);
        Assert.True(history[0].IsDeleted);
        Assert.NotNull(history[0].DeletedOn);
        Assert.Equal(1, history[0].DeletedById);
    }

    private static Survey CreateSurvey(string title) => new()
    {
        Title = title,
        StartDate = new DateTime(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc),
        EndDate = new DateTime(2030, 12, 31, 0, 0, 0, DateTimeKind.Utc),
        CreatedById = 1
    };
}
