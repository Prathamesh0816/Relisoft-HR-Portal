using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
 
namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/shifts")]
[Authorize]
public class ShiftController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;
    public ShiftController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("templates")]
    public async Task<ActionResult> GetTemplates()
    {
        var list = await _db.ShiftTemplates.Where(t => t.IsActive).ToListAsync();
        return Ok(list);
    }

    [HttpPost("templates")]
    public async Task<ActionResult> CreateTemplate([FromBody] ShiftTemplateRequest req)
    {
        var template = new ShiftTemplate
        {
            Name = req.Name, StartTime = req.StartTime, EndTime = req.EndTime,
            TotalHours = req.TotalHours, IsNightShift = req.IsNightShift,
            Description = req.Description, IsActive = req.IsActive
        };
        _db.ShiftTemplates.Add(template);
        await _db.SaveChangesAsync();
        return Ok(template);
    }

    [HttpPut("templates/{id}")]
    public async Task<ActionResult> UpdateTemplate(int id, [FromBody] ShiftTemplateRequest req)
    {
        var t = await _db.ShiftTemplates.FindAsync(id);
        if (t == null) return NotFound();
        HttpConcurrency.RequireIfMatch(Request, _db, t);
        t.Name = req.Name;
        t.StartTime = req.StartTime;
        t.EndTime = req.EndTime;
        t.TotalHours = req.TotalHours;
        t.IsNightShift = req.IsNightShift;
        t.Description = req.Description;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, t.RowVersion);
        return Ok(t);
    }

    [HttpGet("assignments")]
    public async Task<ActionResult> GetAssignments([FromQuery] int? employeeId)
    {
        var query = _db.ShiftAssignments
            .Include(a => a.Employee)
            .Include(a => a.ShiftTemplate)
            .AsQueryable();
        if (employeeId.HasValue)
            query = query.Where(a => a.EmployeeId == employeeId.Value);
        var list = await query.OrderByDescending(a => a.StartDate).ToListAsync();
        return Ok(list);
    }

    [HttpPost("assignments")]
    public async Task<ActionResult> CreateAssignment([FromBody] ShiftAssignmentRequest req)
    {
        if (req.EndDate.HasValue && req.EndDate.Value < req.StartDate)
            return BadRequest(new { message = "End date cannot be before start date" });
        if (!await _db.Employees.AnyAsync(e => e.Id == req.EmployeeId))
            return NotFound(new { message = "Employee not found" });
        if (!await _db.ShiftTemplates.AnyAsync(s => s.Id == req.ShiftTemplateId && s.IsActive))
            return NotFound(new { message = "Active shift template not found" });

        var requestedEnd = req.EndDate ?? DateTime.MaxValue;
        var overlaps = await _db.ShiftAssignments.AnyAsync(a =>
            a.EmployeeId == req.EmployeeId &&
            a.StartDate <= requestedEnd &&
            (a.EndDate == null || a.EndDate >= req.StartDate));
        if (overlaps)
            return Conflict(new { message = "Employee already has an overlapping shift assignment" });

        var assignment = new ShiftAssignment
        {
            EmployeeId = req.EmployeeId, ShiftTemplateId = req.ShiftTemplateId,
            StartDate = req.StartDate, EndDate = req.EndDate,
            DayOfWeek = req.DayOfWeek, IsRecurring = req.IsRecurring
        };
        _db.ShiftAssignments.Add(assignment);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(req.EmployeeId);
        if (emp != null)
        {
            var template = await _db.ShiftTemplates.FindAsync(req.ShiftTemplateId);
            var shiftName = template?.Name ?? "Unknown";
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Shift Assigned",
                $"A new shift ({shiftName}) has been assigned to you.", "shift",
                "Shift Changed", EmailTemplates.ShiftChanged(emp.FullName, "None", shiftName, req.StartDate.ToString("dd-MMM-yyyy")),
                link: "/shifts");
        }

        return Ok(assignment);
    }

    [HttpDelete("assignments/{id}")]
    [Authorize(Roles = "HR,HRL2,OrganizationHead")]
    public async Task<ActionResult> DeleteAssignment(int id)
    {
        var a = await _db.ShiftAssignments.FindAsync(id);
        if (a == null) return NotFound();
        HttpConcurrency.RequireIfMatch(Request, _db, a);
        _db.SoftDelete(a, GetUserId());
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, a.RowVersion);
        return Ok(new { message = "Deleted" });
    }

    [HttpGet("swaps")]
    public async Task<ActionResult> GetSwaps()
    {
        var empId = GetUserId();
        var list = await _db.ShiftSwaps
            .Include(s => s.RequestedBy)
            .Include(s => s.TargetEmployee)
            .Where(s => s.RequestedById == empId || s.TargetEmployeeId == empId)
            .OrderByDescending(s => s.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("swaps/request")]
    public async Task<ActionResult> RequestSwap([FromBody] ShiftSwapRequest req)
    {
        var requestedById = GetUserId();
        if (requestedById == req.TargetEmployeeId)
            return BadRequest(new { message = "Cannot request a shift swap with yourself" });
        var swap = new ShiftSwap
        {
            RequestedById = requestedById, TargetEmployeeId = req.TargetEmployeeId,
            Date = req.Date, Reason = req.Reason, Status = "Pending", CreatedOn = DateTime.UtcNow
        };
        _db.ShiftSwaps.Add(swap);
        await _db.SaveChangesAsync();
        return Ok(swap);
    }

    [HttpPost("swaps/{id}/respond")]
    public async Task<ActionResult> RespondSwap(int id, [FromQuery] string action)
    {
        var swap = await _db.ShiftSwaps.FindAsync(id);
        if (swap == null) return NotFound();
        if (swap.TargetEmployeeId != GetUserId()) return Forbid();
        if (swap.Status != "Pending")
            return Conflict(new { message = "This swap request has already been actioned" });
        if (action == "accept")
            swap.Status = "Accepted";
        else if (action == "reject")
            swap.Status = "Rejected";
        else
            return BadRequest(new { message = "Action must be accept or reject" });
        await _db.SaveChangesAsync();
        return Ok(swap);
    }
}
