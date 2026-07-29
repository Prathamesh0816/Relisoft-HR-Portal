using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using RelisoftHR.Controllers;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Services;
using System.Security.Claims;

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
        _controller = new LeaveController(_db, emailService, notif, logger, new LeaveBalanceService(_db));
        SetAuthenticatedEmployee(3);
    }

    public void Dispose() => _db.Dispose();

    private void SetAuthenticatedEmployee(int employeeId)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, employeeId.ToString()) },
            "TestAuth");
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }

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
    public async Task ApplyLeave_HalfDay_StoresPointFiveDayDuration()
    {
        var result = Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(new ApplyLeaveRequest(
            EmployeeId: 3, LeaveTypeId: 1,
            StartDate: new DateTime(2026, 8, 3), EndDate: new DateTime(2026, 8, 3),
            IsHalfDay: true, Reason: "Morning appointment"
        )));

        Assert.NotNull(result.Value);
        var leave = Assert.Single(_db.LeaveApplications);
        Assert.True(leave.IsHalfDay);
        Assert.Equal(0.5m, leave.TotalDays);
    }

    [Fact]
    public async Task ApplyLeave_InclusiveDateRange_StoresAllCalendarDays()
    {
        _db.EmployeeLeaveBalances.Add(new RelisoftHR.Models.EmployeeLeaveBalance
        {
            EmployeeId = 3, LeaveTypeId = 1,
            AllocatedLeaves = 12, UsedLeaves = 0, RemainingLeaves = 12
        });
        await _db.SaveChangesAsync();

        Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 1, new DateTime(2026, 8, 2), new DateTime(2026, 8, 4), false, "Inclusive duration")));

        Assert.Equal(3, Assert.Single(_db.LeaveApplications).TotalDays);
    }

    [Fact]
    public async Task ApplyLeave_HalfDayAcrossMultipleDates_IsRejected()
    {
        var result = await _controller.ApplyLeave(new ApplyLeaveRequest(
            EmployeeId: 3, LeaveTypeId: 1,
            StartDate: new DateTime(2026, 8, 3), EndDate: new DateTime(2026, 8, 4),
            IsHalfDay: true, Reason: "Invalid half day"
        ));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Empty(_db.LeaveApplications);
    }

    [Fact]
    public async Task HalfDayApprovalAndCancellation_UpdatesStoredBalanceByPointFive()
    {
        _db.EmployeeLeaveBalances.Add(new RelisoftHR.Models.EmployeeLeaveBalance
        {
            EmployeeId = 3,
            LeaveTypeId = 1,
            AllocatedLeaves = 12,
            UsedLeaves = 0,
            RemainingLeaves = 12
        });
        await _db.SaveChangesAsync();

        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1,
            new DateTime(2026, 8, 3), new DateTime(2026, 8, 3), true, "Morning appointment"));
        SetAuthenticatedEmployee(1);
        await _controller.MakeDecision(new ReviewerDecisionRequest(1, 1, "approve"));

        var balance = await _db.EmployeeLeaveBalances.SingleAsync(item => item.EmployeeId == 3 && item.LeaveTypeId == 1);
        Assert.Equal(0.5m, balance.UsedLeaves);
        Assert.Equal(11.5m, balance.RemainingLeaves);

        SetAuthenticatedEmployee(3);
        await _controller.RequestCancellation(1, new RequestCancellationRequest(3, "No longer needed"));
        SetAuthenticatedEmployee(1);
        await _controller.MakeDecision(new ReviewerDecisionRequest(1, 1, "cancel_approve"));

        Assert.Equal(0, balance.UsedLeaves);
        Assert.Equal(12, balance.RemainingLeaves);
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
    public async Task GetEmployeeRequests_ReturnsOnlyAuthenticatedEmployeesRequests()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Mine"));
        _db.LeaveApplications.Add(new RelisoftHR.Models.LeaveApplication
        {
            EmployeeId = 1,
            LeaveTypeId = 1,
            FromDate = new DateTime(2026, 7, 21),
            ToDate = new DateTime(2026, 7, 21),
            TotalDays = 1,
            Reason = "Someone else's",
            Status = "Pending"
        });
        await _db.SaveChangesAsync();

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetEmployeeRequests(3));
        var requests = Assert.IsType<List<object>>(ok.Value);
        var request = Assert.IsType<LeaveRequestDto>(Assert.Single(requests));
        Assert.Equal(3, request.EmployeeId);
    }

    [Fact]
    public async Task GetEmployeeRequests_ForDifferentEmployee_ReturnsForbidden()
    {
        Assert.IsType<ForbidResult>(await _controller.GetEmployeeRequests(1));
    }

    [Fact]
    public async Task GetReviewerRequests_HrRetainsRoleBasedAccess()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Review me"));
        SetAuthenticatedEmployee(1);

        Assert.IsType<OkObjectResult>(await _controller.GetReviewerRequests(1));
    }

    [Fact]
    public async Task GetReviewerRequests_CannotImpersonateAnotherReviewer()
    {
        Assert.IsType<ForbidResult>(await _controller.GetReviewerRequests(1));
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
    public async Task PlannedLeaveApproval_DeductsTheFullApprovedDurationFromSnapshot()
    {
        var employee = await _db.Employees.FindAsync(3);
        Assert.NotNull(employee);
        employee!.JoinDate = new DateTime(2026, 4, 15); // Four planned days earned in July.
        await _db.SaveChangesAsync();

        await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 2, new DateTime(2026, 8, 3), new DateTime(2026, 8, 5), false, "Planned break"));

        var pending = Assert.Single(_db.LeaveApplications);
        Assert.Equal(3, pending.TotalDays);
        Assert.Equal(3, pending.PaidLeaveDays);

        SetAuthenticatedEmployee(1);
        Assert.IsType<OkObjectResult>(await _controller.MakeDecision(
            new ReviewerDecisionRequest(pending.Id, 1, "approve")));

        var snapshot = await new LeaveBalanceService(_db).GetBalanceAsync(3, 2, new DateTime(2026, 7, 29));
        Assert.NotNull(snapshot);
        Assert.Equal(4, snapshot!.AllocatedLeaves);
        Assert.Equal(3, snapshot.UsedLeaves);
        Assert.Equal(1, snapshot.RemainingLeaves);
    }

    [Fact]
    public async Task PlannedLeaveApproval_WithLop_DeductsOnlyTheAvailablePaidDuration()
    {
        var employee = await _db.Employees.FindAsync(3);
        var plannedLeave = await _db.LeaveTypes.FindAsync(2);
        Assert.NotNull(employee);
        Assert.NotNull(plannedLeave);
        employee!.JoinDate = new DateTime(2026, 7, 1); // One planned day earned in July.
        plannedLeave!.RequiresAdvanceNotice = false;
        await _db.SaveChangesAsync();

        await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 2, new DateTime(2026, 7, 30), new DateTime(2026, 7, 31), false,
            "Two days with LOP", ConfirmLossOfPay: true));

        var pending = Assert.Single(_db.LeaveApplications);
        Assert.Equal(1, pending.PaidLeaveDays);
        Assert.Equal(1, pending.LopDays);

        SetAuthenticatedEmployee(1);
        Assert.IsType<OkObjectResult>(await _controller.MakeDecision(
            new ReviewerDecisionRequest(pending.Id, 1, "approve")));

        var approved = await _db.LeaveApplications.FindAsync(pending.Id);
        Assert.NotNull(approved);
        Assert.Equal(1, approved!.PaidLeaveDays);
        Assert.Equal(1, approved.LopDays);

        var snapshot = await new LeaveBalanceService(_db).GetBalanceAsync(3, 2, new DateTime(2026, 7, 31));
        Assert.NotNull(snapshot);
        Assert.Equal(1, snapshot!.UsedLeaves);
        Assert.Equal(0, snapshot.RemainingLeaves);
    }

    [Fact]
    public async Task CancellationApproval_RestoresStoredBalanceExactlyOnce_AndWritesAuditHistory()
    {
        _db.EmployeeLeaveBalances.Add(new RelisoftHR.Models.EmployeeLeaveBalance
        {
            EmployeeId = 3,
            LeaveTypeId = 1,
            AllocatedLeaves = 12,
            UsedLeaves = 0,
            RemainingLeaves = 12
        });
        await _db.SaveChangesAsync();

        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1,
            new DateTime(2026, 7, 20), new DateTime(2026, 7, 22), false, "Personal work"));
        SetAuthenticatedEmployee(1);
        await _controller.MakeDecision(new ReviewerDecisionRequest(1, 1, "approve"));

        var balance = await _db.EmployeeLeaveBalances.SingleAsync(balance => balance.EmployeeId == 3 && balance.LeaveTypeId == 1);
        Assert.Equal(3, balance.UsedLeaves);
        Assert.Equal(9, balance.RemainingLeaves);

        SetAuthenticatedEmployee(3);
        await _controller.RequestCancellation(1, new RequestCancellationRequest(3, "Plans changed"));
        SetAuthenticatedEmployee(1);
        Assert.IsType<OkObjectResult>(await _controller.MakeDecision(new ReviewerDecisionRequest(1, 1, "cancel_approve")));

        Assert.Equal(0, balance.UsedLeaves);
        Assert.Equal(12, balance.RemainingLeaves);
        Assert.Single(_db.LeaveApplicationHistories.Where(history => history.LeaveApplicationId == 1 && history.EventType == "Cancellation Approved"));
        Assert.IsType<ConflictObjectResult>(await _controller.MakeDecision(new ReviewerDecisionRequest(1, 1, "cancel_approve")));
        Assert.Equal(0, balance.UsedLeaves);
        Assert.Equal(12, balance.RemainingLeaves);
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
