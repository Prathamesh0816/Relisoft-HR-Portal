using Microsoft.Extensions.Logging.Abstractions;
using RelisoftHR.Models;
using RelisoftHR.Services;
using Microsoft.Extensions.Configuration;

namespace RelisoftHR.Tests;

public class EmailServiceTests
{
    private readonly EmailService _service;

    public EmailServiceTests()
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        _service = new EmailService(new NullLogger<EmailService>(), config);
    }

    [Fact]
    public async Task SendEmailAsync_LogsMessage()
    {
        var exception = await Record.ExceptionAsync(() =>
            _service.SendEmailAsync("test@relisofttechnologies.com", "Subject", "<p>Body</p>"));
        Assert.Null(exception);
    }

    [Fact]
    public void LeaveSubmittedTemplate_ContainsEmployeeName()
    {
        var emp = new Employee { FullName = "Aradhana Shinde", Email = "a@b.com" };
        var lt = new LeaveType { Name = "Sick/Casual Leave" };
        var html = EmailTemplates.LeaveSubmitted(emp, lt, DateTime.Today, DateTime.Today, 1, "Preeti Patil");
        Assert.Contains("Aradhana Shinde", html);
        Assert.Contains("Sick/Casual Leave", html);
        Assert.Contains("Preeti Patil", html);
    }

    [Fact]
    public void LeaveApprovedTemplate_ContainsDecision()
    {
        var app = new LeaveApplication
        {
            Employee = new Employee { FullName = "Aradhana Shinde" },
            LeaveType = new LeaveType { Name = "Planned Leave" },
            FromDate = new DateTime(2026, 8, 10),
            ToDate = new DateTime(2026, 8, 12),
            TotalDays = 3,
            ApprovalReason = "Approved"
        };
        var html = EmailTemplates.LeaveApproved(app);
        Assert.Contains("approved", html, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Aradhana Shinde", html);
    }

    [Fact]
    public void LeaveRejectedTemplate_ContainsReason()
    {
        var app = new LeaveApplication
        {
            Employee = new Employee { FullName = "Aradhana Shinde" },
            LeaveType = new LeaveType { Name = "Planned Leave" },
            ApprovalReason = "Team understaffed"
        };
        var html = EmailTemplates.LeaveRejected(app);
        Assert.Contains("rejected", html, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Team understaffed", html);
    }

    [Fact]
    public void CancellationRequestedTemplate_HasActionRequired()
    {
        var app = new LeaveApplication
        {
            Id = 1,
            Employee = new Employee { FullName = "Aradhana Shinde" },
            LeaveType = new LeaveType { Name = "Planned Leave" },
            FromDate = new DateTime(2026, 8, 10),
            ToDate = new DateTime(2026, 8, 12),
            CancellationReason = "No longer needed"
        };
        var approver = new Employee { FullName = "Preeti Patil" };
        var html = EmailTemplates.CancellationRequested(app, approver, "No longer needed");
        Assert.Contains("Cancellation Request", html);
        Assert.Contains("No longer needed", html);
    }

    [Fact]
    public void CancellationDecisionTemplate_ShowsResult()
    {
        var app = new LeaveApplication
        {
            Employee = new Employee { FullName = "Aradhana Shinde" },
            LeaveType = new LeaveType { Name = "Planned Leave" }
        };
        var htmlApproved = EmailTemplates.CancellationDecision(app, true, null);
        Assert.Contains("approved", htmlApproved, StringComparison.OrdinalIgnoreCase);

        var htmlRejected = EmailTemplates.CancellationDecision(app, false, "Too late");
        Assert.Contains("rejected", htmlRejected, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Too late", htmlRejected);
    }

    [Fact]
    public void CompOffTransferredTemplate_ContainsBothNames()
    {
        var from = new Employee { FullName = "Rakesh Patil" };
        var to = new Employee { FullName = "Preeti Patil" };
        var html = EmailTemplates.CompOffTransferred(from, to, 2, "Thanks");
        Assert.Contains("Rakesh Patil", html);
        Assert.Contains("Preeti Patil", html);
        Assert.Contains("2", html);
    }
}
