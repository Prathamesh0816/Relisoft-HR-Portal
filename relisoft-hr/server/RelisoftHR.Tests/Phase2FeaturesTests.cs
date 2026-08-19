using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RelisoftHR.Controllers;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.Security.Claims;

namespace RelisoftHR.Tests;

public class Phase2FeaturesTests
{
    [Fact]
    public async Task Encashment_RejectsExcessDays()
    {
        var db = TestDbContext.Create();
        SeedLeaveBalance(db, 1, 5);
        var controller = NewController(db);
        controller.ControllerContext = ControllerContext(1);

        var result = await controller.RequestEncashment(new EncashmentRequest(1, 10, 0, "test"));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Empty(db.LeaveEncashments);
    }

    [Fact]
    public async Task Encashment_ValidRequest_ReturnsOk()
    {
        var db = TestDbContext.Create();
        SeedLeaveBalance(db, 1, 5);
        var controller = NewController(db);
        controller.ControllerContext = ControllerContext(1);

        var result = await controller.RequestEncashment(new EncashmentRequest(1, 2, 500, "test"));

        Assert.IsType<OkObjectResult>(result);
        Assert.True(db.LeaveEncashments.Any());
        Assert.True(db.AuditLogEntries.Any());
    }

    [Fact]
    public async Task AuditLog_RejectsNonAdmin()
    {
        var db = TestDbContext.Create();
        var controller = NewController(db);
        controller.ControllerContext = ControllerContext(3); // Aradhana (Employee role)

        var result = await controller.GetAuditLog(null, null);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Regularization_RejectsForeignRecord()
    {
        var db = TestDbContext.Create();
        db.AttendanceRecords.Add(new AttendanceRecord { EmployeeId = 1, Date = DateTime.UtcNow.Date, ClockIn = DateTime.UtcNow, Status = "Present" });
        db.SaveChanges();
        var controller = NewController(db);
        controller.ControllerContext = ControllerContext(3); // different employee

        var result = await controller.RequestRegularization(new RegularizationRequest(db.AttendanceRecords.First().Id, "LateArrival", "traffic"));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Empty(db.AttendanceRegularizations);
    }

    [Fact]
    public async Task Regularization_OwnRecord_ReturnsOk()
    {
        var db = TestDbContext.Create();
        db.AttendanceRecords.Add(new AttendanceRecord { EmployeeId = 1, Date = DateTime.UtcNow.Date, ClockIn = DateTime.UtcNow, Status = "Present" });
        db.SaveChanges();
        var controller = NewController(db);
        controller.ControllerContext = ControllerContext(1);

        var result = await controller.RequestRegularization(new RegularizationRequest(db.AttendanceRecords.First().Id, "LateArrival", "traffic"));

        Assert.IsType<OkObjectResult>(result);
        Assert.True(db.AttendanceRegularizations.Any());
    }

    private static void SeedLeaveBalance(AppDbContext db, int employeeId, decimal remaining)
    {
        db.EmployeeLeaveBalances.Add(new EmployeeLeaveBalance
        {
            EmployeeId = employeeId,
            LeaveTypeId = 1,
            AllocatedLeaves = 12,
            UsedLeaves = 12 - remaining,
            RemainingLeaves = remaining,
            FinancialYear = "FY 2026-27"
        });
        db.SaveChanges();
    }

    private static Phase2FeaturesController NewController(AppDbContext db)
    {
        var config = new ConfigurationBuilder().Build();
        var email = new EmailService(new NullLogger<EmailService>(), config);
        var notif = new NotificationHelper(email, new NotificationService(db, new NullLogger<NotificationService>()), db, new NullLogger<NotificationHelper>());
        return new Phase2FeaturesController(db, new AuditLogService(db), email, notif);
    }

    private static ControllerContext ControllerContext(int employeeId)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, employeeId.ToString())
        }, "Test"));
        return new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };
    }
}