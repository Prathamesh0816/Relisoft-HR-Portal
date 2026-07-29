using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class LeaveBalanceServiceTests : IDisposable
{
    private readonly AppDbContext _db = TestDbContext.Create();
    private readonly LeaveBalanceService _service;

    public LeaveBalanceServiceTests() => _service = new LeaveBalanceService(_db);

    public void Dispose() => _db.Dispose();

    [Theory]
    [InlineData(2026, 4, 15, 4)]
    [InlineData(2026, 5, 10, 3)]
    [InlineData(2026, 6, 5, 2)]
    [InlineData(2026, 7, 20, 1)]
    [InlineData(2026, 8, 15, 0)]
    public async Task PlannedLeave_IsAccruedFromJoiningMonthWithinFinancialYear(int year, int month, int day, decimal expected)
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(year, month, day);
        await _db.SaveChangesAsync();

        var balance = await _service.GetBalanceAsync(3, 2, new DateTime(2026, 7, 22));

        Assert.NotNull(balance);
        Assert.Equal(expected, balance!.AllocatedLeaves);
    }

    [Fact]
    public async Task PlannedLeave_CountsOnlyApprovedLeaveInCurrentFinancialYear()
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2026, 4, 15);
        _db.LeaveApplications.AddRange(
            new LeaveApplication { EmployeeId = 3, LeaveTypeId = 2, FromDate = new DateTime(2026, 6, 10), ToDate = new DateTime(2026, 6, 11), TotalDays = 2, Reason = "Approved", Status = "Approved" },
            new LeaveApplication { EmployeeId = 3, LeaveTypeId = 2, FromDate = new DateTime(2026, 7, 10), ToDate = new DateTime(2026, 7, 10), TotalDays = 1, Reason = "Pending", Status = "Pending" },
            new LeaveApplication { EmployeeId = 3, LeaveTypeId = 2, FromDate = new DateTime(2026, 7, 11), ToDate = new DateTime(2026, 7, 11), TotalDays = 1, Reason = "Cancelled", Status = "Cancelled" });
        await _db.SaveChangesAsync();

        var balance = await _service.GetBalanceAsync(3, 2, new DateTime(2026, 7, 22));

        Assert.NotNull(balance);
        Assert.Equal(4, balance!.AllocatedLeaves);
        Assert.Equal(2, balance.UsedLeaves);
        Assert.Equal(2, balance.RemainingLeaves);
    }

    [Theory]
    [InlineData(3, 3, 1)]
    [InlineData(2.5, 2.5, 1.5)]
    public async Task PlannedLeave_SnapshotUsesApprovedPaidDuration(decimal requestedDays, decimal expectedUsed, decimal expectedRemaining)
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2026, 4, 15); // Four days earned as of July.
        _db.LeaveApplications.Add(new LeaveApplication
        {
            EmployeeId = 3, LeaveTypeId = 2,
            FromDate = new DateTime(2026, 7, 10), ToDate = new DateTime(2026, 7, 12),
            TotalDays = requestedDays, PaidLeaveDays = requestedDays,
            Reason = "Approved", Status = "Approved"
        });
        await _db.SaveChangesAsync();

        var balance = await _service.GetBalanceAsync(3, 2, new DateTime(2026, 7, 22));

        Assert.NotNull(balance);
        Assert.Equal(4, balance!.AllocatedLeaves);
        Assert.Equal(expectedUsed, balance.UsedLeaves);
        Assert.Equal(expectedRemaining, balance.RemainingLeaves);
    }

    [Fact]
    public async Task ValidateLeaveBalance_CapsPaidLeaveAndReportsDecimalLop()
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2026, 7, 1); // One day earned as of July.
        await _db.SaveChangesAsync();

        var validation = await _service.ValidateLeaveBalanceAsync(3, 2, new DateTime(2026, 7, 10), 1.5m);

        Assert.Equal(1, validation.AvailableBalance);
        Assert.Equal(1, validation.PaidLeaveDays);
        Assert.Equal(0.5m, validation.LopDays);
    }

    [Fact]
    public async Task PlannedLeave_RestartsWhenFinancialYearChanges()
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2024, 1, 15);
        await _db.SaveChangesAsync();

        var balance = await _service.GetBalanceAsync(3, 2, new DateTime(2027, 4, 1));

        Assert.NotNull(balance);
        Assert.Equal(1, balance!.AllocatedLeaves);
    }

    [Fact]
    public async Task PlannedLeave_RemainsUsedDuringCancellationRequest_AndIsRestoredWhenCancelled()
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2026, 4, 15);
        var leave = new LeaveApplication
        {
            EmployeeId = 3, LeaveTypeId = 2,
            FromDate = new DateTime(2026, 6, 10), ToDate = new DateTime(2026, 6, 11),
            TotalDays = 2, Reason = "Approved", Status = "CancellationRequested"
        };
        _db.LeaveApplications.Add(leave);
        await _db.SaveChangesAsync();

        var pendingCancellation = await _service.GetBalanceAsync(3, 2, new DateTime(2026, 7, 22));
        Assert.Equal(2, pendingCancellation!.UsedLeaves);

        leave.Status = "Cancelled";
        await _db.SaveChangesAsync();
        var approvedCancellation = await _service.GetBalanceAsync(3, 2, new DateTime(2026, 7, 22));
        Assert.Equal(0, approvedCancellation!.UsedLeaves);
        Assert.Equal(4, approvedCancellation.RemainingLeaves);
    }

    [Fact]
    public async Task PlannedLeave_IgnoresLegacyBalanceCountersAndNeverReturnsInvalidSnapshotValues()
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2026, 4, 15);
        _db.EmployeeLeaveBalances.Add(new EmployeeLeaveBalance
        {
            EmployeeId = 3, LeaveTypeId = 2,
            AllocatedLeaves = 4, UsedLeaves = -29, RemainingLeaves = 33
        });
        _db.LeaveApplications.Add(new LeaveApplication
        {
            EmployeeId = 3, LeaveTypeId = 2,
            FromDate = new DateTime(2026, 7, 10), ToDate = new DateTime(2026, 7, 10),
            TotalDays = 1, Reason = "Approved", Status = "Approved"
        });
        await _db.SaveChangesAsync();

        var balance = await _service.GetBalanceAsync(3, 2, new DateTime(2026, 7, 22));

        Assert.NotNull(balance);
        Assert.Equal(4, balance!.AllocatedLeaves);
        Assert.Equal(1, balance.UsedLeaves);
        Assert.Equal(3, balance.RemainingLeaves);
    }
}
