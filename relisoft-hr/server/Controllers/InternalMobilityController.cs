using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/internal-mobility")]
[Authorize]
public class InternalMobilityController : ControllerBase
{
    private readonly AppDbContext _db;
    public InternalMobilityController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("jobs")]
    public async Task<ActionResult> GetJobs()
    {
        var list = await _db.InternalJobPostings
            .Where(j => j.IsActive)
            .OrderByDescending(j => j.PostingDate)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("jobs")]
    public async Task<ActionResult> CreateJob([FromBody] InternalJobPosting req)
    {
        req.CreatedById = GetUserId();
        req.CreatedOn = DateTime.UtcNow;
        _db.InternalJobPostings.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPut("jobs/{id}")]
    public async Task<ActionResult> UpdateJob(int id, [FromBody] InternalJobPosting req)
    {
        var j = await _db.InternalJobPostings.FindAsync(id);
        if (j == null) return NotFound();
        j.Title = req.Title;
        j.Description = req.Description;
        j.Requirements = req.Requirements;
        j.Department = req.Department;
        j.Location = req.Location;
        j.ClosingDate = req.ClosingDate;
        await _db.SaveChangesAsync();
        return Ok(j);
    }

    [HttpPost("jobs/{id}/close")]
    public async Task<ActionResult> CloseJob(int id)
    {
        var j = await _db.InternalJobPostings.FindAsync(id);
        if (j == null) return NotFound();
        j.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Closed" });
    }

    [HttpGet("applications/my")]
    public async Task<ActionResult> GetMyApplications()
    {
        var empId = GetUserId();
        var list = await _db.InternalJobApplications
            .Include(a => a.JobPosting)
            .Where(a => a.EmployeeId == empId)
            .OrderByDescending(a => a.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("jobs/{jobId}/apply")]
    public async Task<ActionResult> Apply(int jobId, [FromBody] InternalJobApplication req)
    {
        var job = await _db.InternalJobPostings.FindAsync(jobId);
        if (job == null) return NotFound();
        req.JobPostingId = jobId;
        req.EmployeeId = GetUserId();
        req.Status = "Applied";
        req.CreatedOn = DateTime.UtcNow;
        _db.InternalJobApplications.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpGet("applications")]
    public async Task<ActionResult> GetAllApplications()
    {
        var empId = GetUserId();
        var list = await _db.InternalJobApplications
            .Include(a => a.Employee)
            .Include(a => a.JobPosting)
            .Where(a => a.JobPosting != null && a.JobPosting.CreatedById == empId)
            .OrderByDescending(a => a.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("applications/{id}/shortlist")]
    public async Task<ActionResult> Shortlist(int id)
    {
        var app = await _db.InternalJobApplications.FindAsync(id);
        if (app == null) return NotFound();
        app.Status = "Shortlisted";
        await _db.SaveChangesAsync();
        return Ok(app);
    }

    [HttpPost("applications/{id}/reject")]
    public async Task<ActionResult> RejectApplication(int id)
    {
        var app = await _db.InternalJobApplications.FindAsync(id);
        if (app == null) return NotFound();
        app.Status = "Rejected";
        await _db.SaveChangesAsync();
        return Ok(app);
    }
}
