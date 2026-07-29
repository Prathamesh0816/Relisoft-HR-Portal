namespace RelisoftHR.Services;

public class LeavePolicyOptions
{
    public int FinancialYearStartMonth { get; set; } = 4;
    public int FinancialYearStartDay { get; set; } = 1;
    public string CarryForwardCheckTimeUtc { get; set; } = "00:30:00";
}
