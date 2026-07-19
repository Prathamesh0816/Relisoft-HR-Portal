using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/compliance")]
[Authorize]
public class ComplianceController : ControllerBase
{
    private readonly AppDbContext _db;
    public ComplianceController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("requirements")]
    public async Task<ActionResult> GetRequirements()
    {
        var list = await _db.ComplianceRequirements
            .Where(r => r.IsActive)
            .OrderByDescending(r => r.DueDate)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("requirements")]
    public async Task<ActionResult> CreateRequirement([FromBody] ComplianceRequirementRequest req)
    {
        var requirement = new ComplianceRequirement
        {
            Name = req.Name, Description = req.Description, Category = req.Category,
            Authority = req.Authority, DueDate = req.DueDate, IsRecurring = req.IsRecurring,
            RecurrenceDays = req.RecurrenceDays, IsActive = true
        };
        _db.ComplianceRequirements.Add(requirement);
        await _db.SaveChangesAsync();
        return Ok(requirement);
    }

    [HttpPut("requirements/{id}")]
    public async Task<ActionResult> UpdateRequirement(int id, [FromBody] ComplianceRequirementRequest req)
    {
        var r = await _db.ComplianceRequirements.FindAsync(id);
        if (r == null) return NotFound();
        HttpConcurrency.RequireIfMatch(Request, _db, r);
        r.Name = req.Name;
        r.Description = req.Description;
        r.Category = req.Category;
        r.Authority = req.Authority;
        r.DueDate = req.DueDate;
        r.IsRecurring = req.IsRecurring;
        r.RecurrenceDays = req.RecurrenceDays;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, r.RowVersion);
        return Ok(r);
    }

    [HttpGet("records")]
    public async Task<ActionResult> GetRecords([FromQuery] string? status)
    {
        var query = _db.ComplianceRecords
            .Include(r => r.Requirement)
            .Include(r => r.Employee)
            .AsQueryable();
        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.Status == status);
        var list = await query.OrderByDescending(r => r.CreatedOn).ToListAsync();
        return Ok(list);
    }

    [HttpPost("records")]
    public async Task<ActionResult> CreateRecord([FromBody] ComplianceRecordRequest req)
    {
        if (!await _db.ComplianceRequirements.AnyAsync(r => r.Id == req.RequirementId)) return NotFound();
        var record = new ComplianceRecord
        {
            RequirementId = req.RequirementId, EmployeeId = req.EmployeeId, Notes = req.Notes,
            Status = "Completed", CompletedOn = DateTime.UtcNow, CreatedOn = DateTime.UtcNow
        };
        _db.ComplianceRecords.Add(record);
        await _db.SaveChangesAsync();
        return Ok(record);
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard()
    {
        var total = await _db.ComplianceRequirements.CountAsync(r => r.IsActive);
        var completed = await _db.ComplianceRecords.CountAsync(r => r.Status == "Completed");
        var pending = await _db.ComplianceRecords.CountAsync(r => r.Status == "Pending");
        var overdue = await _db.ComplianceRequirements
            .CountAsync(r => r.IsActive && r.DueDate < DateTime.UtcNow
                && !_db.ComplianceRecords.Any(c => c.RequirementId == r.Id && c.Status == "Completed"));
        return Ok(new { totalRequirements = total, completed, pending, overdue });
    }
}
