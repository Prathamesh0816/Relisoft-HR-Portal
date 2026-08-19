using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public interface ILeaveAccrualService
{
    Task<decimal?> EnsureAccruedAsync(int employeeId, int leaveTypeId, DateTime asOf);
}

/// <summary>
/// Lazily accrues the annual entitlement for a leave type on the first application
/// within a financial year, mirroring the HRMS lazy-accrual behaviour. The allocation
/// is derived from <see cref="LeaveType.DefaultDaysPerYear"/> and recorded in
/// <see cref="LeaveAccrualLog"/>. Planned Leave stays dynamic, and Comp Off / Floater
/// holidays keep their own mechanisms, so only stored-balance leave types are accrued.
/// </summary>
public sealed class LeaveAccrualService : ILeaveAccrualService
{
    private const string PlannedLeaveName = "Planned Leave";
    private readonly AppDbContext _db;

    public LeaveAccrualService(AppDbContext db) => _db = db;

    public async Task<decimal?> EnsureAccruedAsync(int employeeId, int leaveTypeId, DateTime asOf)
    {
        var leaveType = await _db.LeaveTypes.AsNoTracking().SingleOrDefaultAsync(type => type.Id == leaveTypeId);
        if (leaveType == null) return null;

        if (leaveType.Name == PlannedLeaveName || leaveType.IsCompOff || leaveType.IsFloaterHoliday || leaveType.DefaultDaysPerYear <= 0)
            return null;

        var financialYear = LeaveCarryForwardService.GetFinancialYearFor(asOf);

        var existing = await _db.EmployeeLeaveBalances
            .SingleOrDefaultAsync(balance => balance.EmployeeId == employeeId && balance.LeaveTypeId == leaveTypeId);
        if (existing != null)
        {
            if (existing.FinancialYear == financialYear || string.IsNullOrEmpty(existing.FinancialYear))
                return existing.AllocatedLeaves;
            return existing.AllocatedLeaves;
        }

        var allocated = leaveType.DefaultDaysPerYear;
        _db.EmployeeLeaveBalances.Add(new EmployeeLeaveBalance
        {
            EmployeeId = employeeId,
            LeaveTypeId = leaveTypeId,
            AllocatedLeaves = allocated,
            UsedLeaves = 0,
            RemainingLeaves = allocated,
            FinancialYear = financialYear
        });

        _db.LeaveAccrualLogs.Add(new LeaveAccrualLog
        {
            EmployeeId = employeeId,
            LeaveTypeId = leaveTypeId,
            AccruedDays = allocated,
            AccrualDate = DateTime.UtcNow,
            Period = financialYear
        });

        await _db.SaveChangesAsync();
        return allocated;
    }
}