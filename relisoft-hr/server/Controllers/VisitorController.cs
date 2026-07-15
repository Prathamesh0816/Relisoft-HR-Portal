using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
 
namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/visitors")]
[Authorize]
public class VisitorController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;
    public VisitorController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet]
    public async Task<ActionResult> GetVisitors([FromQuery] string? status, [FromQuery] string? date)
    {
        var query = _db.Visitors.AsQueryable();
        if (!string.IsNullOrEmpty(status))
            query = query.Where(v => v.Status == status);
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var d))
            query = query.Where(v => v.ExpectedDate.Date == d.Date);
        var list = await query.OrderByDescending(v => v.ExpectedDate).ThenByDescending(v => v.ExpectedTime).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult> CreateVisitor([FromBody] Visitor req)
    {
        req.CreatedOn = DateTime.UtcNow;
        _db.Visitors.Add(req);
        await _db.SaveChangesAsync();

        if (req.HostEmployeeId.HasValue)
        {
            var host = await _db.Employees.FindAsync(req.HostEmployeeId.Value);
            if (host != null)
            {
                await _notif.NotifyEmployeeAsync(host.Id, host, "Visitor Registered",
                    $"{req.FullName} has been registered to visit you.", "visitor",
                    "Visitor Registered", EmailTemplates.VisitorRegistered(host.FullName, req.FullName, req.ExpectedDate),
                    link: "/visitors");
            }
        }

        return Ok(req);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateVisitor(int id, [FromBody] Visitor req)
    {
        var v = await _db.Visitors.FindAsync(id);
        if (v == null) return NotFound();
        v.FullName = req.FullName;
        v.Email = req.Email;
        v.Phone = req.Phone;
        v.Company = req.Company;
        v.VisitingEmployee = req.VisitingEmployee;
        v.Purpose = req.Purpose;
        v.ExpectedDate = req.ExpectedDate;
        v.ExpectedTime = req.ExpectedTime;
        v.Notes = req.Notes;
        v.HostEmployeeId = req.HostEmployeeId;
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpPost("{id}/check-in")]
    public async Task<ActionResult> CheckIn(int id)
    {
        var v = await _db.Visitors.FindAsync(id);
        if (v == null) return NotFound();
        v.CheckInTime = DateTime.UtcNow;
        v.Status = "CheckedIn";
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpPost("{id}/check-out")]
    public async Task<ActionResult> CheckOut(int id)
    {
        var v = await _db.Visitors.FindAsync(id);
        if (v == null) return NotFound();
        v.CheckOutTime = DateTime.UtcNow;
        v.Status = "CheckedOut";
        await _db.SaveChangesAsync();
        return Ok(v);
    }

    [HttpGet("today")]
    public async Task<ActionResult> GetTodayVisitors()
    {
        var today = DateTime.UtcNow.Date;
        var list = await _db.Visitors
            .Where(v => v.ExpectedDate.Date == today)
            .OrderBy(v => v.ExpectedTime)
            .ToListAsync();
        return Ok(list);
    }
}
