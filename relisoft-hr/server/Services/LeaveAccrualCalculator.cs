using RelisoftHR.Models;

namespace RelisoftHR.Services;

public readonly record struct LeaveBalanceSnapshot(
    decimal Allocated,
    decimal Used,
    decimal Remaining
);

public static class LeaveAccrualCalculator
{
    public static LeaveBalanceSnapshot Calculate(
        EmployeeLeaveBalance? balance,
        Employee employee,
        LeaveType leaveType,
        DateTime asOf)
    {
        if (balance == null)
            return new LeaveBalanceSnapshot(0, 0, 0);

        var allocated = balance.AllocatedLeaves;
        if (leaveType.AccruesMonthly)
        {
            var asOfDate = asOf.Date;
            var accrualStartMonth = employee.JoinDate.Year == asOfDate.Year
                ? employee.JoinDate.Month
                : 1;

            var accruedMonths = employee.JoinDate.Date > asOfDate
                ? 0
                : Math.Max(0, asOfDate.Month - accrualStartMonth + 1);

            allocated = Math.Round(
                balance.AllocatedLeaves * accruedMonths / 12m,
                2,
                MidpointRounding.AwayFromZero);
        }

        return new LeaveBalanceSnapshot(
            allocated,
            balance.UsedLeaves,
            Math.Max(0, allocated - balance.UsedLeaves));
    }

    public static void RefreshStoredRemaining(
        EmployeeLeaveBalance balance,
        Employee employee,
        LeaveType leaveType,
        DateTime asOf)
    {
        balance.RemainingLeaves = Calculate(balance, employee, leaveType, asOf).Remaining;
        balance.UpdatedOn = DateTime.UtcNow;
    }
}
