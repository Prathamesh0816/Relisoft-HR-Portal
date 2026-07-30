using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;

namespace RelisoftHR.Services;

public sealed record LeaveBalanceSummary(
    int Id,
    int LeaveTypeId,
    string LeaveTypeName,
    decimal AllocatedLeaves,
    decimal UsedLeaves,
    decimal RemainingLeaves,
    decimal CarryForwardDays = 0,
    string FinancialYear = "");
public sealed record LeaveBalanceValidation(decimal AvailableBalance, decimal RequestedDays, decimal PaidLeaveDays, decimal LopDays, bool HasSufficientBalance, string WarningMessage, DateTime LeaveMonth);

public interface ILeaveBalanceService
{
    Task<LeaveBalanceSummary?> GetBalanceAsync(int employeeId, int leaveTypeId, DateTime? asOf = null);
    Task<LeaveBalanceValidation> ValidateLeaveBalanceAsync(int employeeId, int leaveTypeId, DateTime fromDate, decimal requestedDays);
    Task<bool> IsPlannedLeaveAsync(int leaveTypeId);
}

/// <summary>
/// Provides the leave values shown to employees. Planned Leave is a calculated
/// financial-year entitlement; all other leave types continue to use their stored balances.
/// </summary>
public sealed class LeaveBalanceService : ILeaveBalanceService
{
    private const string PlannedLeaveName = "Planned Leave";
    private readonly AppDbContext _db;

    public LeaveBalanceService(AppDbContext db) => _db = db;

    public async Task<bool> IsPlannedLeaveAsync(int leaveTypeId) =>
        await _db.LeaveTypes
            .AnyAsync(leaveType => leaveType.Id == leaveTypeId && leaveType.Name == PlannedLeaveName);

    public async Task<LeaveBalanceValidation> ValidateLeaveBalanceAsync(int employeeId, int leaveTypeId, DateTime fromDate, decimal requestedDays)
    {
        var balance = await GetBalanceAsync(employeeId, leaveTypeId, fromDate);
        var available = Math.Max(0, balance?.RemainingLeaves ?? 0);
        var requested = Math.Max(0, requestedDays);
        var paid = Math.Min(available, requested);
        var lop = requested - paid;
        var month = new DateTime(fromDate.Year, fromDate.Month, 1);
        var name = balance?.LeaveTypeName ?? "selected leave";
        var warning = lop > 0 ? $"You currently have only {available} {name}(s) available for {month:MMMM yyyy}. You are requesting {requested} day(s). {paid} day(s) will be adjusted and {lop} day(s) will be Loss of Pay (LOP)." : "Sufficient leave balance is available.";
        return new LeaveBalanceValidation(available, requested, paid, lop, lop == 0, warning, month);
    }


    public async Task<LeaveBalanceSummary?> GetBalanceAsync(int employeeId, int leaveTypeId, DateTime? asOf = null)
    {
        var leaveType = await _db.LeaveTypes.AsNoTracking().SingleOrDefaultAsync(type => type.Id == leaveTypeId);
        if (leaveType == null) return null;

        var storedBalance = await _db.EmployeeLeaveBalances.AsNoTracking()
            .SingleOrDefaultAsync(balance => balance.EmployeeId == employeeId && balance.LeaveTypeId == leaveTypeId);

        if (leaveType.Name != PlannedLeaveName)
        {
            return storedBalance == null
                ? new LeaveBalanceSummary(0, leaveType.Id, leaveType.Name, 0, 0, 0)
                : new LeaveBalanceSummary(storedBalance.Id, leaveType.Id, leaveType.Name,
                    storedBalance.AllocatedLeaves, storedBalance.UsedLeaves, storedBalance.RemainingLeaves,
                    storedBalance.CarryForwardDays, storedBalance.FinancialYear ?? "");
        }

        var employee = await _db.Employees.AsNoTracking().SingleOrDefaultAsync(employee => employee.Id == employeeId);
        if (employee == null) return null;

        var today = (asOf ?? DateTime.UtcNow).Date;
        var financialYearStart = GetFinancialYearStart(today);
        var financialYearEnd = financialYearStart.AddYears(1).AddDays(-1);
        var earned = CalculatePlannedLeaveEarned(employee.JoinDate, today, financialYearStart);

        // A cancellation request is still an approved, deducted leave until its approver
        // accepts it. Only the final Cancelled state restores dynamic Planned Leave.
        var approvedDays = await _db.LeaveApplications.AsNoTracking()
            .Where(application => application.EmployeeId == employeeId
                && application.LeaveTypeId == leaveTypeId
                && (application.Status == "Approved" || application.Status == "CancellationRequested")
                && application.TotalDays > 0
                && application.FromDate >= financialYearStart
                && application.FromDate <= financialYearEnd)
            .SumAsync(application => (decimal?)(application.PaidLeaveDays ?? application.TotalDays)) ?? 0;

        // Planned Leave snapshot values are derived exclusively from DOJ and leave
        // applications. Legacy EmployeeLeaveBalance counters must not influence them.
        var used = Math.Max(0, approvedDays);
        var remaining = Math.Clamp(earned - used, 0, earned);

        return new LeaveBalanceSummary(
            storedBalance?.Id ?? 0,
            leaveType.Id,
            leaveType.Name,
            earned,
            used,
            remaining,
            storedBalance?.CarryForwardDays ?? 0,
            storedBalance?.FinancialYear ?? "");
    }

    internal static DateTime GetFinancialYearStart(DateTime date) =>
        date.Month >= 4 ? new DateTime(date.Year, 4, 1) : new DateTime(date.Year - 1, 4, 1);

    internal static decimal CalculatePlannedLeaveEarned(DateTime joinDate, DateTime today, DateTime financialYearStart)
    {
        if (joinDate.Date > today.Date) return 0;

        var accrualStart = joinDate.Date < financialYearStart
            ? financialYearStart
            : new DateTime(joinDate.Year, joinDate.Month, 1);
        var currentMonth = new DateTime(today.Year, today.Month, 1);

        if (accrualStart > currentMonth) return 0;

        return ((currentMonth.Year - accrualStart.Year) * 12) + currentMonth.Month - accrualStart.Month + 1;
    }
}
