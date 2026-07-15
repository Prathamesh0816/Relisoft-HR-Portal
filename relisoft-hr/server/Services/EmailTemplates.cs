using RelisoftHR.Models;

namespace RelisoftHR.Services;

public static class EmailTemplates
{
    private const string AppName = "Relisoft HR Portal";

    private static string Shell(string title, string contentHtml, string statusColor = "#f5a623")
    {
        return $@"<!DOCTYPE html>
<html>
<head><style>
body {{ margin:0; padding:0; font-family:'Inter',Arial,sans-serif; background:#f8fafc; }}
.container {{ max-width:600px; margin:0 auto; }}
.header {{ background:{statusColor}; padding:28px 24px; text-align:center; }}
.header h2 {{ margin:0; font-size:22px; font-weight:700; letter-spacing:-.02em; }}
.header .gold-text {{ color:#001428 !important; }}
.header .white-text {{ color:#ffffff !important; }}
.logo-row {{ background:#001428; padding:16px 24px; text-align:center; }}
.logo-row img {{ height:32px; }}
.content {{ background:#fff; padding:28px 24px; color:#001428; font-size:14px; line-height:1.6; }}
.content p {{ margin:0 0 12px; }}
.table {{ width:100%; border-collapse:collapse; margin:16px 0; border-radius:8px; overflow:hidden; }}
.table td {{ padding:10px 14px; border-bottom:1px solid rgba(0,20,40,.08); font-size:13px; }}
.table tr:last-child td {{ border-bottom:none; }}
.table td:first-child {{ font-weight:600; color:rgba(0,20,40,.6); width:40%; background:#f8fafc; }}
.footer {{ background:#001428; padding:20px 24px; text-align:center; font-size:11px; color:rgba(255,255,255,.5); }}
.footer p {{ margin:0; }}
</style></head>
<body>
<div class='container'>
<div class='logo-row'><img src='https://relisofttechnologies.com/images/optimized/logo.webp' alt='Relisoft'/></div>
<div class='header'><h2 class='{(statusColor == "#f5a623" ? "gold-text" : "white-text")}'>{title}</h2></div>
<div class='content'>{contentHtml}</div>
<div class='footer'><p>{AppName} &mdash; Relisoft Technologies</p></div>
</div>
</body>
</html>";
    }

    private static string TableRow(string label, string value) =>
        $"<tr><td>{label}</td><td>{value}</td></tr>";

    public static string LeaveSubmitted(Employee employee, LeaveType leaveType, DateTime from, DateTime to, decimal days, string approverName)
    {
        var fromStr = from.ToString("dd-MMM-yyyy");
        var toStr = to.ToString("dd-MMM-yyyy");
        return Shell("Leave Request Submitted", $@"
<p>Dear <b>{employee.FullName}</b>,</p>
<p>Your leave request has been submitted and is pending approval from <b>{approverName}</b>.</p>
<table class='table'>
{TableRow("Leave Type", leaveType.Name)}
{TableRow("From", fromStr)}
{TableRow("To", toStr)}
{TableRow("Total Days", days.ToString())}
</table>
<p>You will receive another email once a decision is made.</p>");
    }

    public static string LeaveApproved(LeaveApplication leave) => DecisionEmail(leave, "APPROVED", "#16a34a");
    public static string LeaveRejected(LeaveApplication leave) => DecisionEmail(leave, "REJECTED", "#e11d48");

    private static string DecisionEmail(LeaveApplication leave, string statusText, string statusColor)
    {
        var days = leave.TotalDays > 0 ? leave.TotalDays : (decimal)((leave.ToDate - leave.FromDate).Days + 1);
        var fromStr = leave.FromDate.ToString("dd-MMM-yyyy");
        var toStr = leave.ToDate.ToString("dd-MMM-yyyy");
        return Shell($"Leave Request {statusText}", $@"
<p>Dear {leave.Employee?.FullName},</p>
<p>Your leave request has been <b>{leave.Status.ToLower()}</b>.</p>
<table class='table'>
{TableRow("Leave Type", leave.LeaveType?.Name ?? "")}
{TableRow("From", fromStr)}
{TableRow("To", toStr)}
{TableRow("Total Days", days.ToString())}
</table>
{(string.IsNullOrEmpty(leave.ApprovalReason) ? "" : $"<p><b>Reason:</b> {leave.ApprovalReason}</p>")}", statusColor);
    }

    public static string CancellationRequested(LeaveApplication leave, Employee approver, string reason)
    {
        var fromStr = leave.FromDate.ToString("dd-MMM-yyyy");
        var toStr = leave.ToDate.ToString("dd-MMM-yyyy");
        return Shell("Cancellation Request", $@"
<p>Dear <b>{approver.FullName}</b>,</p>
<p>{leave.Employee?.FullName} has requested to cancel their leave.</p>
<table class='table'>
{TableRow("Leave Type", leave.LeaveType?.Name ?? "")}
{TableRow("From", fromStr)}
{TableRow("To", toStr)}
{TableRow("Cancellation Reason", reason)}
</table>
<p>Please review this request in the Relisoft HR Portal.</p>", "#ea580c");
    }

    public static string CancellationDecision(LeaveApplication leave, bool approved, string? reason)
    {
        var statusColor = approved ? "#16a34a" : "#e11d48";
        var fromStr = leave.FromDate.ToString("dd-MMM-yyyy");
        var toStr = leave.ToDate.ToString("dd-MMM-yyyy");
        return Shell($"Cancellation {(approved ? "Approved" : "Rejected")}", $@"
<p>Dear {leave.Employee?.FullName},</p>
<p>Your cancellation request for <b>{leave.LeaveType?.Name}</b> ({fromStr} to {toStr}) has been <b>{(approved ? "approved" : "rejected")}</b>.</p>
{(string.IsNullOrEmpty(reason) ? "" : $"<p><b>Reason:</b> {reason}</p>")}", statusColor);
    }

    public static string CompOffTransferred(Employee from, Employee to, decimal days, string? reason)
    {
        return Shell("Comp-Off Transfer", $@"
<p>Dear {to.FullName},</p>
<p><b>{from.FullName}</b> has transferred <b>{days}</b> comp-off day(s) to you.</p>
{(string.IsNullOrEmpty(reason) ? "" : $"<p><b>Reason:</b> {reason}</p>")}");
    }

    public static string CompOffAccrued(Employee employee, decimal days, string? reason)
    {
        return Shell("Comp-Off Credited", $@"
<p>Dear {employee.FullName},</p>
<p><b>{days}</b> comp-off day(s) have been credited to your balance.</p>
{(string.IsNullOrEmpty(reason) ? "" : $"<p><b>Reason:</b> {reason}</p>")}");
    }

    /* ── New feature templates ── */

    public static string TicketCreated(string employeeName, string ticketSubject, string ticketId)
    {
        return Shell("Ticket Created", $@"
<p>Dear {employeeName},</p>
<p>Your ticket <b>#{ticketId}</b> has been created successfully.</p>
<table class='table'>
{TableRow("Ticket ID", ticketId)}
{TableRow("Subject", ticketSubject)}
</table>
<p>Our team will review it shortly.</p>");
    }

    public static string TicketUpdated(string employeeName, string ticketSubject, string status, string? comment)
    {
        return Shell("Ticket Updated", $@"
<p>Dear {employeeName},</p>
<p>Your ticket <b>{ticketSubject}</b> has been updated to <b>{status}</b>.</p>
{(string.IsNullOrEmpty(comment) ? "" : $"<p><b>Update:</b> {comment}</p>")}");
    }

    public static string ExpenseSubmitted(string employeeName, string category, decimal amount, string approverName)
    {
        return Shell("Expense Claim Submitted", $@"
<p>Dear {employeeName},</p>
<p>Your expense claim of <b>{amount:C}</b> ({category}) has been submitted for approval to <b>{approverName}</b>.</p>");
    }

    public static string ExpenseDecision(string employeeName, string status, string? reason)
    {
        var sc = status == "Approved" ? "#16a34a" : "#e11d48";
        return Shell($"Expense Claim {status}", $@"
<p>Dear {employeeName},</p>
<p>Your expense claim has been <b>{status.ToLower()}</b>.</p>
{(string.IsNullOrEmpty(reason) ? "" : $"<p><b>Reason:</b> {reason}</p>")}", sc);
    }

    public static string TimesheetSubmitted(string employeeName, string period, string approverName)
    {
        return Shell("Timesheet Submitted", $@"
<p>Dear {employeeName},</p>
<p>Your timesheet for period <b>{period}</b> has been submitted for approval to <b>{approverName}</b>.</p>");
    }

    public static string TimesheetDecision(string employeeName, string period, string status, string? comment)
    {
        var sc = status == "Approved" ? "#16a34a" : "#e11d48";
        return Shell($"Timesheet {status}", $@"
<p>Dear {employeeName},</p>
<p>Your timesheet for <b>{period}</b> has been <b>{status.ToLower()}</b>.</p>
{(string.IsNullOrEmpty(comment) ? "" : $"<p><b>Comment:</b> {comment}</p>")}", sc);
    }

    public static string LoanSubmitted(string employeeName, string loanType, decimal amount, string approverName)
    {
        return Shell("Loan Application Submitted", $@"
<p>Dear {employeeName},</p>
<p>Your loan application for <b>{loanType}</b> of <b>{amount:C}</b> has been submitted for approval to <b>{approverName}</b>.</p>");
    }

    public static string LoanDecision(string employeeName, string loanType, string status, string? reason)
    {
        var sc = status == "Approved" ? "#16a34a" : "#e11d48";
        return Shell($"Loan Application {status}", $@"
<p>Dear {employeeName},</p>
<p>Your loan application for <b>{loanType}</b> has been <b>{status.ToLower()}</b>.</p>
{(string.IsNullOrEmpty(reason) ? "" : $"<p><b>Reason:</b> {reason}</p>")}", sc);
    }

    public static string AssetAssigned(string employeeName, string assetName, string serialNumber)
    {
        return Shell("Asset Assigned", $@"
<p>Dear {employeeName},</p>
<p>An asset has been assigned to you.</p>
<table class='table'>
{TableRow("Asset", assetName)}
{TableRow("Serial No", serialNumber)}
</table>
<p>Please acknowledge receipt in the portal.</p>");
    }

    public static string TrainingEnrolled(string employeeName, string courseName, string startDate)
    {
        return Shell("Training Enrollment", $@"
<p>Dear {employeeName},</p>
<p>You have been enrolled in <b>{courseName}</b> starting <b>{startDate}</b>.</p>
<p>Login to the HR portal for details.</p>");
    }

    public static string VisitorRegistered(string hostName, string visitorName, DateTime visitDate)
    {
        return Shell("Visitor Registration", $@"
<p>Dear {hostName},</p>
<p><b>{visitorName}</b> has been pre-registered to visit you on <b>{visitDate:dd-MMM-yyyy}</b>.</p>");
    }

    public static string ContractorOnboarded(string adminName, string contractorName, string company)
    {
        return Shell("Contractor Onboarded", $@"
<p>Dear {adminName},</p>
<p><b>{contractorName}</b> from <b>{company}</b> has been onboarded as a contractor.</p>");
    }

    public static string OnboardingStepCompleted(string employeeName, string stepName, string completedBy)
    {
        return Shell("Onboarding Step Completed", $@"
<p>Dear {employeeName},</p>
<p>Onboarding step <b>{stepName}</b> has been completed by <b>{completedBy}</b>.</p>");
    }

    public static string BenefitEnrolled(string employeeName, string planName, string effectiveDate)
    {
        return Shell("Benefit Enrollment", $@"
<p>Dear {employeeName},</p>
<p>You have been enrolled in the <b>{planName}</b> benefit plan effective <b>{effectiveDate}</b>.</p>");
    }

    public static string ShiftChanged(string employeeName, string oldShift, string newShift, string effectiveDate)
    {
        return Shell("Shift Change", $@"
<p>Dear {employeeName},</p>
<p>Your shift has been updated.</p>
<table class='table'>
{TableRow("Previous Shift", oldShift)}
{TableRow("New Shift", newShift)}
{TableRow("Effective", effectiveDate)}
</table>");
    }

    public static string RewardsEarned(string employeeName, int points, string reason)
    {
        return Shell("Reward Points Earned", $@"
<p>Dear {employeeName},</p>
<p>You have earned <b>{points}</b> reward points.</p>
{(string.IsNullOrEmpty(reason) ? "" : $"<p><b>Reason:</b> {reason}</p>")}");
    }
}