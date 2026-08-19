using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class LeaveAccrualServiceTests : IDisposable
{
    private readonly AppDbContext _db = TestDbContext.Create();
    private readonly LeaveAccrualService _service;

    public LeaveAccrualServiceTests() => _service = new LeaveAccrualService(_db);

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task EnsureAccrued_CreatesBalanceAndLog_OnFirstRequestOfFinancialYear()
    {
        var leaveType = await _db.LeaveTypes.FindAsync(1);
        Assert.NotNull(leaveType);
        leaveType!.DefaultDaysPerYear = 12;
        await _db.SaveChangesAsync();

        var allocated = await _service.EnsureAccruedAsync(3, 1, new DateTime(2026, 7, 22));

        Assert.Equal(12, allocated);
        var balance = await _db.EmployeeLeaveBalances.SingleAsync(b => b.EmployeeId == 3 && b.LeaveTypeId == 1);
        Assert.Equal(12, balance.AllocatedLeaves);
        Assert.Equal(12, balance.RemainingLeaves);
        Assert.Equal("FY2026", balance.FinancialYear);

        var log = await _db.LeaveAccrualLogs.SingleAsync(l => l.EmployeeId == 3 && l.LeaveTypeId == 1);
        Assert.Equal(12, log.AccruedDays);
        Assert.Equal("FY2026", log.Period);
    }

    [Fact]
    public async Task EnsureAccrued_DoesNotDuplicate_WhenBalanceAlreadyExistsForYear()
    {
        var leaveType = await _db.LeaveTypes.FindAsync(1);
        Assert.NotNull(leaveType);
        leaveType!.DefaultDaysPerYear = 12;
        _db.EmployeeLeaveBalances.Add(new EmployeeLeaveBalance
        {
            EmployeeId = 3, LeaveTypeId = 1,
            AllocatedLeaves = 12, UsedLeaves = 2, RemainingLeaves = 10, FinancialYear = "FY2026"
        });
        await _db.SaveChangesAsync();

        var allocated = await _service.EnsureAccruedAsync(3, 1, new DateTime(2026, 7, 22));

        Assert.Equal(12, allocated);
        Assert.Single(_db.EmployeeLeaveBalances.Where(b => b.EmployeeId == 3 && b.LeaveTypeId == 1));
        Assert.Empty(_db.LeaveAccrualLogs.Where(l => l.EmployeeId == 3 && l.LeaveTypeId == 1));
    }

    [Fact]
    public async Task EnsureAccrued_SkipsZeroEntitlementLeaveTypes()
    {
        var leaveType = await _db.LeaveTypes.FindAsync(1);
        Assert.NotNull(leaveType);
        leaveType!.DefaultDaysPerYear = 0;
        await _db.SaveChangesAsync();

        var allocated = await _service.EnsureAccruedAsync(3, 1, new DateTime(2026, 7, 22));

        Assert.Null(allocated);
        Assert.Empty(_db.EmployeeLeaveBalances.Where(b => b.EmployeeId == 3 && b.LeaveTypeId == 1));
        Assert.Empty(_db.LeaveAccrualLogs);
    }

    [Fact]
    public async Task EnsureAccrued_SkipsPlannedCompOffAndFloaterTypes()
    {
        var planned = await _db.LeaveTypes.FindAsync(2);
        Assert.NotNull(planned);
        planned!.DefaultDaysPerYear = 12;
        var floater = await _db.LeaveTypes.FindAsync(9);
        Assert.NotNull(floater);
        floater!.DefaultDaysPerYear = 2;
        await _db.SaveChangesAsync();

        await _service.EnsureAccruedAsync(3, 2, new DateTime(2026, 7, 22));
        await _service.EnsureAccruedAsync(3, 9, new DateTime(2026, 7, 22));

        Assert.Empty(_db.EmployeeLeaveBalances);
        Assert.Empty(_db.LeaveAccrualLogs);
    }
}