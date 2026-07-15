using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
 
namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/training")]
[Authorize]
public class TrainingController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;
    public TrainingController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("courses")]
    public async Task<ActionResult> GetCourses([FromQuery] string? category)
    {
        var query = _db.TrainingCourses.Where(c => c.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(category))
            query = query.Where(c => c.Category == category);
        var list = await query.OrderByDescending(c => c.CreatedOn).ToListAsync();
        return Ok(list);
    }

    [HttpPost("courses")]
    public async Task<ActionResult> CreateCourse([FromBody] TrainingCourse req)
    {
        req.CreatedOn = DateTime.UtcNow;
        _db.TrainingCourses.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPut("courses/{id}")]
    public async Task<ActionResult> UpdateCourse(int id, [FromBody] TrainingCourse req)
    {
        var course = await _db.TrainingCourses.FindAsync(id);
        if (course == null) return NotFound();
        course.Title = req.Title;
        course.Description = req.Description;
        course.Category = req.Category;
        course.Provider = req.Provider;
        course.DurationHours = req.DurationHours;
        course.Mode = req.Mode;
        course.ResourceUrl = req.ResourceUrl;
        course.MaxSeats = req.MaxSeats;
        course.StartDate = req.StartDate;
        course.EndDate = req.EndDate;
        await _db.SaveChangesAsync();
        return Ok(course);
    }

    [HttpGet("registrations")]
    public async Task<ActionResult> GetRegistrations()
    {
        var empId = GetUserId();
        var list = await _db.TrainingRegistrations
            .Include(r => r.Course)
            .Where(r => r.EmployeeId == empId)
            .OrderByDescending(r => r.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("courses/{courseId}/register")]
    public async Task<ActionResult> Register(int courseId)
    {
        var course = await _db.TrainingCourses.FindAsync(courseId);
        if (course == null) return NotFound();
        var registered = await _db.TrainingRegistrations.CountAsync(r => r.CourseId == courseId && r.Status == "Registered");
        if (registered >= course.MaxSeats)
            return BadRequest(new { message = "No seats available" });
        var existing = await _db.TrainingRegistrations
            .FirstOrDefaultAsync(r => r.CourseId == courseId && r.EmployeeId == GetUserId());
        if (existing != null)
            return BadRequest(new { message = "Already registered" });
        var reg = new TrainingRegistration
        {
            CourseId = courseId,
            EmployeeId = GetUserId(),
            Status = "Registered",
            CreatedOn = DateTime.UtcNow
        };
        _db.TrainingRegistrations.Add(reg);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(GetUserId());
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Training Enrollment",
                $"You have registered for {course.Title}.", "training",
                "Training Enrolled", EmailTemplates.TrainingEnrolled(emp.FullName, course.Title, course.StartDate.ToString("dd-MMM-yyyy")),
                link: "/training");
        }

        return Ok(reg);
    }

    [HttpPost("registrations/{id}/complete")]
    public async Task<ActionResult> CompleteRegistration(int id, [FromQuery] int? score)
    {
        var reg = await _db.TrainingRegistrations.FindAsync(id);
        if (reg == null) return NotFound();
        reg.Status = "Completed";
        reg.Score = score;
        reg.CompletedOn = DateTime.UtcNow;
        if (score.HasValue && score.Value >= 70)
            reg.IsCertified = true;
        await _db.SaveChangesAsync();
        return Ok(reg);
    }

    [HttpGet("certifications")]
    public async Task<ActionResult> GetCertifications()
    {
        var empId = GetUserId();
        var list = await _db.TrainingRegistrations
            .Include(r => r.Course)
            .Where(r => r.EmployeeId == empId && r.IsCertified)
            .OrderByDescending(r => r.CompletedOn)
            .ToListAsync();
        return Ok(list);
    }
}
