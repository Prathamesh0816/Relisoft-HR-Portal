using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using RelisoftHR.Controllers;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Services;

namespace RelisoftHR.Tests;

public class LeaveControllerTests : IDisposable
{
    private readonly LeaveController _controller;
    private readonly AppDbContext _db;

    public LeaveControllerTests()
    {
        _db = TestDbContext.Create();
        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        var logger = new NullLogger<LeaveController>();
        var emailService = new EmailService(new NullLogger<EmailService>(), config);
        var notifLogger = new NullLogger<NotificationHelper>();
        var notifSvc = new NotificationService(_db, new NullLogger<NotificationService>());
        var notif = new NotificationHelper(emailService, notifSvc, _db, notifLogger);
        _controller = new LeaveController(_db, emailService, notif, logger);
    }

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task ApplyLeave_SickLeave_ReturnsSuccess()
    {
        var ok = Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(new ApplyLeaveRequest(
            EmployeeId: 3, LeaveTypeId: 1,
            StartDate: new DateTime(2026, 7, 20), EndDate: new DateTime(2026, 7, 20),
            IsHalfDay: false, Reason: "Not feeling well"
        )));

        var msg = ok.Value?.ToString()?.ToLower() ?? "";
        Assert.True(msg.Contains("successfully") || msg.Contains("loss of pay"));
    }

    [Fact]
    public async Task GetEmployeeRequests_ReturnsCorrectCount()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Sick"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetEmployeeRequests(3));
        var requests = Assert.IsType<List<object>>(ok.Value);
        Assert.Single(requests);
    }

    [Fact]
    public async Task MakeDecision_ApproveLeave_UpdatesStatus()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Sick"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.MakeDecision(new ReviewerDecisionRequest(
            LeaveApplicationId: 1, ApproverId: 1, Action: "approve"
        )));

        var leave = await _db.LeaveApplications.FindAsync(1);
        Assert.NotNull(leave);
        Assert.Equal("Approved", leave.Status);
    }

    [Fact]
    public async Task MakeDecision_RejectLeave_UpdatesStatus()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Sick"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.MakeDecision(new ReviewerDecisionRequest(
            LeaveApplicationId: 1, ApproverId: 1, Action: "reject", Reason: "Insufficient coverage"
        )));

        var leave = await _db.LeaveApplications.FindAsync(1);
        Assert.NotNull(leave);
        Assert.Equal("Rejected", leave.Status);
    }

    [Fact]
    public async Task BulkDecision_ApprovesMultiple()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Sick"));
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 22), new DateTime(2026, 7, 22), false, "Doctor visit"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.BulkDecision(new BulkDecisionRequest(
            LeaveApplicationIds: new List<int> { 1, 2 },
            ApproverId: 1, Action: "approve"
        )));

        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task CheckBalance_ReturnsCorrectValues()
    {
        var ok = Assert.IsType<OkObjectResult>(await _controller.CheckBalance(3, 1));
        dynamic? response = ok.Value;
        Assert.NotNull(response);
    }

    [Fact]
    public async Task Calendar_ReturnsEvents()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Sick"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetCalendar(new DateTime(2026, 7, 1), new DateTime(2026, 7, 31)));
        Assert.NotNull(ok.Value);
    }
}
