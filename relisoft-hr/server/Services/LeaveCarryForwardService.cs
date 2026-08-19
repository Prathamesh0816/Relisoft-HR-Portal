using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public class CarryForwardPreviewItem
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = "";
    public string EmployeeCode { get; set; } = "";
    public int LeaveTypeId { get; set; }
    public string LeaveTypeName { get; set; } = "";
    public decimal AllocatedLeaves { get; set; }
    public decimal UsedLeaves { get; set; }
    public decimal RemainingLeaves { get; set; }
    public decimal CarryForwardPct { get; set; }
    public decimal CarryForwardDays { get; set; }
    public decimal LapsedDays { get; set; }
}

public class CarryForwardResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public string FromFinancialYear { get; set; } = "";
    public string ToFinancialYear { get; set; } = "";
    public int EmployeesProcessed { get; set; }
    public decimal TotalCarryForwardDays { get; set; }
    public decimal TotalLapsedDays { get; set; }
    public List<CarryForwardPreviewItem> Items { get; set; } = new();
}

public class LeaveCarryForwardService
{
    private readonly AppDbContext _db;
    private readonly LeavePolicyOptions _options;
    private readonly ILogger<LeaveCarryForwardService> _logger;

    public LeaveCarryForwardService(AppDbContext db, IOptions<LeavePolicyOptions> options, ILogger<LeaveCarryForwardService> logger)
    {
        _db = db;
        _options = options.Value;
        _logger = logger;
    }

    /// <summary>
    /// Get the financial year label for a given date.
    /// FY starts in April: July 2026 → "FY2026", Feb 2027 → "FY2026", Apr 2027 → "FY2027"
    /// </summary>
    public string GetFinancialYear(DateTime date)
    {
        return date.Month >= _options.FinancialYearStartMonth
            ? $"FY{date.Year}"
            : $"FY{date.Year - 1}";
    }

    /// <summary>
    /// Financial year label using the standard April start (the default policy).
    /// July 2026 → "FY2026", Feb 2027 → "FY2026", Apr 2027 → "FY2027".
    /// </summary>
    public static string GetFinancialYearFor(DateTime date)
    {
        return date.Month >= 4 ? $"FY{date.Year}" : $"FY{date.Year - 1}";
    }

    /// <summary>
    /// Get the previous financial year label.
    /// "FY2026" → "FY2025"
    /// </summary>
    public string GetPreviousFinancialYear(string currentFY)
    {
        if (currentFY.StartsWith("FY") && int.TryParse(currentFY[2..], out var year))
            return $"FY{year - 1}";
        return "";
    }

    /// <summary>
    /// Check if carry-forward has already been processed for a given source FY.
    /// </summary>
    public async Task<bool> IsAlreadyProcessedAsync(string fromFY)
    {
        return await _db.LeaveCarryForwardLogs.AnyAsync(l => l.FromFinancialYear == fromFY);
    }

    /// <summary>
    /// Preview carry-forward calculations without making any changes.
    /// </summary>
    public async Task<CarryForwardResult> PreviewAsync(string fromFY)
    {
        var toFY = GetNextFinancialYear(fromFY);
        var items = await CalculateCarryForwardAsync(fromFY);

        return new CarryForwardResult
        {
            Success = true,
            Message = $"Preview: {items.Count} employee-leave combinations eligible for carry-forward from {fromFY} to {toFY}.",
            FromFinancialYear = fromFY,
            ToFinancialYear = toFY,
            EmployeesProcessed = items.Select(i => i.EmployeeId).Distinct().Count(),
            TotalCarryForwardDays = items.Sum(i => i.CarryForwardDays),
            TotalLapsedDays = items.Sum(i => i.LapsedDays),
            Items = items
        };
    }

    /// <summary>
    /// Execute carry-forward: update balances and create audit logs.
    /// </summary>
    public async Task<CarryForwardResult> ProcessAsync(string fromFY, string triggerType, int? processedById)
    {
        var toFY = GetNextFinancialYear(fromFY);

        // Idempotency check
        if (await IsAlreadyProcessedAsync(fromFY))
        {
            return new CarryForwardResult
            {
                Success = false,
                Message = $"Carry-forward from {fromFY} to {toFY} has already been processed.",
                FromFinancialYear = fromFY,
                ToFinancialYear = toFY
            };
        }

        var items = await CalculateCarryForwardAsync(fromFY);

        if (items.Count == 0)
        {
            return new CarryForwardResult
            {
                Success = true,
                Message = $"No eligible leave balances found for carry-forward from {fromFY}.",
                FromFinancialYear = fromFY,
                ToFinancialYear = toFY
            };
        }

        var now = DateTime.UtcNow;

        foreach (var item in items)
        {
            // Update the employee's leave balance for the new FY
            var balance = await _db.EmployeeLeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == item.EmployeeId && lb.LeaveTypeId == item.LeaveTypeId);

            if (balance != null)
            {
                // Calculate new allocation: previous base + carry-forward
                var previousBase = balance.AllocatedLeaves - balance.CarryForwardDays;
                if (previousBase < 0) previousBase = balance.AllocatedLeaves;

                balance.AllocatedLeaves = previousBase + item.CarryForwardDays;
                balance.UsedLeaves = 0;
                balance.RemainingLeaves = balance.AllocatedLeaves;
                balance.CarryForwardDays = item.CarryForwardDays;
                balance.FinancialYear = toFY;
                balance.UpdatedOn = now;
            }

            // Create audit log entry
            _db.LeaveCarryForwardLogs.Add(new LeaveCarryForwardLog
            {
                EmployeeId = item.EmployeeId,
                LeaveTypeId = item.LeaveTypeId,
                FromFinancialYear = fromFY,
                ToFinancialYear = toFY,
                PreviousYearRemaining = item.RemainingLeaves,
                CarryForwardPct = item.CarryForwardPct,
                CarryForwardDays = item.CarryForwardDays,
                LapsedDays = item.LapsedDays,
                TriggerType = triggerType,
                ProcessedById = processedById,
                ProcessedOn = now
            });
        }

        await _db.SaveChangesAsync();

        var result = new CarryForwardResult
        {
            Success = true,
            Message = $"Carry-forward processed: {items.Select(i => i.EmployeeId).Distinct().Count()} employees, " +
                      $"{items.Sum(i => i.CarryForwardDays)} days carried forward from {fromFY} to {toFY}.",
            FromFinancialYear = fromFY,
            ToFinancialYear = toFY,
            EmployeesProcessed = items.Select(i => i.EmployeeId).Distinct().Count(),
            TotalCarryForwardDays = items.Sum(i => i.CarryForwardDays),
            TotalLapsedDays = items.Sum(i => i.LapsedDays),
            Items = items
        };

        _logger.LogInformation("Leave carry-forward {Trigger}: {FromFY} → {ToFY}, {Count} employees, {Days} days carried",
            triggerType, fromFY, toFY, result.EmployeesProcessed, result.TotalCarryForwardDays);

        return result;
    }

    /// <summary>
    /// Calculate carry-forward for all employees and qualifying leave types.
    /// </summary>
    private async Task<List<CarryForwardPreviewItem>> CalculateCarryForwardAsync(string fromFY)
    {
        // Get leave types that allow carry-forward
        var qualifyingLeaveTypes = await _db.LeaveTypes
            .Where(lt => lt.CarryForwardPct > 0 && lt.IsActive && !lt.IsCompOff && !lt.IsFloaterHoliday)
            .ToListAsync();

        if (qualifyingLeaveTypes.Count == 0)
            return new List<CarryForwardPreviewItem>();

        var qualifyingTypeIds = qualifyingLeaveTypes.Select(lt => lt.Id).ToList();

        // Get all active employees with their balances for qualifying leave types
        var balances = await _db.EmployeeLeaveBalances
            .Include(lb => lb.Employee)
            .Include(lb => lb.LeaveType)
            .Where(lb => qualifyingTypeIds.Contains(lb.LeaveTypeId)
                      && lb.Employee != null
                      && lb.Employee.Status == "Active"
                      && lb.RemainingLeaves > 0)
            .ToListAsync();

        var items = new List<CarryForwardPreviewItem>();

        foreach (var balance in balances)
        {
            var leaveType = qualifyingLeaveTypes.First(lt => lt.Id == balance.LeaveTypeId);
            var remaining = balance.RemainingLeaves;
            var cfDays = Math.Floor(remaining * leaveType.CarryForwardPct / 100);
            var lapsed = remaining - cfDays;

            if (cfDays <= 0) continue;

            items.Add(new CarryForwardPreviewItem
            {
                EmployeeId = balance.EmployeeId,
                EmployeeName = balance.Employee?.FullName ?? "",
                EmployeeCode = balance.Employee?.EmployeeCode ?? "",
                LeaveTypeId = balance.LeaveTypeId,
                LeaveTypeName = leaveType.Name,
                AllocatedLeaves = balance.AllocatedLeaves,
                UsedLeaves = balance.UsedLeaves,
                RemainingLeaves = remaining,
                CarryForwardPct = leaveType.CarryForwardPct,
                CarryForwardDays = cfDays,
                LapsedDays = lapsed
            });
        }

        return items;
    }

    private string GetNextFinancialYear(string fy)
    {
        if (fy.StartsWith("FY") && int.TryParse(fy[2..], out var year))
            return $"FY{year + 1}";
        return "";
    }
}
