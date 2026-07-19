using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
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
    public async Task<ActionResult> CreateSurvey([FromBody] SurveyRequest req)
    {
        if (req.EndDate < req.StartDate) return BadRequest(new { message = "End date cannot be before start date" });
        var survey = new Survey
        {
            Title = req.Title, Description = req.Description, StartDate = req.StartDate,
            EndDate = req.EndDate, IsAnonymous = req.IsAnonymous, IsActive = true,
            CreatedById = GetUserId(), CreatedOn = DateTime.UtcNow,
            Questions = req.Questions.Select(q => new SurveyQuestion
            {
                QuestionText = q.QuestionText, QuestionType = q.QuestionType,
                Options = q.Options, SortOrder = q.SortOrder, IsRequired = q.IsRequired
            }).ToList()
        };
        _db.Surveys.Add(survey);
        await _db.SaveChangesAsync();
        return Ok(survey);
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
    public async Task<ActionResult> Respond(int id, [FromBody] List<SurveyAnswerRequest> responses)
    {
        var survey = await _db.Surveys.FindAsync(id);
        if (survey == null) return NotFound();
        var now = DateTime.UtcNow;
        if (!survey.IsActive || survey.StartDate > now || survey.EndDate < now)
            return BadRequest(new { message = "Survey is not accepting responses" });

        var empId = GetUserId();
        var existing = await _db.SurveyResponses.AnyAsync(r => r.SurveyId == id && r.EmployeeId == empId);
        if (existing)
            return BadRequest(new { message = "Already responded" });

        var questions = await _db.SurveyQuestions
            .Where(q => q.SurveyId == id)
            .Select(q => new { q.Id, q.IsRequired })
            .ToListAsync();
        var submittedQuestionIds = responses.Select(r => r.QuestionId).ToList();
        if (submittedQuestionIds.Count != submittedQuestionIds.Distinct().Count())
            return BadRequest(new { message = "A question can only be answered once" });
        if (submittedQuestionIds.Except(questions.Select(q => q.Id)).Any())
            return BadRequest(new { message = "One or more questions do not belong to this survey" });
        if (questions.Where(q => q.IsRequired).Select(q => q.Id).Except(submittedQuestionIds).Any())
            return BadRequest(new { message = "All required questions must be answered" });

        foreach (var r in responses)
        {
            _db.SurveyResponses.Add(new SurveyResponse
            {
                SurveyId = id, QuestionId = r.QuestionId, EmployeeId = empId,
                Response = r.Response, CreatedOn = DateTime.UtcNow
            });
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
                Responses = responses.Where(r => r.QuestionId == q.Id).Select(r => new
                {
                    EmployeeId = survey.IsAnonymous ? (int?)null : r.EmployeeId,
                    r.Response
                })
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
