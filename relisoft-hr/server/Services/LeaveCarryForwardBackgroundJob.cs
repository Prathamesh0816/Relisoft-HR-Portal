using Microsoft.Extensions.Options;

namespace RelisoftHR.Services;

/// <summary>
/// Background service that automatically processes leave carry-forward on the FY start date (April 1st by default).
/// Runs a daily check and includes catch-up logic for missed processing (e.g., server was down on April 1st).
/// </summary>
public class LeaveCarryForwardBackgroundJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly LeavePolicyOptions _options;
    private readonly ILogger<LeaveCarryForwardBackgroundJob> _logger;

    public LeaveCarryForwardBackgroundJob(
        IServiceScopeFactory scopeFactory,
        IOptions<LeavePolicyOptions> options,
        ILogger<LeaveCarryForwardBackgroundJob> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Leave carry-forward background job started. FY starts on month={Month}, day={Day}",
            _options.FinancialYearStartMonth, _options.FinancialYearStartDay);

        // Initial delay to let the app fully start up
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        // Run catch-up check on startup
        await RunCatchUpAsync(stoppingToken);

        // Daily loop
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                var checkTime = TimeSpan.TryParse(_options.CarryForwardCheckTimeUtc, out var t) ? t : TimeSpan.FromMinutes(30);

                // Calculate next check time
                var nextCheck = now.Date.Add(checkTime);
                if (nextCheck <= now)
                    nextCheck = nextCheck.AddDays(1);

                var delay = nextCheck - now;
                _logger.LogDebug("Leave carry-forward: next check at {NextCheck} UTC (in {Delay})", nextCheck, delay);

                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                // Check if today is the FY start date
                var today = DateTime.UtcNow;
                if (today.Month == _options.FinancialYearStartMonth && today.Day == _options.FinancialYearStartDay)
                {
                    await ProcessCarryForwardAsync("Automatic", stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in leave carry-forward background job");
                // Wait before retrying to avoid tight error loops
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Leave carry-forward background job stopped.");
    }

    /// <summary>
    /// Catch-up: On startup, check if the current FY's carry-forward was missed.
    /// E.g., if the server was down on April 1st, this will process it retroactively.
    /// </summary>
    private async Task RunCatchUpAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<LeaveCarryForwardService>();

            var currentFY = service.GetFinancialYear(DateTime.UtcNow);
            var previousFY = service.GetPreviousFinancialYear(currentFY);

            if (string.IsNullOrEmpty(previousFY)) return;

            var alreadyDone = await service.IsAlreadyProcessedAsync(previousFY);
            if (alreadyDone)
            {
                _logger.LogInformation("Leave carry-forward catch-up: {PreviousFY} → {CurrentFY} already processed. Skipping.",
                    previousFY, currentFY);
                return;
            }

            // Only run catch-up if we are past the FY start date
            var now = DateTime.UtcNow;
            var fyStartThisYear = new DateTime(now.Year, _options.FinancialYearStartMonth, _options.FinancialYearStartDay);

            // If today is after the FY start date for the current calendar year, catch-up is needed
            if (now >= fyStartThisYear && now.Month >= _options.FinancialYearStartMonth)
            {
                _logger.LogWarning("Leave carry-forward catch-up: {PreviousFY} → {CurrentFY} was NOT processed. Running now...",
                    previousFY, currentFY);

                await ProcessCarryForwardAsync("Automatic (Catch-up)", stoppingToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during leave carry-forward catch-up");
        }
    }

    private async Task ProcessCarryForwardAsync(string triggerType, CancellationToken stoppingToken)
    {
        if (stoppingToken.IsCancellationRequested) return;

        using var scope = _scopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<LeaveCarryForwardService>();

        var currentFY = service.GetFinancialYear(DateTime.UtcNow);
        var previousFY = service.GetPreviousFinancialYear(currentFY);

        if (string.IsNullOrEmpty(previousFY))
        {
            _logger.LogWarning("Could not determine previous financial year. Skipping carry-forward.");
            return;
        }

        var result = await service.ProcessAsync(previousFY, triggerType, processedById: null);

        if (result.Success)
        {
            _logger.LogInformation("Leave carry-forward completed: {Message}", result.Message);
        }
        else
        {
            _logger.LogWarning("Leave carry-forward skipped: {Message}", result.Message);
        }
    }
}
