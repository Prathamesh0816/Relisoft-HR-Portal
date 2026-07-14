using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/hr-features")]
[Authorize]
public class HRFeaturesController : ControllerBase
{
    private readonly AppDbContext _db;
    public HRFeaturesController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    // ─── Announcements ───
    [HttpGet("announcements")]
    public async Task<ActionResult> GetAnnouncements()
    {
        var list = await _db.Announcements
            .Include(a => a.CreatedBy)
            .Where(a => a.IsActive)
            .OrderByDescending(a => a.CreatedOn)
            .ToListAsync();
        return Ok(list.Select(a => new
        {
            a.Id, a.Title, a.Content, a.Category, a.Priority, a.CreatedOn,
            CreatedByName = a.CreatedBy.FullName
        }));
    }

    [HttpPost("announcements")]
    public async Task<ActionResult> CreateAnnouncement([FromBody] Announcement req)
    {
        req.CreatedById = GetUserId();
        req.CreatedOn = DateTime.UtcNow;
        _db.Announcements.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpDelete("announcements/{id}")]
    public async Task<ActionResult> DeleteAnnouncement(int id)
    {
        var a = await _db.Announcements.FindAsync(id);
        if (a == null) return NotFound();
        a.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Deleted" });
    }

    // ─── Attendance ───
    [HttpGet("attendance")]
    public async Task<ActionResult> GetAttendance([FromQuery] int? employeeId, [FromQuery] string? date)
    {
        var query = _db.AttendanceRecords
            .Include(a => a.Employee)
            .AsQueryable();
        if (employeeId.HasValue) query = query.Where(a => a.EmployeeId == employeeId.Value);
        if (!string.IsNullOrEmpty(date) && DateOnly.TryParse(date, out var d))
        {
            var dt = d.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(a => a.Date == dt);
        }
        var list = await query.OrderByDescending(a => a.Date).ToListAsync();
        return Ok(list.Select(a => new
        {
            a.Id, a.EmployeeId, EmployeeName = a.Employee.FullName,
            a.Date, a.ClockIn, a.ClockOut, a.Status, a.Notes
        }));
    }

    [HttpPost("attendance/clock-in")]
    public async Task<ActionResult> ClockIn()
    {
        var empId = GetUserId();
        var today = DateTime.UtcNow.Date;
        var existing = await _db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date == today);
        if (existing != null)
            return BadRequest(new { message = "Already clocked in today" });
        var rec = new AttendanceRecord
        {
            EmployeeId = empId,
            Date = today,
            ClockIn = DateTime.UtcNow,
            Status = "Present"
        };
        _db.AttendanceRecords.Add(rec);
        await _db.SaveChangesAsync();
        return Ok(rec);
    }

    [HttpPost("attendance/clock-out")]
    public async Task<ActionResult> ClockOut()
    {
        var empId = GetUserId();
        var today = DateTime.UtcNow.Date;
        var rec = await _db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == empId && a.Date == today);
        if (rec == null)
            return BadRequest(new { message = "Not clocked in today" });
        if (rec.ClockOut != null)
            return BadRequest(new { message = "Already clocked out today" });
        rec.ClockOut = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(rec);
    }

    // ─── Knowledge Base ───
    [HttpGet("knowledge-base")]
    public async Task<ActionResult> GetKnowledgeBase([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = _db.KnowledgeBaseArticles
            .Include(k => k.CreatedBy)
            .Where(k => k.IsPublished)
            .AsQueryable();
        if (!string.IsNullOrEmpty(category))
            query = query.Where(k => k.Category == category);
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(k => k.Title.ToLower().Contains(s) || k.Content.ToLower().Contains(s) || k.Tags.ToLower().Contains(s));
        }
        var list = await query.OrderByDescending(k => k.CreatedOn).ToListAsync();
        return Ok(list.Select(k => new
        {
            k.Id, k.Title, k.Content, k.Category, k.Tags, k.ViewCount, k.CreatedOn, k.UpdatedOn,
            CreatedByName = k.CreatedBy.FullName
        }));
    }

    [HttpPost("knowledge-base")]
    public async Task<ActionResult> CreateArticle([FromBody] KnowledgeBaseArticle req)
    {
        req.CreatedById = GetUserId();
        req.CreatedOn = DateTime.UtcNow;
        req.UpdatedOn = DateTime.UtcNow;
        _db.KnowledgeBaseArticles.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPost("knowledge-base/{id}/view")]
    public async Task<ActionResult> RecordView(int id)
    {
        var article = await _db.KnowledgeBaseArticles.FindAsync(id);
        if (article == null) return NotFound();
        article.ViewCount++;
        await _db.SaveChangesAsync();
        return Ok(new { viewCount = article.ViewCount });
    }

    // ─── Dashboard Stats ───
    [HttpGet("dashboard-stats")]
    public async Task<ActionResult> GetDashboardStats()
    {
        var empId = GetUserId();
        var totalEmployees = await _db.Employees.CountAsync();
        var totalTeams = await _db.Teams.CountAsync();
        var activeTickets = await _db.EmployeeTickets.CountAsync(t => t.Status != "Resolved" && t.Status != "Cancelled");
        var pendingLeaves = await _db.LeaveApplications.CountAsync(l => l.Status == "Pending");
        var openProbations = await _db.EmployeeProbations.CountAsync(p => p.Status == "Active");
        var openAppraisals = await _db.EmployeeAppraisals.CountAsync(a => a.Status == "SelfReview" || a.Status == "ManagerReview");
        var todayAttendances = await _db.AttendanceRecords
            .CountAsync(a => a.Date == DateTime.UtcNow.Date);
        var departmentCounts = await _db.Employees
            .GroupBy(e => e.Department)
            .Select(g => new { Department = g.Key, Count = g.Count() })
            .ToListAsync();
        return Ok(new
        {
            totalEmployees,
            totalTeams,
            activeTickets,
            pendingLeaves,
            openProbations,
            openAppraisals,
            todayAttendances,
            departmentCounts
        });
    }
}
