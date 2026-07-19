using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/mood")]
[Authorize]
public class MoodController : ControllerBase
{
    private readonly AppDbContext _db;
    public MoodController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpPost("check-in")]
    public async Task<ActionResult> CheckIn([FromBody] MoodEntryRequest req)
    {
        var empId = GetUserId();
        var today = DateTime.UtcNow.Date;
        var existing = await _db.MoodEntries.FirstOrDefaultAsync(m => m.EmployeeId == empId && m.Date == today);
        if (existing != null)
            return BadRequest(new { message = "Already checked in today" });
        var entry = new MoodEntry
        {
            EmployeeId = empId,
            Score = req.Score,
            Note = req.Note,
            IsAnonymous = req.IsAnonymous,
            Date = today
        };
        _db.MoodEntries.Add(entry);
        await _db.SaveChangesAsync();
        return Ok(new { id = entry.Id, score = entry.Score, note = entry.Note, date = entry.Date });
    }

    [HttpGet("my")]
    public async Task<ActionResult> GetMyMoods()
    {
        var empId = GetUserId();
        var entries = await _db.MoodEntries
            .Where(m => m.EmployeeId == empId)
            .OrderByDescending(m => m.Date)
            .ToListAsync();
        return Ok(entries.Select(e => new { e.Id, e.Score, e.Note, e.Date }));
    }

    [HttpGet("team-trends")]
    public async Task<ActionResult> GetTeamTrends()
    {
        var empId = GetUserId();
        var emp = await _db.Employees.FindAsync(empId);
        if (emp?.PrimaryTeamId == null) return Ok(new List<object>());
        var teamMemberIds = await _db.EmployeeTeams
            .Where(et => et.TeamId == emp.PrimaryTeamId)
            .Select(et => et.EmployeeId)
            .ToListAsync();
        var sevenDaysAgo = DateTime.UtcNow.Date.AddDays(-6);
        var moods = await _db.MoodEntries
            .Where(m => teamMemberIds.Contains(m.EmployeeId) && m.Date >= sevenDaysAgo)
            .GroupBy(m => m.Date)
            .Select(g => new { Date = g.Key, AvgScore = g.Average(m => (double)m.Score), Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToListAsync();
        return Ok(moods);
    }

    [HttpGet("org-overview")]
    public async Task<ActionResult> GetOrgOverview()
    {
        var today = DateTime.UtcNow.Date;
        var weekAgo = today.AddDays(-6);
        var recent = await _db.MoodEntries
            .Where(m => m.Date >= weekAgo)
            .GroupBy(m => m.Date)
            .Select(g => new { Date = g.Key, AvgScore = g.Average(m => (double)m.Score), Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToListAsync();
        var todayEntry = await _db.MoodEntries
            .Where(m => m.Date == today)
            .ToListAsync();
        return Ok(new
        {
            trends = recent,
            todayAvg = todayEntry.Any() ? todayEntry.Average(m => (double)m.Score) : 0,
            todayCount = todayEntry.Count,
            totalEntries = await _db.MoodEntries.CountAsync()
        });
    }
}
