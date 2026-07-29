namespace RelisoftHR.Services;

/// <summary>
/// The authoritative duration calculation for a leave request. Leave dates are
/// inclusive: both the first and last requested dates count as leave days.
/// </summary>
public static class LeaveDurationCalculator
{
    public static decimal CalculateInclusive(DateTime fromDate, DateTime toDate, bool isHalfDay)
    {
        var start = fromDate.Date;
        var end = toDate.Date;

        if (end < start)
            throw new ArgumentOutOfRangeException(nameof(toDate), "The leave end date cannot be before the start date.");

        if (isHalfDay)
        {
            if (start != end)
                throw new ArgumentException("A half-day leave request must begin and end on the same date.", nameof(toDate));

            return 0.5m;
        }

        return (end - start).Days + 1;
    }
}
