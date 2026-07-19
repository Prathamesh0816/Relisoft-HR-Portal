using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/timesheets")]
[Authorize]
public class TimesheetController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;

    public TimesheetController(AppDbContext db, NotificationHelper notif)
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
    public async Task<ActionResult> GetEntries([FromQuery] string? date)
    {
        var empId = GetUserId();
        var query = _db.TimesheetEntries
            .Where(e => e.EmployeeId == empId)
            .AsQueryable();
        if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var d))
            query = query.Where(e => e.Date.Date == d.Date);
        var list = await query.OrderByDescending(e => e.Date).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult> CreateEntry([FromBody] TimesheetEntryRequest req)
    {
        var entry = new TimesheetEntry
        {
            EmployeeId = GetUserId(), ProjectId = req.ProjectId, Date = req.Date,
            Hours = req.Hours, Description = req.Description, Category = req.Category,
            Status = "Pending", CreatedOn = DateTime.UtcNow
        };
        _db.TimesheetEntries.Add(entry);
        await _db.SaveChangesAsync();
        return Ok(entry);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateEntry(int id, [FromBody] TimesheetEntryRequest req)
    {
        var entry = await _db.TimesheetEntries.FindAsync(id);
        if (entry == null) return NotFound();
        if (entry.EmployeeId != GetUserId()) return Forbid();
        HttpConcurrency.RequireIfMatch(Request, _db, entry);
        entry.Date = req.Date;
        entry.Hours = req.Hours;
        entry.Description = req.Description;
        entry.Category = req.Category;
        entry.ProjectId = req.ProjectId;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, entry.RowVersion);
        return Ok(entry);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEntry(int id)
    {
        var entry = await _db.TimesheetEntries.FindAsync(id);
        if (entry == null) return NotFound();
        var employeeId = GetUserId();
        if (entry.EmployeeId != employeeId) return Forbid();
        if (entry.Status != "Pending")
            return Conflict(new { message = "Only pending timesheet entries can be deleted" });
        HttpConcurrency.RequireIfMatch(Request, _db, entry);
        _db.SoftDelete(entry, employeeId);
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, entry.RowVersion);
        return Ok(new { message = "Deleted" });
    }

    [HttpGet("periods")]
    public async Task<ActionResult> GetPeriods()
    {
        var empId = GetUserId();
        var list = await _db.TimesheetPeriods
            .Where(p => p.EmployeeId == empId)
            .OrderByDescending(p => p.WeekStart)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("periods/submit")]
    public async Task<ActionResult> SubmitPeriod([FromBody] TimesheetPeriodRequest req)
    {
        var employeeId = GetUserId();
        if (req.WeekEnd < req.WeekStart)
            return BadRequest(new { message = "Week end cannot be before week start" });
        if (await _db.TimesheetPeriods.AnyAsync(p =>
            p.EmployeeId == employeeId && p.WeekStart == req.WeekStart))
            return Conflict(new { message = "This timesheet period has already been submitted" });
        var period = new TimesheetPeriod
        {
            EmployeeId = employeeId, WeekStart = req.WeekStart, WeekEnd = req.WeekEnd,
            TotalHours = req.TotalHours, Status = "Submitted", CreatedOn = DateTime.UtcNow
        };
        _db.TimesheetPeriods.Add(period);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp != null)
        {
            var periodStr = $"{req.WeekStart:dd-MMM-yyyy} - {req.WeekEnd:dd-MMM-yyyy}";
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Timesheet Submitted",
                $"Your timesheet for period {periodStr} has been submitted.", "timesheet",
                "Timesheet Submitted", EmailTemplates.TimesheetSubmitted(emp.FullName, periodStr, ""),
                link: "/timesheets");
        }

        return Ok(period);
    }

    [HttpGet("approvals")]
    public async Task<ActionResult> GetApprovals()
    {
        var empId = GetUserId();
        var me = await _db.Employees.FindAsync(empId);
        if (me == null) return NotFound();
        var teamId = me.PrimaryTeamId;
        var list = await _db.TimesheetEntries
            .Include(e => e.Employee)
            .Where(e => e.Employee != null && e.Employee.PrimaryTeamId == teamId && e.Status == "Pending" && e.EmployeeId != empId)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> ApproveEntry(int id)
    {
        var entry = await _db.TimesheetEntries.FindAsync(id);
        if (entry == null) return NotFound();
        if (entry.Status != "Pending")
            return Conflict(new { message = "Only pending entries can be approved" });
        entry.Status = "Approved";
        entry.ApprovedById = GetUserId();
        entry.ApprovedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(entry.EmployeeId);
        if (emp != null)
        {
            var periodStr = entry.Date.ToString("dd-MMM-yyyy");
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Timesheet Entry Approved",
                $"Your timesheet entry for {periodStr} has been approved.", "timesheet",
                "Timesheet Entry Approved", EmailTemplates.TimesheetDecision(emp.FullName, periodStr, "Approved", null),
                link: "/timesheets");
        }

        return Ok(entry);
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult> RejectEntry(int id)
    {
        var entry = await _db.TimesheetEntries.FindAsync(id);
        if (entry == null) return NotFound();
        if (entry.Status != "Pending")
            return Conflict(new { message = "Only pending entries can be rejected" });
        entry.Status = "Rejected";
        entry.ApprovedById = GetUserId();
        entry.ApprovedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(entry.EmployeeId);
        if (emp != null)
        {
            var periodStr = entry.Date.ToString("dd-MMM-yyyy");
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Timesheet Entry Rejected",
                $"Your timesheet entry for {periodStr} has been rejected.", "timesheet",
                "Timesheet Entry Rejected", EmailTemplates.TimesheetDecision(emp.FullName, periodStr, "Rejected", null),
                link: "/timesheets");
        }

        return Ok(entry);
    }
}
