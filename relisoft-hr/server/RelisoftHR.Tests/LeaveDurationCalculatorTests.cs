using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class LeaveDurationCalculatorTests
{
    [Theory]
    [InlineData("2026-08-02", "2026-08-04", 3)]
    [InlineData("2026-08-10", "2026-08-11", 2)]
    [InlineData("2026-08-15", "2026-08-15", 1)]
    public void CalculateInclusive_CountsBothStartAndEndDates(string from, string to, decimal expectedDays)
    {
        var result = LeaveDurationCalculator.CalculateInclusive(
            DateTime.Parse(from), DateTime.Parse(to), isHalfDay: false);

        Assert.Equal(expectedDays, result);
    }

    [Fact]
    public void CalculateInclusive_SameDayHalfDay_ReturnsPointFive()
    {
        var date = new DateTime(2026, 8, 15);

        var result = LeaveDurationCalculator.CalculateInclusive(date, date, isHalfDay: true);

        Assert.Equal(0.5m, result);
    }

    [Fact]
    public void CalculateInclusive_HalfDayAcrossMultipleDates_IsRejected()
    {
        Assert.Throws<ArgumentException>(() => LeaveDurationCalculator.CalculateInclusive(
            new DateTime(2026, 8, 15), new DateTime(2026, 8, 16), isHalfDay: true));
    }
}
