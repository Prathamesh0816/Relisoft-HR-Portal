using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
 
namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/benefits")]
[Authorize]
public class BenefitsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;
    public BenefitsController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("plans")]
    public async Task<ActionResult> GetPlans()
    {
        var list = await _db.BenefitPlans.Where(p => p.IsActive).ToListAsync();
        return Ok(list);
    }

    [HttpPost("plans")]
    public async Task<ActionResult> CreatePlan([FromBody] BenefitPlanRequest req)
    {
        var plan = new BenefitPlan
        {
            Name = req.Name, Description = req.Description, Category = req.Category,
            EmployeeCost = req.EmployeeCost, EmployerCost = req.EmployerCost
        };
        _db.BenefitPlans.Add(plan);
        await _db.SaveChangesAsync();
        return Ok(plan);
    }

    [HttpPut("plans/{id}")]
    public async Task<ActionResult> UpdatePlan(int id, [FromBody] BenefitPlanRequest req)
    {
        var p = await _db.BenefitPlans.FindAsync(id);
        if (p == null) return NotFound();
        HttpConcurrency.RequireIfMatch(Request, _db, p);
        p.Name = req.Name;
        p.Description = req.Description;
        p.Category = req.Category;
        p.EmployeeCost = req.EmployeeCost;
        p.EmployerCost = req.EmployerCost;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, p.RowVersion);
        return Ok(p);
    }

    [HttpGet("my-enrollments")]
    public async Task<ActionResult> GetMyEnrollments()
    {
        var empId = GetUserId();
        var list = await _db.BenefitEnrollments
            .Include(e => e.BenefitPlan)
            .Where(e => e.EmployeeId == empId)
            .OrderByDescending(e => e.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("enroll")]
    public async Task<ActionResult> Enroll([FromBody] BenefitEnrollmentRequest req)
    {
        var plan = await _db.BenefitPlans.FindAsync(req.BenefitPlanId);
        if (plan == null || !plan.IsActive) return NotFound(new { message = "Active plan not found" });
        var employeeId = GetUserId();
        var alreadyEnrolled = await _db.BenefitEnrollments.AnyAsync(e =>
            e.EmployeeId == employeeId && e.BenefitPlanId == req.BenefitPlanId && e.Status == "Active");
        if (alreadyEnrolled)
            return Conflict(new { message = "Already enrolled in this plan" });

        var enrollment = new BenefitEnrollment
        {
            EmployeeId = employeeId, BenefitPlanId = req.BenefitPlanId,
            EnrollmentDate = DateTime.UtcNow, EffectiveDate = DateTime.UtcNow,
            Status = "Active", CreatedOn = DateTime.UtcNow
        };
        _db.BenefitEnrollments.Add(enrollment);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(GetUserId());
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Benefit Enrolled",
                $"You have been enrolled in {plan.Name}.", "benefits",
                "Benefit Enrolled", EmailTemplates.BenefitEnrolled(emp.FullName, plan.Name, enrollment.EffectiveDate?.ToString("dd-MMM-yyyy") ?? "N/A"),
                link: "/benefits");
        }

        return Ok(enrollment);
    }

    [HttpPost("enrollments/{id}/cancel")]
    public async Task<ActionResult> CancelEnrollment(int id)
    {
        var e = await _db.BenefitEnrollments.FindAsync(id);
        if (e == null) return NotFound();
        if (e.EmployeeId != GetUserId()) return Forbid();
        if (e.Status != "Active")
            return BadRequest(new { message = "Enrollment is not active" });
        e.Status = "Cancelled";
        e.TerminationDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(e);
    }

    [HttpGet("enrollments")]
    public async Task<ActionResult> GetAllEnrollments()
    {
        var list = await _db.BenefitEnrollments
            .Include(e => e.Employee)
            .Include(e => e.BenefitPlan)
            .OrderByDescending(e => e.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }
}
