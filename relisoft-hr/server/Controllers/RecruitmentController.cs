using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.Security.Claims;

namespace RelisoftHR.Controllers;

[ApiController]
[Authorize]
[Route("api/recruitment")]
public class RecruitmentController : ControllerBase
{
    private static readonly string[] AdminRoles = { "HRL2", "HR", "Admin", "SuperAdmin" };
    private static readonly string[] ManagerRoles = { "HRL2", "HR", "Admin", "SuperAdmin", "Manager", "ManagerL2", "OrganizationHead" };

    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;

    public RecruitmentController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : 0;
    }

    private async Task<bool> HasRoleAsync(string[] roles)
    {
        var employeeId = GetUserId();
        if (employeeId == 0) return false;
        var employee = await _db.Employees.Include(e => e.Role).AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        return employee?.Role?.Name is string role && roles.Contains(role);
    }

    // ────── Job Postings ──────

    [HttpGet("jobs")]
    public async Task<ActionResult> GetJobs([FromQuery] string? status)
    {
        var query = _db.JobPostings.AsNoTracking().Include(j => j.CreatedBy).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(j => j.Status == status);
        var jobs = await query.OrderByDescending(j => j.PostedOn).ToListAsync();
        var candidateCounts = await _db.Candidates.AsNoTracking()
            .GroupBy(c => c.JobPostingId)
            .Select(g => new { JobPostingId = g.Key, Count = g.Count() })
            .ToListAsync();
        var hiredCounts = await _db.Candidates.AsNoTracking()
            .Where(c => c.Stage == "Hired")
            .GroupBy(c => c.JobPostingId)
            .Select(g => new { JobPostingId = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(jobs.Select(j => new
        {
            j.Id, j.Title, j.Department, j.Location, j.EmploymentType, j.ExperienceRequired,
            j.Openings, j.Description, j.Status, j.PostedOn, j.ClosedOn,
            CreatedByName = j.CreatedBy?.FullName,
            CandidateCount = candidateCounts.FirstOrDefault(c => c.JobPostingId == j.Id)?.Count ?? 0,
            HiredCount = hiredCounts.FirstOrDefault(c => c.JobPostingId == j.Id)?.Count ?? 0
        }).ToList());
    }

    [HttpPost("jobs")]
    public async Task<ActionResult> CreateJob([FromBody] CreateJobPostingRequest req)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Job title is required." });
        if (string.IsNullOrWhiteSpace(req.Department)) return BadRequest(new { message = "Department is required." });

        var job = new JobPosting
        {
            Title = req.Title.Trim(),
            Department = req.Department.Trim(),
            Location = req.Location?.Trim() ?? "",
            EmploymentType = string.IsNullOrWhiteSpace(req.EmploymentType) ? "Full-time" : req.EmploymentType.Trim(),
            ExperienceRequired = req.ExperienceRequired?.Trim() ?? "",
            Openings = req.Openings > 0 ? req.Openings : 1,
            Description = req.Description?.Trim() ?? "",
            CreatedByEmployeeId = GetUserId()
        };
        _db.JobPostings.Add(job);
        await _db.SaveChangesAsync();
        return Ok(new { job.Id, message = "Job posting created." });
    }

    [HttpPut("jobs/{id}")]
    public async Task<ActionResult> UpdateJob(int id, [FromBody] CreateJobPostingRequest req)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        var job = await _db.JobPostings.FindAsync(id);
        if (job == null) return NotFound();
        job.Title = req.Title?.Trim() ?? job.Title;
        job.Department = req.Department?.Trim() ?? job.Department;
        job.Location = req.Location?.Trim() ?? job.Location;
        job.EmploymentType = string.IsNullOrWhiteSpace(req.EmploymentType) ? job.EmploymentType : req.EmploymentType.Trim();
        job.ExperienceRequired = req.ExperienceRequired?.Trim() ?? job.ExperienceRequired;
        job.Openings = req.Openings > 0 ? req.Openings : job.Openings;
        job.Description = req.Description?.Trim() ?? job.Description;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Job posting updated." });
    }

    [HttpPost("jobs/{id}/close")]
    public async Task<ActionResult> CloseJob(int id)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        var job = await _db.JobPostings.FindAsync(id);
        if (job == null) return NotFound();
        job.Status = "Closed";
        job.ClosedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Job posting closed." });
    }

    // ────── Candidates ──────

    [HttpGet("candidates")]
    public async Task<ActionResult> GetCandidates([FromQuery] int? jobId, [FromQuery] string? stage)
    {
        var query = _db.Candidates.AsNoTracking()
            .Include(c => c.JobPosting)
            .AsQueryable();
        if (jobId.HasValue) query = query.Where(c => c.JobPostingId == jobId.Value);
        if (!string.IsNullOrWhiteSpace(stage)) query = query.Where(c => c.Stage == stage);
        var candidates = await query.OrderByDescending(c => c.CreatedOn).ToListAsync();
        var interviewCounts = await _db.Interviews.AsNoTracking()
            .GroupBy(i => i.CandidateId)
            .Select(g => new { CandidateId = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(candidates.Select(c => new
        {
            c.Id, c.JobPostingId, JobTitle = c.JobPosting?.Title, c.FullName, c.Email, c.Phone,
            c.ResumeSummary, c.Stage, c.Source, c.CreatedOn,
            InterviewCount = interviewCounts.FirstOrDefault(i => i.CandidateId == c.Id)?.Count ?? 0
        }).ToList());
    }

    [HttpPost("candidates")]
    public async Task<ActionResult> CreateCandidate([FromBody] CreateCandidateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.FullName)) return BadRequest(new { message = "Candidate name is required." });
        if (string.IsNullOrWhiteSpace(req.Email)) return BadRequest(new { message = "Candidate email is required." });
        var job = await _db.JobPostings.FindAsync(req.JobPostingId);
        if (job == null) return NotFound(new { message = "Job posting not found." });
        if (job.Status != "Open") return BadRequest(new { message = "This job posting is closed." });

        var candidate = new Candidate
        {
            JobPostingId = req.JobPostingId,
            FullName = req.FullName.Trim(),
            Email = req.Email.Trim(),
            Phone = req.Phone?.Trim() ?? "",
            ResumeSummary = req.ResumeSummary?.Trim() ?? "",
            Source = string.IsNullOrWhiteSpace(req.Source) ? "Portal" : req.Source.Trim(),
            AppliedByEmployeeId = GetUserId()
        };
        _db.Candidates.Add(candidate);
        await _db.SaveChangesAsync();

        // Notify all HR staff about the new application
        var hrStaff = await _db.Employees.Include(e => e.Role).AsNoTracking()
            .Where(e => e.Role != null && e.Role.Name != null &&
                        (e.Role.Name == "HRL2" || e.Role.Name == "HR" || e.Role.Name == "Admin" || e.Role.Name == "SuperAdmin"))
            .Select(e => new { e.Id, e.Email, e.FullName })
            .ToListAsync();
        var hrIds = hrStaff.Select(e => (id: e.Id, email: e.Email, name: e.FullName)).ToList();
        await _notif.NotifyEmployeesAsync(hrIds,
            "New Candidate Application",
            $"{candidate.FullName} applied for {job.Title}",
            "recruitment",
            r => $"New application: {job.Title}",
            r => $@"<p>A new candidate <b>{candidate.FullName}</b> (<a href='mailto:{candidate.Email}'>{candidate.Email}</a>) has applied for <b>{job.Title}</b>.</p><p>Review the application in the Recruitment module.</p>");

        return Ok(new { candidate.Id, message = "Application received." });
    }

    [HttpPut("candidates/{id}")]
    public async Task<ActionResult> UpdateCandidate(int id, [FromBody] UpdateCandidateRequest req)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        var candidate = await _db.Candidates.FindAsync(id);
        if (candidate == null) return NotFound();
        if (!string.IsNullOrWhiteSpace(req.FullName)) candidate.FullName = req.FullName.Trim();
        if (!string.IsNullOrWhiteSpace(req.Email)) candidate.Email = req.Email.Trim();
        if (req.Phone != null) candidate.Phone = req.Phone.Trim();
        if (req.ResumeSummary != null) candidate.ResumeSummary = req.ResumeSummary.Trim();
        await _db.SaveChangesAsync();
        return Ok(new { message = "Candidate updated." });
    }

    [HttpPost("candidates/{id}/stage")]
    public async Task<ActionResult> SetCandidateStage(int id, [FromQuery] string stage)
    {
        if (!await HasRoleAsync(ManagerRoles)) return Forbid();
        var valid = new[] { "Applied", "Shortlisted", "Interview", "Offered", "Hired", "Rejected" };
        if (!valid.Contains(stage)) return BadRequest(new { message = "Invalid stage." });
        var candidate = await _db.Candidates.FindAsync(id);
        if (candidate == null) return NotFound();
        candidate.Stage = stage;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Candidate moved to {stage}." });
    }

    // ────── Interviews ──────

    [HttpGet("interviews")]
    public async Task<ActionResult> GetInterviews([FromQuery] int? candidateId)
    {
        var query = _db.Interviews.AsNoTracking()
            .Include(i => i.Candidate)
            .Include(i => i.JobPosting)
            .Include(i => i.Interviewer)
            .AsQueryable();
        if (candidateId.HasValue) query = query.Where(i => i.CandidateId == candidateId.Value);
        var list = await query.OrderByDescending(i => i.ScheduledAt).ToListAsync();
        return Ok(list.Select(i => new
        {
            i.Id, i.CandidateId, CandidateName = i.Candidate?.FullName,
            i.JobPostingId, JobTitle = i.JobPosting?.Title,
            InterviewerId = i.InterviewerEmployeeId, InterviewerName = i.Interviewer?.FullName,
            i.ScheduledAt, i.Mode, i.Round, i.Status, i.Feedback, i.Rating
        }).ToList());
    }

    [HttpPost("interviews")]
    public async Task<ActionResult> CreateInterview([FromBody] CreateInterviewRequest req)
    {
        if (!await HasRoleAsync(ManagerRoles)) return Forbid();
        if (req.CandidateId <= 0 || req.InterviewerEmployeeId <= 0) return BadRequest(new { message = "Candidate and interviewer are required." });
        var candidate = await _db.Candidates.FindAsync(req.CandidateId);
        if (candidate == null) return NotFound(new { message = "Candidate not found." });
        var interviewer = await _db.Employees.FindAsync(req.InterviewerEmployeeId);
        if (interviewer == null) return NotFound(new { message = "Interviewer not found." });

        var interview = new Interview
        {
            CandidateId = req.CandidateId,
            JobPostingId = candidate.JobPostingId,
            InterviewerEmployeeId = req.InterviewerEmployeeId,
            ScheduledAt = req.ScheduledAt,
            Mode = string.IsNullOrWhiteSpace(req.Mode) ? "Video" : req.Mode.Trim(),
            Round = string.IsNullOrWhiteSpace(req.Round) ? "Screening" : req.Round.Trim()
        };
        _db.Interviews.Add(interview);
        await _db.SaveChangesAsync();

        if (candidate.Stage == "Applied") candidate.Stage = "Shortlisted";
        else if (candidate.Stage == "Shortlisted") candidate.Stage = "Interview";
        await _db.SaveChangesAsync();

        await _notif.NotifyAsync(interviewer.Id, "Interview Scheduled",
            $"You have an interview with {candidate.FullName} on {interview.ScheduledAt:dd-MMM-yyyy HH:mm}",
            "recruitment",
            "Interview scheduled",
            EmailTemplates.InterviewScheduled(interviewer.FullName, candidate.FullName,
                candidate.JobPosting?.Title ?? "", interview.ScheduledAt, interview.Mode),
            link: "/recruitment");

        return Ok(new { interview.Id, message = "Interview scheduled." });
    }

    [HttpPut("interviews/{id}")]
    public async Task<ActionResult> UpdateInterview(int id, [FromBody] UpdateInterviewRequest req)
    {
        if (!await HasRoleAsync(ManagerRoles)) return Forbid();
        var interview = await _db.Interviews.FindAsync(id);
        if (interview == null) return NotFound();
        if (!string.IsNullOrWhiteSpace(req.Status)) interview.Status = req.Status.Trim();
        if (!string.IsNullOrWhiteSpace(req.Feedback)) interview.Feedback = req.Feedback.Trim();
        if (req.Rating.HasValue) interview.Rating = Math.Clamp(req.Rating.Value, 1, 5);
        if (interview.Status == "Completed")
        {
            var candidate = await _db.Candidates.FindAsync(interview.CandidateId);
            if (candidate != null && candidate.Stage != "Hired" && candidate.Stage != "Rejected" && candidate.Stage != "Offered")
                candidate.Stage = "Interview";
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Interview updated." });
    }

    // ────── Offers ──────

    [HttpGet("offers")]
    public async Task<ActionResult> GetOffers([FromQuery] string? status)
    {
        var query = _db.JobOffers.AsNoTracking()
            .Include(o => o.Candidate)
            .Include(o => o.JobPosting)
            .Include(o => o.CreatedBy)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(o => o.Status == status);
        var list = await query.OrderByDescending(o => o.OfferedOn).ToListAsync();
        return Ok(list.Select(o => new
        {
            o.Id, o.CandidateId, CandidateName = o.Candidate?.FullName,
            o.JobPostingId, JobTitle = o.JobPosting?.Title,
            o.Position, o.OfferedSalary, o.Status, o.Notes, o.OfferedOn, o.DecisionDate,
            CreatedByName = o.CreatedBy?.FullName
        }).ToList());
    }

    [HttpPost("offers")]
    public async Task<ActionResult> CreateOffer([FromBody] CreateJobOfferRequest req)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        if (req.CandidateId <= 0) return BadRequest(new { message = "Candidate is required." });
        var candidate = await _db.Candidates.FindAsync(req.CandidateId);
        if (candidate == null) return NotFound(new { message = "Candidate not found." });

        var offer = new JobOffer
        {
            CandidateId = req.CandidateId,
            JobPostingId = candidate.JobPostingId,
            Position = string.IsNullOrWhiteSpace(req.Position) ? candidate.JobPosting?.Title ?? "" : req.Position.Trim(),
            OfferedSalary = req.OfferedSalary,
            Notes = req.Notes?.Trim() ?? "",
            CreatedByEmployeeId = GetUserId()
        };
        _db.JobOffers.Add(offer);
        candidate.Stage = "Offered";
        await _db.SaveChangesAsync();

        return Ok(new { offer.Id, message = "Offer created. Candidate moved to Offered." });
    }

    [HttpPost("offers/{id}/status")]
    public async Task<ActionResult> SetOfferStatus(int id, [FromQuery] string status)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        var valid = new[] { "Sent", "Accepted", "Declined", "Joined" };
        if (!valid.Contains(status)) return BadRequest(new { message = "Invalid offer status." });
        var offer = await _db.JobOffers.FindAsync(id);
        if (offer == null) return NotFound();
        offer.Status = status;
        offer.DecisionDate = DateTime.UtcNow;

        var candidate = await _db.Candidates.FindAsync(offer.CandidateId);
        if (candidate != null)
        {
            candidate.Stage = status switch
            {
                "Accepted" or "Joined" => "Hired",
                "Declined" => "Applied",
                _ => candidate.Stage
            };
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = status switch
        {
            "Accepted" => "Offer accepted. Candidate moved to Hired.",
            "Declined" => "Offer declined. Candidate moved back to Applied.",
            "Joined" => "Candidate marked as Joined.",
            _ => "Offer status updated."
        } });
    }

    // ────── Request DTOs ──────

    public class CreateJobPostingRequest
    {
        public string Title { get; set; } = "";
        public string Department { get; set; } = "";
        public string? Location { get; set; }
        public string? EmploymentType { get; set; }
        public string? ExperienceRequired { get; set; }
        public int Openings { get; set; } = 1;
        public string? Description { get; set; }
    }

    public class CreateCandidateRequest
    {
        public int JobPostingId { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public string? ResumeSummary { get; set; }
        public string? Source { get; set; }
    }

    public class UpdateCandidateRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? ResumeSummary { get; set; }
    }

    public class CreateInterviewRequest
    {
        public int CandidateId { get; set; }
        public int InterviewerEmployeeId { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string? Mode { get; set; }
        public string? Round { get; set; }
    }

    public class UpdateInterviewRequest
    {
        public string? Status { get; set; }
        public string? Feedback { get; set; }
        public int? Rating { get; set; }
    }

    public class CreateJobOfferRequest
    {
        public int CandidateId { get; set; }
        public string? Position { get; set; }
        public decimal OfferedSalary { get; set; }
        public string? Notes { get; set; }
    }
}