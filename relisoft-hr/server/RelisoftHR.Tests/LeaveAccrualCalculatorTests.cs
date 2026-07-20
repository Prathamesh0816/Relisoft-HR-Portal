using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class LeaveAccrualCalculatorTests
{
    [Fact]
    public void PlannedLeave_AccruesAnnualEntitlementByMonth()
    {
        var employee = new Employee { JoinDate = new DateTime(2024, 1, 15) };
        var leaveType = new LeaveType { AccruesMonthly = true };
        var balance = new EmployeeLeaveBalance { AllocatedLeaves = 20, UsedLeaves = 2 };

        var result = LeaveAccrualCalculator.Calculate(
            balance, employee, leaveType, new DateTime(2026, 7, 20));

        Assert.Equal(11.67m, result.Allocated);
        Assert.Equal(9.67m, result.Remaining);
    }

    [Fact]
    public void PlannedLeave_ForNewJoiner_StartsFromJoiningMonth()
    {
        var employee = new Employee { JoinDate = new DateTime(2026, 3, 10) };
        var leaveType = new LeaveType { AccruesMonthly = true };
        var balance = new EmployeeLeaveBalance { AllocatedLeaves = 18, UsedLeaves = 1 };

        var result = LeaveAccrualCalculator.Calculate(
            balance, employee, leaveType, new DateTime(2026, 7, 20));

        Assert.Equal(7.5m, result.Allocated);
        Assert.Equal(6.5m, result.Remaining);
    }

    [Fact]
    public void NonMonthlyLeave_KeepsFullAllocation()
    {
        var employee = new Employee { JoinDate = new DateTime(2024, 1, 15) };
        var leaveType = new LeaveType { AccruesMonthly = false };
        var balance = new EmployeeLeaveBalance { AllocatedLeaves = 12, UsedLeaves = 3 };

        var result = LeaveAccrualCalculator.Calculate(
            balance, employee, leaveType, new DateTime(2026, 7, 20));

        Assert.Equal(12m, result.Allocated);
        Assert.Equal(9m, result.Remaining);
    }
}
