using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
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
        _controller = new LeaveController(_db, emailService, notif, logger);
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
    public async Task GetReviewerRequests_EmployeeReviewerSeesDirectReportsPendingLeave()
    {
        _db.Projects.Add(new RelisoftHR.Models.Project { Id = 1, Name = "Relisoft HR Portal" });
        _db.Teams.Add(new RelisoftHR.Models.Team
        {
            Id = 1,
            Name = "Backend",
            ProjectId = 1,
            LeadId = 3
        });
        _db.Employees.Add(new RelisoftHR.Models.Employee
        {
            Id = 10,
            EmployeeCode = "EMP-010",
            FullName = "Chirag Patil",
            Email = "chirag.patil@relisofttechnologies.com",
            Department = "Engineering",
            Designation = "Software Engineer",
            RoleId = 1,
            PrimaryTeamId = 1
        });
        _db.LeaveApplications.Add(new RelisoftHR.Models.LeaveApplication
        {
            Id = 19,
            EmployeeId = 10,
            LeaveTypeId = 9,
            FromDate = new DateTime(2026, 8, 13),
            ToDate = new DateTime(2026, 8, 13),
            TotalDays = 1,
            Reason = "Floater holiday",
            Status = "Pending"
        });
        await _db.SaveChangesAsync();

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetReviewerRequests(3));
        var requestsProperty = ok.Value!.GetType().GetProperty("Requests");
        var requests = Assert.IsType<List<object>>(requestsProperty?.GetValue(ok.Value));
        var request = Assert.IsType<LeaveRequestDto>(Assert.Single(requests));

        Assert.Equal(10, request.EmployeeId);
        Assert.Equal("Chirag Patil", request.EmployeeName);
        Assert.Equal("Pending", request.Status);
    }

    [Fact]
    public async Task MakeDecision_ApproveLeave_UpdatesStatus()
    {
        await _controller.ApplyLeave(new ApplyLeaveRequest(3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "Sick"));
        SetAuthenticatedEmployee(1);

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
        SetAuthenticatedEmployee(1);

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
        SetAuthenticatedEmployee(1);

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
        var application = _db.LeaveApplications.Single();
        SetAuthenticatedEmployee(1);
        await _controller.MakeDecision(new ReviewerDecisionRequest(application.Id, 1, "approve"));

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetCalendar(new DateTime(2026, 7, 1), new DateTime(2026, 7, 31)));
        var leavesProperty = ok.Value!.GetType().GetProperty("Leaves");
        var events = Assert.IsType<List<CalendarEvent>>(leavesProperty?.GetValue(ok.Value));
        var calendarEvent = Assert.Single(events);
        Assert.Equal(3, calendarEvent.EmployeeId);
        Assert.Equal(new DateTime(2026, 7, 20), calendarEvent.FromDate);
    }

    [Fact]
    public async Task ApplyLeave_DuplicateActiveRequest_IsRejected()
    {
        var request = new ApplyLeaveRequest(
            3, 1, new DateTime(2026, 7, 20), new DateTime(2026, 7, 20), false, "First request");
        Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(request));

        var duplicate = await _controller.ApplyLeave(request with { Reason = "Duplicate request" });

        Assert.IsType<BadRequestObjectResult>(duplicate);
        Assert.Single(_db.LeaveApplications);
    }

    [Fact]
    public async Task Calendar_AsEmployee_ReturnsOnlyOwnApprovedLeaves()
    {
        _db.LeaveApplications.AddRange(
            new RelisoftHR.Models.LeaveApplication
            {
                EmployeeId = 3, LeaveTypeId = 1,
                FromDate = new DateTime(2026, 7, 20), ToDate = new DateTime(2026, 7, 20),
                TotalDays = 1, Status = "Approved", Reason = "My leave"
            },
            new RelisoftHR.Models.LeaveApplication
            {
                EmployeeId = 1, LeaveTypeId = 1,
                FromDate = new DateTime(2026, 7, 21), ToDate = new DateTime(2026, 7, 21),
                TotalDays = 1, Status = "Approved", Reason = "Another employee leave"
            }
        );
        await _db.SaveChangesAsync();
        SetAuthenticatedEmployee(3);

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetCalendar(new DateTime(2026, 7, 1), new DateTime(2026, 7, 31)));
        var leavesProperty = ok.Value!.GetType().GetProperty("Leaves");
        var events = Assert.IsType<List<CalendarEvent>>(leavesProperty?.GetValue(ok.Value));

        var calendarEvent = Assert.Single(events);
        Assert.Equal(3, calendarEvent.EmployeeId);
    }

    [Fact]
    public async Task Calendar_DeduplicatesEquivalentApprovedRecords()
    {
        _db.LeaveApplications.AddRange(
            new RelisoftHR.Models.LeaveApplication
            {
                EmployeeId = 3, LeaveTypeId = 1,
                FromDate = new DateTime(2026, 7, 20), ToDate = new DateTime(2026, 7, 20),
                TotalDays = 1, Status = "Approved", Reason = "Original"
            },
            new RelisoftHR.Models.LeaveApplication
            {
                EmployeeId = 3, LeaveTypeId = 1,
                FromDate = new DateTime(2026, 7, 20), ToDate = new DateTime(2026, 7, 20),
                TotalDays = 1, Status = "Approved", Reason = "Duplicate"
            }
        );
        await _db.SaveChangesAsync();
        SetAuthenticatedEmployee(3);

        var ok = Assert.IsType<OkObjectResult>(await _controller.GetCalendar(new DateTime(2026, 7, 1), new DateTime(2026, 7, 31)));
        var leavesProperty = ok.Value!.GetType().GetProperty("Leaves");
        var events = Assert.IsType<List<CalendarEvent>>(leavesProperty?.GetValue(ok.Value));

        Assert.Single(events);
    }

    [Fact]
    public async Task ApplyFloaterHoliday_AnySelectedDate_IsNotLossOfPay()
    {
        var ok = Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 9, new DateTime(2026, 7, 29), new DateTime(2026, 7, 29), false, "Selected floater date")));

        var lossOfPay = ok.Value!.GetType().GetProperty("lossOfPay")?.GetValue(ok.Value);
        Assert.Equal(false, lossOfPay);
        Assert.False(_db.LeaveApplications.Single().LossOfPay);
    }

    [Fact]
    public async Task ApplyFloaterHoliday_DateNeedNotBeInHolidayCalendar()
    {
        var result = await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 9, new DateTime(2026, 7, 29), new DateTime(2026, 7, 29), false, "Employee-selected date"));

        Assert.IsType<OkObjectResult>(result);
        Assert.Single(_db.LeaveApplications);
    }

    [Fact]
    public async Task ApplyFloaterHoliday_PendingRequestsReserveAnnualLimit()
    {
        Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 9, new DateTime(2026, 8, 28), new DateTime(2026, 8, 28), false, "First")));
        Assert.IsType<OkObjectResult>(await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 9, new DateTime(2026, 10, 20), new DateTime(2026, 10, 20), false, "Second")));

        var third = await _controller.ApplyLeave(new ApplyLeaveRequest(
            3, 9, new DateTime(2026, 8, 28), new DateTime(2026, 8, 28), false, "Third"));
        Assert.IsType<BadRequestObjectResult>(third);
        Assert.Equal(2, _db.LeaveApplications.Count());
    }

    [Fact]
    public async Task ApproveFloaterHoliday_RechecksAnnualLimit()
    {
        _db.LeaveApplications.AddRange(
            new RelisoftHR.Models.LeaveApplication { EmployeeId = 3, LeaveTypeId = 9, FromDate = new DateTime(2026, 8, 28), ToDate = new DateTime(2026, 8, 28), TotalDays = 1, Status = "Approved" },
            new RelisoftHR.Models.LeaveApplication { EmployeeId = 3, LeaveTypeId = 9, FromDate = new DateTime(2026, 10, 20), ToDate = new DateTime(2026, 10, 20), TotalDays = 1, Status = "Approved" }
        );
        var pending = new RelisoftHR.Models.LeaveApplication { EmployeeId = 3, LeaveTypeId = 9, FromDate = new DateTime(2026, 8, 28), ToDate = new DateTime(2026, 8, 28), TotalDays = 1, Status = "Pending" };
        _db.LeaveApplications.Add(pending);
        await _db.SaveChangesAsync();
        SetAuthenticatedEmployee(1);

        var result = await _controller.MakeDecision(new ReviewerDecisionRequest(pending.Id, 1, "approve"));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Pending", pending.Status);
    }

    [Fact]
    public async Task CheckFloaterBalance_UsesSelectedLeaveYear()
    {
        _db.LeaveApplications.Add(new RelisoftHR.Models.LeaveApplication
        {
            EmployeeId = 3, LeaveTypeId = 9,
            FromDate = new DateTime(2027, 1, 15), ToDate = new DateTime(2027, 1, 15),
            TotalDays = 1, Status = "Approved", AppliedOn = new DateTime(2026, 12, 1)
        });
        await _db.SaveChangesAsync();

        var ok = Assert.IsType<OkObjectResult>(await _controller.CheckBalance(3, 9, 2027));
        var remaining = ok.Value!.GetType().GetProperty("remaining")?.GetValue(ok.Value);
        Assert.Equal(1, remaining);
    }

    [Fact]
    public async Task GetHolidays_ReturnsIsoDate()
    {
        _db.Holidays.Add(new RelisoftHR.Models.Holiday
        {
            Name = "Republic Day",
            Date = new DateOnly(2026, 1, 26),
            Type = "Fixed"
        });
        await _db.SaveChangesAsync();

        var result = await _controller.GetHolidays(2026);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var holidays = Assert.IsType<List<HolidayDto>>(ok.Value);
        Assert.Contains(holidays, holiday => holiday.Name == "Republic Day" && holiday.Date == "2026-01-26");
    }
}
