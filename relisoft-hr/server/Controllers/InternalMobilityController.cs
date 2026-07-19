using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

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
    public async Task<ActionResult> CreateJob([FromBody] InternalJobPostingRequest req)
    {
        var posting = new InternalJobPosting
        {
            Title = req.Title, Description = req.Description, Requirements = req.Requirements,
            Department = req.Department, Location = req.Location, PostingDate = req.PostingDate,
            ClosingDate = req.ClosingDate, CreatedById = GetUserId(), CreatedOn = DateTime.UtcNow, IsActive = true
        };
        _db.InternalJobPostings.Add(posting);
        await _db.SaveChangesAsync();
        return Ok(posting);
    }

    [HttpPut("jobs/{id}")]
    public async Task<ActionResult> UpdateJob(int id, [FromBody] InternalJobPostingRequest req)
    {
        var j = await _db.InternalJobPostings.FindAsync(id);
        if (j == null) return NotFound();
        HttpConcurrency.RequireIfMatch(Request, _db, j);
        j.Title = req.Title;
        j.Description = req.Description;
        j.Requirements = req.Requirements;
        j.Department = req.Department;
        j.Location = req.Location;
        j.ClosingDate = req.ClosingDate;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, j.RowVersion);
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
    public async Task<ActionResult> Apply(int jobId, [FromBody] InternalJobApplicationRequest req)
    {
        var job = await _db.InternalJobPostings.FindAsync(jobId);
        if (job == null) return NotFound();
        if (!job.IsActive || job.ClosingDate < DateTime.UtcNow)
            return BadRequest(new { message = "This job posting is closed" });
        var employeeId = GetUserId();
        if (await _db.InternalJobApplications.AnyAsync(a =>
            a.JobPostingId == jobId && a.EmployeeId == employeeId))
            return Conflict(new { message = "You have already applied for this job" });
        var application = new InternalJobApplication
        {
            JobPostingId = jobId, EmployeeId = employeeId, CoverNote = req.CoverNote,
            Status = "Applied", CreatedOn = DateTime.UtcNow
        };
        _db.InternalJobApplications.Add(application);
        await _db.SaveChangesAsync();
        return Ok(application);
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
