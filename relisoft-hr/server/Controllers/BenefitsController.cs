using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/benefits")]
[Authorize]
public class BenefitsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BenefitsController(AppDbContext db) => _db = db;

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
    public async Task<ActionResult> CreatePlan([FromBody] BenefitPlan req)
    {
        _db.BenefitPlans.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPut("plans/{id}")]
    public async Task<ActionResult> UpdatePlan(int id, [FromBody] BenefitPlan req)
    {
        var p = await _db.BenefitPlans.FindAsync(id);
        if (p == null) return NotFound();
        p.Name = req.Name;
        p.Description = req.Description;
        p.Category = req.Category;
        p.EmployeeCost = req.EmployeeCost;
        p.EmployerCost = req.EmployerCost;
        await _db.SaveChangesAsync();
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
    public async Task<ActionResult> Enroll([FromBody] BenefitEnrollment req)
    {
        var plan = await _db.BenefitPlans.FindAsync(req.BenefitPlanId);
        if (plan == null) return NotFound(new { message = "Plan not found" });
        req.EmployeeId = GetUserId();
        req.EnrollmentDate = DateTime.UtcNow;
        req.EffectiveDate = DateTime.UtcNow;
        req.Status = "Active";
        req.CreatedOn = DateTime.UtcNow;
        _db.BenefitEnrollments.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPost("enrollments/{id}/cancel")]
    public async Task<ActionResult> CancelEnrollment(int id)
    {
        var e = await _db.BenefitEnrollments.FindAsync(id);
        if (e == null) return NotFound();
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
