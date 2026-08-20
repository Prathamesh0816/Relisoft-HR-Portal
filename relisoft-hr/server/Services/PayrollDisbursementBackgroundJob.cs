using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace RelisoftHR.Services;

/// <summary>
/// Automatic "salary shot" job: on the last working day of every month it creates
/// the monthly pay run (if missing), generates payslips, verifies, and disburses
/// salary for all eligible employees. Includes a catch-up window so a run missed
/// while the server was down is paid within the first few days of the next month.
/// </summary>
public class PayrollDisbursementBackgroundJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptions<PayrollOptions> _options;
    private readonly ILogger<PayrollDisbursementBackgroundJob> _logger;

    public PayrollDisbursementBackgroundJob(
        IServiceScopeFactory scopeFactory,
        IOptions<PayrollOptions> options,
        ILogger<PayrollDisbursementBackgroundJob> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Payroll disbursement background job started. Check time UTC={CheckTime}, enabled={Enabled}",
            _options.Value.CheckTimeUtc, _options.Value.AutoDisburseEnabled);

        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        await RunCatchUpAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                var checkTime = TimeSpan.TryParse(_options.Value.CheckTimeUtc, out var t) ? t : TimeSpan.FromHours(18);

                var nextCheck = now.Date.Add(checkTime);
                if (nextCheck <= now) nextCheck = nextCheck.AddDays(1);

                var delay = nextCheck - now;
                await Task.Delay(delay, stoppingToken);
                if (stoppingToken.IsCancellationRequested) break;

                await RunDailyCheckAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in payroll disbursement background job");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Payroll disbursement background job stopped.");
    }

    private async Task RunCatchUpAsync(CancellationToken stoppingToken)
    {
        if (!_options.Value.AutoDisburseEnabled || stoppingToken.IsCancellationRequested) return;
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<PayrollRunService>();
            var db = scope.ServiceProvider.GetRequiredService<Data.AppDbContext>();

            var now = DateTime.UtcNow;
            var prev = now.AddMonths(-1);
            var grace = _options.Value.CatchUpGraceDays;

            // Previous-month run missed its payday window? Pay it within the grace period.
            if (now.Day <= grace)
            {
                var paid = await db.PayRuns.AnyAsync(r =>
                    r.PeriodMonth == prev.Month && r.PeriodYear == prev.Year && r.Status == Models.PayRunStatus.Paid);
                if (!paid)
                {
                    _logger.LogWarning("Payroll catch-up: {Month}/{Year} was not paid. Disbursing now...", prev.Month, prev.Year);
                    var result = await service.DisbursePeriodAsync(prev.Month, prev.Year, "Automatic (Catch-up)", null, "System");
                    _logger.LogInformation("Payroll catch-up completed: run now {Status}.", result);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during payroll disbursement catch-up");
        }
    }

    private async Task RunDailyCheckAsync(CancellationToken stoppingToken)
    {
        if (!_options.Value.AutoDisburseEnabled || stoppingToken.IsCancellationRequested) return;
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<PayrollRunService>();
            var db = scope.ServiceProvider.GetRequiredService<Data.AppDbContext>();

            var today = DateTime.UtcNow.Date;
            var holidays = await db.Holidays.AsNoTracking()
                .Select(h => h.Date)
                .ToListAsync();

            var lastWorkingDay = PayrollRunService.LastWorkingDay(today.Year, today.Month, holidays);

            // Salary shot: on/after the last working day of the current month.
            if (today >= lastWorkingDay.ToDateTime(TimeOnly.MinValue))
            {
                var paid = await db.PayRuns.AnyAsync(r =>
                    r.PeriodMonth == today.Month && r.PeriodYear == today.Year && r.Status == Models.PayRunStatus.Paid);
                if (!paid)
                {
                    _logger.LogInformation("Payroll: today is the last working day ({LastWd}). Disbursing {Month}/{Year}...",
                        lastWorkingDay, today.Month, today.Year);
                    var result = await service.DisbursePeriodAsync(today.Month, today.Year, "Automatic", null, "System");
                    _logger.LogInformation("Payroll disbursement completed: run now {Status}.", result);
                }
            }

            // Catch-up for the previous month within the grace window.
            if (today.Day <= _options.Value.CatchUpGraceDays)
            {
                var prev = today.AddMonths(-1);
                var paid = await db.PayRuns.AnyAsync(r =>
                    r.PeriodMonth == prev.Month && r.PeriodYear == prev.Year && r.Status == Models.PayRunStatus.Paid);
                if (!paid)
                {
                    _logger.LogWarning("Payroll: previous month {Month}/{Year} unpaid. Disbursing...", prev.Month, prev.Year);
                    await service.DisbursePeriodAsync(prev.Month, prev.Year, "Automatic (Catch-up)", null, "System");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in payroll disbursement daily check");
        }
    }
}