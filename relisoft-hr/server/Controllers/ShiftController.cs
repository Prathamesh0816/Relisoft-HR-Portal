using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
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
    public async Task<ActionResult> CreateTemplate([FromBody] ShiftTemplate req)
    {
        _db.ShiftTemplates.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPut("templates/{id}")]
    public async Task<ActionResult> UpdateTemplate(int id, [FromBody] ShiftTemplate req)
    {
        var t = await _db.ShiftTemplates.FindAsync(id);
        if (t == null) return NotFound();
        t.Name = req.Name;
        t.StartTime = req.StartTime;
        t.EndTime = req.EndTime;
        t.TotalHours = req.TotalHours;
        t.IsNightShift = req.IsNightShift;
        t.Description = req.Description;
        await _db.SaveChangesAsync();
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
    public async Task<ActionResult> CreateAssignment([FromBody] ShiftAssignment req)
    {
        _db.ShiftAssignments.Add(req);
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

        return Ok(req);
    }

    [HttpDelete("assignments/{id}")]
    public async Task<ActionResult> DeleteAssignment(int id)
    {
        var a = await _db.ShiftAssignments.FindAsync(id);
        if (a == null) return NotFound();
        _db.ShiftAssignments.Remove(a);
        await _db.SaveChangesAsync();
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
    public async Task<ActionResult> RequestSwap([FromBody] ShiftSwap req)
    {
        req.RequestedById = GetUserId();
        req.Status = "Pending";
        req.CreatedOn = DateTime.UtcNow;
        _db.ShiftSwaps.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPost("swaps/{id}/respond")]
    public async Task<ActionResult> RespondSwap(int id, [FromQuery] string action)
    {
        var swap = await _db.ShiftSwaps.FindAsync(id);
        if (swap == null) return NotFound();
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
