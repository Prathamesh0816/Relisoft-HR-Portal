using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/mentorship")]
[Authorize]
public class MentorshipController : ControllerBase
{
    private readonly AppDbContext _db;
    public MentorshipController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("profile")]
    public async Task<ActionResult> GetMyProfile()
    {
        var empId = GetUserId();
        var profile = await _db.MentorshipProfiles
            .FirstOrDefaultAsync(p => p.EmployeeId == empId);
        return Ok(profile ?? new MentorshipProfile { EmployeeId = empId });
    }

    [HttpPost("profile")]
    public async Task<ActionResult> SaveProfile([FromBody] MentorshipProfile req)
    {
        var empId = GetUserId();
        var profile = await _db.MentorshipProfiles
            .FirstOrDefaultAsync(p => p.EmployeeId == empId);
        if (profile == null)
        {
            req.EmployeeId = empId;
            _db.MentorshipProfiles.Add(req);
        }
        else
        {
            profile.IsMentor = req.IsMentor;
            profile.IsMentee = req.IsMentee;
            profile.Bio = req.Bio;
            profile.AreasOfExpertise = req.AreasOfExpertise;
            profile.Goals = req.Goals;
            profile.MaxMentees = req.MaxMentees;
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Profile saved" });
    }

    [HttpGet("mentors")]
    public async Task<ActionResult> GetMentors([FromQuery] string? search)
    {
        var query = _db.MentorshipProfiles
            .Include(p => p.Employee)
            .Where(p => p.IsMentor && p.IsActive)
            .AsQueryable();
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(p =>
                p.AreasOfExpertise.ToLower().Contains(s) ||
                p.Bio.ToLower().Contains(s) ||
                (p.Employee != null && p.Employee.FullName.ToLower().Contains(s)));
        }
        var list = await query.ToListAsync();
        return Ok(list.Select(p => new
        {
            p.Id, p.Bio, p.AreasOfExpertise, p.MaxMentees,
            EmployeeName = p.Employee?.FullName,
            EmployeeId = p.EmployeeId
        }));
    }

    [HttpGet("mentees")]
    public async Task<ActionResult> GetMentees()
    {
        var empId = GetUserId();
        var matches = await _db.MentorshipMatches
            .Include(m => m.Mentee)
            .Where(m => m.MentorId == empId)
            .ToListAsync();
        return Ok(matches.Select(m => new
        {
            m.Id, m.Status, m.StartDate, m.Goals, m.Notes,
            MenteeName = m.Mentee?.FullName,
            MenteeId = m.MenteeId
        }));
    }

    [HttpGet("my-mentor")]
    public async Task<ActionResult> GetMyMentor()
    {
        var empId = GetUserId();
        var match = await _db.MentorshipMatches
            .Include(m => m.Mentor)
            .FirstOrDefaultAsync(m => m.MenteeId == empId && m.Status == "Active");
        if (match == null) return Ok(null);
        return Ok(new
        {
            match.Id, match.StartDate, match.Goals, match.Notes,
            MentorName = match.Mentor?.FullName,
            MentorId = match.MentorId
        });
    }

    [HttpPost("request")]
    public async Task<ActionResult> RequestMatch([FromBody] MentorshipMatch req)
    {
        var empId = GetUserId();
        var existing = await _db.MentorshipMatches
            .AnyAsync(m => m.MentorId == req.MentorId && m.MenteeId == empId && m.Status == "Pending");
        if (existing)
            return BadRequest(new { message = "Request already pending" });
        var match = new MentorshipMatch
        {
            MentorId = req.MentorId,
            MenteeId = empId,
            Goals = req.Goals,
            Notes = req.Notes
        };
        _db.MentorshipMatches.Add(match);
        await _db.SaveChangesAsync();
        return Ok(new { match.Id, message = "Request sent" });
    }

    [HttpPost("{id}/respond")]
    public async Task<ActionResult> RespondToRequest(int id, [FromQuery] string action)
    {
        var match = await _db.MentorshipMatches.FindAsync(id);
        if (match == null) return NotFound();
        if (action == "approve")
        {
            match.Status = "Active";
            match.StartDate = DateTime.UtcNow;
        }
        else if (action == "reject")
        {
            match.Status = "Rejected";
        }
        else return BadRequest(new { message = "Invalid action" });
        await _db.SaveChangesAsync();
        return Ok(new { match.Status });
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult> CompleteMatch(int id)
    {
        var match = await _db.MentorshipMatches.FindAsync(id);
        if (match == null) return NotFound();
        match.Status = "Completed";
        match.EndDate = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Completed" });
    }

    [HttpGet("{matchId}/sessions")]
    public async Task<ActionResult> GetSessions(int matchId)
    {
        var sessions = await _db.MentorshipSessions
            .Where(s => s.MatchId == matchId)
            .OrderByDescending(s => s.Date)
            .ToListAsync();
        return Ok(sessions);
    }

    [HttpPost("{matchId}/sessions")]
    public async Task<ActionResult> AddSession(int matchId, [FromBody] MentorshipSession req)
    {
        req.MatchId = matchId;
        _db.MentorshipSessions.Add(req);
        await _db.SaveChangesAsync();
        return Ok(new { req.Id, message = "Session logged" });
    }
}
