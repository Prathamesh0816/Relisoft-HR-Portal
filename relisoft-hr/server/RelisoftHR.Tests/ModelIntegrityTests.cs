using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using RelisoftHR.Models;

namespace RelisoftHR.Tests;

public class ModelIntegrityTests
{
    [Fact]
    public void Foreign_keys_do_not_use_shadow_properties()
    {
        using var db = TestDbContext.Create();

        var shadowForeignKeys = db.Model.GetEntityTypes()
            .SelectMany(entity => entity.GetForeignKeys())
            .Where(foreignKey => foreignKey.Properties.Any(property => property.IsShadowProperty()))
            .Select(foreignKey => $"{foreignKey.DeclaringEntityType.DisplayName()}: {string.Join(", ", foreignKey.Properties.Select(property => property.Name))}")
            .ToList();

        Assert.Empty(shadowForeignKeys);
    }

    [Fact]
    public void Decimal_properties_have_explicit_precision()
    {
        using var db = TestDbContext.Create();

        var invalidProperties = db.Model.GetEntityTypes()
            .SelectMany(entity => entity.GetProperties())
            .Where(property => property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
            .Where(property => property.GetPrecision() != 18 || property.GetScale() != 2)
            .Select(property => $"{property.DeclaringType.DisplayName()}.{property.Name}")
            .ToList();

        Assert.Empty(invalidProperties);
    }

    [Fact]
    public void One_per_owner_entities_have_unique_indexes()
    {
        using var db = TestDbContext.Create();

        AssertUniqueIndex<EmployeeOnboardingProfile>(db, nameof(EmployeeOnboardingProfile.EmployeeId));
        AssertUniqueIndex<SalaryStructure>(db, nameof(SalaryStructure.EmployeeId));
        AssertUniqueIndex<EmployeeAppraisal>(db, nameof(EmployeeAppraisal.EmployeeId), nameof(EmployeeAppraisal.CycleId));
        AssertUniqueIndex<AttendanceRecord>(db, nameof(AttendanceRecord.EmployeeId), nameof(AttendanceRecord.Date));
        AssertUniqueIndex<TimesheetPeriod>(db, nameof(TimesheetPeriod.EmployeeId), nameof(TimesheetPeriod.WeekStart));
        AssertUniqueIndex<TrainingRegistration>(db, nameof(TrainingRegistration.CourseId), nameof(TrainingRegistration.EmployeeId));
        AssertUniqueIndex<InternalJobApplication>(db, nameof(InternalJobApplication.JobPostingId), nameof(InternalJobApplication.EmployeeId));
        AssertUniqueIndex<EmployeeProject>(db, nameof(EmployeeProject.EmployeeId), nameof(EmployeeProject.ProjectId));

        var primaryProjectIndex = db.Model.FindEntityType(typeof(EmployeeProject))!
            .GetIndexes()
            .Single(index => index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(EmployeeProject.EmployeeId)]));
        Assert.True(primaryProjectIndex.IsUnique);
        Assert.Equal("[IsPrimary] = 1", primaryProjectIndex.GetFilter());
    }

    [Fact]
    public void Cross_parent_references_use_composite_foreign_keys()
    {
        using var db = TestDbContext.Create();

        AssertForeignKey<EmployeeOnboardingDocument, EmployeeOnboardingExperience>(
            db,
            nameof(EmployeeOnboardingDocument.OnboardingProfileId),
            nameof(EmployeeOnboardingDocument.ExperienceId));
        AssertForeignKey<SurveyResponse, SurveyQuestion>(
            db,
            nameof(SurveyResponse.SurveyId),
            nameof(SurveyResponse.QuestionId));
    }

    [Fact]
    public void Historical_employee_records_do_not_cascade_on_employee_delete()
    {
        using var db = TestDbContext.Create();

        var historicalTypes = new[]
        {
            typeof(LeaveApplication),
            typeof(EmployeeLeaveBalance),
            typeof(EmployeeAppraisal),
            typeof(AttendanceRecord),
            typeof(EmployeeTicket),
            typeof(TimesheetEntry),
            typeof(EmployeeLoan),
            typeof(RewardTransaction),
            typeof(Notification)
        };

        foreach (var historicalType in historicalTypes)
        {
            var foreignKeys = db.Model.FindEntityType(historicalType)!
                .GetForeignKeys()
                .Where(foreignKey => foreignKey.PrincipalEntityType.ClrType == typeof(Employee));

            Assert.All(foreignKeys, foreignKey => Assert.Equal(DeleteBehavior.NoAction, foreignKey.DeleteBehavior));
        }
    }

    [Fact]
    public void Shared_workflow_aggregates_use_row_version_concurrency()
    {
        using var db = TestDbContext.Create();
        var aggregateTypes = new[]
        {
            typeof(Asset), typeof(EmployeeAsset), typeof(BenefitEnrollment),
            typeof(EmployeeLeaveBalance), typeof(EmployeeLoan), typeof(ExpenseClaim),
            typeof(LeaveApplication), typeof(RewardCatalogItem), typeof(RewardPointsAccount),
            typeof(RewardRedemption), typeof(ShiftSwap), typeof(TimesheetEntry),
            typeof(TrainingCourse), typeof(TrainingRegistration), typeof(Visitor)
        };

        foreach (var aggregateType in aggregateTypes)
        {
            var rowVersion = db.Model.FindEntityType(aggregateType)!.FindProperty("RowVersion");
            Assert.NotNull(rowVersion);
            Assert.True(rowVersion.IsConcurrencyToken);
            Assert.Equal(ValueGenerated.OnAddOrUpdate, rowVersion.ValueGenerated);
        }
    }

    [Fact]
    public void Http_mutable_resources_expose_row_version_tokens()
    {
        using var db = TestDbContext.Create();
        var mutableTypes = new[]
        {
            typeof(Announcement), typeof(AppraisalCycle), typeof(ApprovalDelegate),
            typeof(Asset), typeof(BenefitPlan), typeof(BragPost),
            typeof(CommuteRoute), typeof(ComplianceRequirement), typeof(Contractor),
            typeof(ContractorEmployee), typeof(Employee), typeof(EmployeeSkill),
            typeof(HrPolicy), typeof(InternalJobPosting), typeof(Project),
            typeof(RewardCatalogItem), typeof(SalaryDiscussion), typeof(ShiftAssignment),
            typeof(ShiftTemplate), typeof(Team), typeof(TimesheetEntry),
            typeof(TrainingCourse), typeof(Visitor)
        };

        foreach (var mutableType in mutableTypes)
        {
            Assert.True(typeof(IHasRowVersion).IsAssignableFrom(mutableType));
            var rowVersion = db.Model.FindEntityType(mutableType)!.FindProperty(nameof(IHasRowVersion.RowVersion));
            Assert.NotNull(rowVersion);
            Assert.True(rowVersion.IsConcurrencyToken);
            Assert.Equal(ValueGenerated.OnAddOrUpdate, rowVersion.ValueGenerated);
        }
    }

    [Fact]
    public void User_facing_delete_entities_have_global_soft_delete_filters()
    {
        using var db = TestDbContext.Create();
        var softDeleteTypes = new[]
        {
            typeof(Announcement), typeof(ApprovalDelegate), typeof(BragPost),
            typeof(CarpoolMember), typeof(CommuteRoute), typeof(EmployeeAppraisalGoal),
            typeof(EmployeeSkill), typeof(ShiftAssignment), typeof(TimesheetEntry)
        };

        foreach (var entityType in softDeleteTypes)
        {
            Assert.True(typeof(ISoftDeletable).IsAssignableFrom(entityType));
            var metadata = db.Model.FindEntityType(entityType);
            Assert.NotNull(metadata);
            Assert.NotEmpty(metadata.GetDeclaredQueryFilters());
            Assert.NotNull(metadata.FindProperty(nameof(ISoftDeletable.IsDeleted)));
            Assert.NotNull(metadata.FindProperty(nameof(ISoftDeletable.DeletedOn)));
            Assert.NotNull(metadata.FindProperty(nameof(ISoftDeletable.DeletedById)));
        }
    }

    [Fact]
    public void Soft_deleted_principals_do_not_cascade_to_audit_children()
    {
        using var db = TestDbContext.Create();

        Assert.Equal(
            DeleteBehavior.NoAction,
            db.Model.FindEntityType(typeof(BragLike))!.GetForeignKeys()
                .Single(foreignKey => foreignKey.PrincipalEntityType.ClrType == typeof(BragPost))
                .DeleteBehavior);
        Assert.Equal(
            DeleteBehavior.NoAction,
            db.Model.FindEntityType(typeof(SkillEndorsement))!.GetForeignKeys()
                .Single(foreignKey => foreignKey.PrincipalEntityType.ClrType == typeof(EmployeeSkill))
                .DeleteBehavior);
    }

    private static void AssertUniqueIndex<TEntity>(DbContext db, params string[] propertyNames)
    {
        var entityType = db.Model.FindEntityType(typeof(TEntity));
        Assert.NotNull(entityType);

        var index = entityType.GetIndexes().SingleOrDefault(candidate =>
            candidate.Properties.Select(property => property.Name).SequenceEqual(propertyNames));
        Assert.NotNull(index);
        Assert.True(index.IsUnique);
    }

    private static void AssertForeignKey<TDependent, TPrincipal>(DbContext db, params string[] propertyNames)
    {
        var entityType = db.Model.FindEntityType(typeof(TDependent));
        Assert.NotNull(entityType);

        var foreignKey = entityType.GetForeignKeys().SingleOrDefault(candidate =>
            candidate.PrincipalEntityType.ClrType == typeof(TPrincipal) &&
            candidate.Properties.Select(property => property.Name).SequenceEqual(propertyNames));
        Assert.NotNull(foreignKey);
        Assert.Equal(DeleteBehavior.NoAction, foreignKey.DeleteBehavior);
    }
}
