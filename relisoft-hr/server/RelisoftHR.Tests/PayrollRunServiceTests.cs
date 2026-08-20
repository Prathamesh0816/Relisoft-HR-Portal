using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class PayrollRunServiceTests
{
    private static PayrollRunService CreateService(AppDbContext db)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Email:SmtpHost"] = "",
            ["Email:From"] = "noreply@relisofttechnologies.com"
        }).Build();
        return new PayrollRunService(
            db,
            new InternCompensationService(db),
            new AuditLogService(db),
            new EmailService(new NullLogger<EmailService>(), config),
            new NullLogger<PayrollRunService>());
    }

    // ── Last working day ──

    [Fact]
    public void LastWorkingDay_August2026_ReturnsMonday31st()
    {
        var result = PayrollRunService.LastWorkingDay(2026, 8);
        Assert.Equal(new DateOnly(2026, 8, 31), result); // 31 Aug 2026 is a Monday
    }

    [Fact]
    public void LastWorkingDay_SkipsWeekend_ReturnsFriday()
    {
        var result = PayrollRunService.LastWorkingDay(2026, 10);
        Assert.Equal(new DateOnly(2026, 10, 30), result); // 31 Oct 2026 is a Saturday
    }

    [Fact]
    public void LastWorkingDay_SkipsCompanyHoliday()
    {
        var holidays = new[] { new DateOnly(2026, 8, 31) };
        var result = PayrollRunService.LastWorkingDay(2026, 8, holidays);
        Assert.Equal(new DateOnly(2026, 8, 28), result); // 28 Aug 2026 is a Friday
    }

    // ── Automatic disbursement pipeline ──

    [Fact]
    public async Task DisbursePeriodAsync_CreatesRunGeneratesAndPays()
    {
        var db = TestDbContext.Create();
        db.Employees.Find(3)!.Status = "Active";
        db.PayComponents.Add(new PayComponent { Id = 1, Name = "Basic", Type = PayComponentType.Earning, IsActive = true });
        db.EmployeeSalaryStructures.Add(new EmployeeSalaryStructure
        {
            EmployeeId = 3,
            EffectiveFrom = new DateTime(2026, 1, 1),
            Lines = new List<EmployeeSalaryStructureLine>
            {
                new() { PayComponentId = 1, MonthlyAmount = 50000 }
            }
        });
        await db.SaveChangesAsync();

        var service = CreateService(db);
        var status = await service.DisbursePeriodAsync(8, 2026, "Automatic", null, "System");

        Assert.Equal(PayRunStatus.Paid.ToString(), status);
        var run = await db.PayRuns.FirstAsync(r => r.PeriodMonth == 8 && r.PeriodYear == 2026);
        Assert.Equal(PayRunStatus.Paid, run.Status);
        Assert.NotNull(run.PaidOn);
        Assert.True(run.AutoDisbursed);
        Assert.True(await db.Payslips.AnyAsync(p => p.PayRunId == run.Id && p.EmployeeId == 3));
    }

    [Fact]
    public async Task DisbursePeriodAsync_IsIdempotent_DoesNotPayTwice()
    {
        var db = TestDbContext.Create();
        var service = CreateService(db);

        await service.DisbursePeriodAsync(8, 2026, "Automatic", null, "System");
        var run = await db.PayRuns.FirstAsync(r => r.PeriodMonth == 8 && r.PeriodYear == 2026);
        var paidOn = run.PaidOn;
        await Task.Delay(20);

        var second = await service.DisbursePeriodAsync(8, 2026, "Automatic", null, "System");
        Assert.Equal(PayRunStatus.Paid.ToString(), second);
        Assert.Equal(paidOn, run.PaidOn); // unchanged — not disbursed twice
        Assert.Equal(1, await db.PayRuns.CountAsync(r => r.PeriodMonth == 8 && r.PeriodYear == 2026));
    }
}