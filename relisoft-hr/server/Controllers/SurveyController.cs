using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/surveys")]
[Authorize]
public class SurveyController : ControllerBase
{
    private readonly AppDbContext _db;
    public SurveyController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet]
    public async Task<ActionResult> GetSurveys()
    {
        var now = DateTime.UtcNow;
        var list = await _db.Surveys
            .Where(s => s.IsActive && s.StartDate <= now && s.EndDate >= now)
            .OrderByDescending(s => s.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult> CreateSurvey([FromBody] Survey req)
    {
        req.CreatedById = GetUserId();
        req.CreatedOn = DateTime.UtcNow;
        _db.Surveys.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetSurvey(int id)
    {
        var survey = await _db.Surveys
            .Include(s => s.Questions.OrderBy(q => q.SortOrder))
            .FirstOrDefaultAsync(s => s.Id == id);
        if (survey == null) return NotFound();
        return Ok(survey);
    }

    [HttpPost("{id}/respond")]
    public async Task<ActionResult> Respond(int id, [FromBody] List<SurveyResponse> responses)
    {
        var survey = await _db.Surveys.FindAsync(id);
        if (survey == null) return NotFound();
        var empId = GetUserId();
        var existing = await _db.SurveyResponses.AnyAsync(r => r.SurveyId == id && r.EmployeeId == empId);
        if (existing)
            return BadRequest(new { message = "Already responded" });
        foreach (var r in responses)
        {
            r.SurveyId = id;
            r.EmployeeId = empId;
            r.CreatedOn = DateTime.UtcNow;
            _db.SurveyResponses.Add(r);
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Responses submitted" });
    }

    [HttpGet("{id}/results")]
    public async Task<ActionResult> GetResults(int id)
    {
        var survey = await _db.Surveys
            .Include(s => s.Questions.OrderBy(q => q.SortOrder))
            .FirstOrDefaultAsync(s => s.Id == id);
        if (survey == null) return NotFound();
        var responses = await _db.SurveyResponses
            .Where(r => r.SurveyId == id)
            .ToListAsync();
        var totalRespondents = await _db.SurveyResponses
            .Where(r => r.SurveyId == id)
            .Select(r => r.EmployeeId)
            .Distinct()
            .CountAsync();
        return Ok(new
        {
            survey.Title,
            survey.Description,
            totalRespondents,
            Questions = survey.Questions.Select(q => new
            {
                q.Id,
                q.QuestionText,
                q.QuestionType,
                q.Options,
                q.SortOrder,
                Responses = responses.Where(r => r.QuestionId == q.Id).Select(r => new { r.EmployeeId, r.Response })
            })
        });
    }

    [HttpGet("my")]
    public async Task<ActionResult> GetMySurveys()
    {
        var empId = GetUserId();
        var surveyIds = await _db.SurveyResponses
            .Where(r => r.EmployeeId == empId)
            .Select(r => r.SurveyId)
            .Distinct()
            .ToListAsync();
        var list = await _db.Surveys
            .Where(s => surveyIds.Contains(s.Id))
            .ToListAsync();
        return Ok(list);
    }
}
