using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotificationController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet]
    public async Task<ActionResult> GetNotifications([FromQuery] bool? unreadOnly)
    {
        var empId = GetUserId();
        var query = _db.Notifications.Where(n => n.EmployeeId == empId).AsQueryable();
        if (unreadOnly == true)
            query = query.Where(n => !n.IsRead);
        var list = await query.OrderByDescending(n => n.CreatedOn).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult> CreateNotification([FromBody] NotificationRequest req)
    {
        if (!await _db.Employees.AnyAsync(e => e.Id == req.EmployeeId)) return NotFound();
        var notification = new Notification
        {
            EmployeeId = req.EmployeeId, Title = req.Title, Message = req.Message,
            Category = req.Category, Link = req.Link, CreatedOn = DateTime.UtcNow
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();
        return Ok(notification);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult> MarkRead(int id)
    {
        var n = await _db.Notifications.FindAsync(id);
        if (n == null) return NotFound();
        if (n.EmployeeId != GetUserId()) return Forbid();
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(n);
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllRead()
    {
        var empId = GetUserId();
        var unread = await _db.Notifications.Where(n => n.EmployeeId == empId && !n.IsRead).ToListAsync();
        foreach (var n in unread) n.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "All marked as read" });
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult> GetUnreadCount()
    {
        var empId = GetUserId();
        var count = await _db.Notifications.CountAsync(n => n.EmployeeId == empId && !n.IsRead);
        return Ok(new { count });
    }

    [HttpGet("templates")]
    public async Task<ActionResult> GetTemplates()
    {
        var list = await _db.NotificationTemplates.Where(t => t.IsActive).ToListAsync();
        return Ok(list);
    }

    [HttpPost("templates")]
    public async Task<ActionResult> CreateTemplate([FromBody] NotificationTemplateRequest req)
    {
        var template = new NotificationTemplate
        {
            EventType = req.EventType, Title = req.Title, Message = req.Message, IsActive = req.IsActive
        };
        _db.NotificationTemplates.Add(template);
        await _db.SaveChangesAsync();
        return Ok(template);
    }
}
