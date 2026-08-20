namespace RelisoftHR.Services;

/// <summary>Configuration for the automatic salary disbursement job.</summary>
public class PayrollOptions
{
    /// <summary>UTC time the daily check runs (default 18:00 UTC).</summary>
    public string CheckTimeUtc { get; set; } = "18:00:00";

    /// <summary>Master switch for automatic disbursement.</summary>
    public bool AutoDisburseEnabled { get; set; } = true;

    /// <summary>Catch-up window: pay a missed previous-month run within this many days of the new month.</summary>
    public int CatchUpGraceDays { get; set; } = 5;
}