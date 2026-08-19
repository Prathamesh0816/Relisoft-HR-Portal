using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using System.Security.Claims;

namespace RelisoftHR.Controllers;

[ApiController]
[Authorize]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private static readonly string[] ReviewManagerRoles = { "HRL2", "HR", "Admin", "SuperAdmin", "Manager", "ManagerL2", "OrganizationHead" };

    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db) => _db = db;

    [HttpGet("{id}")]
    public async Task<ActionResult<PerformanceReviewDto>> GetById(int id)
    {
        var review = await LoadReviewAsync(id);
        if (review == null) return NotFound();
        return Ok(await MapReviewAsync(review));
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<List<PerformanceReviewDto>>> GetForEmployee(int employeeId)
    {
        var reviews = await _db.PerformanceReviews
            .Include(r => r.Criteria)
            .AsNoTracking()
            .Where(r => r.EmployeeId == employeeId)
            .OrderByDescending(r => r.ReviewDate)
            .ToListAsync();
        return Ok(await MapReviewsAsync(reviews));
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<PerformanceReviewDto>>> GetHistory([FromQuery] int? managerEmployeeId)
    {
        if (!await IsReviewManagerAsync()) return Forbid();

        var query = _db.PerformanceReviews
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Include(r => r.Criteria)
            .AsNoTracking()
            .AsQueryable();

        if (managerEmployeeId.HasValue)
        {
            var manager = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == managerEmployeeId.Value);
            if (manager == null) return Ok(new List<PerformanceReviewDto>());
            query = query.Where(r => r.Employee != null && r.Employee.ManagerCode == manager.EmployeeCode);
        }

        var reviews = await query.OrderByDescending(r => r.ReviewDate).ToListAsync();
        return Ok(await MapReviewsAsync(reviews));
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateReviewRequest req)
    {
        if (!await IsReviewManagerAsync()) return Forbid();
        if (!Enum.TryParse<ReviewType>(req.ReviewType, true, out var reviewType))
            return BadRequest(new { message = "ReviewType must be SixMonth or Yearly." });

        var employee = await _db.Employees.FindAsync(req.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });
        var reviewer = await _db.Employees.FindAsync(req.ReviewerId);
        if (reviewer == null) return NotFound(new { message = "Reviewer not found." });

        var review = new PerformanceReview
        {
            EmployeeId = req.EmployeeId,
            ReviewerId = req.ReviewerId,
            ReviewType = reviewType,
            ReviewDate = req.ReviewDate
        };
        review.Criteria = ReviewCriteriaCatalog.All
            .Select(entry => new ReviewCriterionScore
            {
                PerformanceReview = review,
                Category = entry.Category,
                Title = entry.Title,
                WeightPercent = entry.WeightPercent
            })
            .ToList();

        _db.PerformanceReviews.Add(review);
        await _db.SaveChangesAsync();
        return Ok(new { id = review.Id, message = "Performance review created." });
    }

    [HttpPost("{id}/criteria/rate")]
    public async Task<ActionResult> RateCriterion(int id, RateCriterionRequest req)
    {
        if (!await IsReviewManagerAsync()) return Forbid();
        if (id != req.PerformanceReviewId) return BadRequest(new { message = "Route id must match body performanceReviewId." });
        if (req.Rating < 1 || req.Rating > 5) return BadRequest(new { message = "Rating must be between 1 and 5." });

        var review = await LoadReviewAsync(id);
        if (review == null) return NotFound();
        if (review.Status == PerformanceReviewStatus.Completed)
            return BadRequest(new { message = "Cannot change ratings on a completed review." });

        var criterion = review.Criteria.FirstOrDefault(c => c.Id == req.CriterionId);
        if (criterion == null) return NotFound(new { message = "That criterion does not belong to this review." });

        criterion.Rating = req.Rating;
        criterion.Remarks = string.IsNullOrWhiteSpace(req.Remarks) ? null : req.Remarks.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult> Complete(int id, CompleteReviewRequest req)
    {
        if (!await IsReviewManagerAsync()) return Forbid();
        if (id != req.PerformanceReviewId) return BadRequest(new { message = "Route id must match body performanceReviewId." });

        var review = await LoadReviewAsync(id);
        if (review == null) return NotFound();
        if (review.Status == PerformanceReviewStatus.Completed)
            return BadRequest(new { message = "Review is already completed." });
        if (review.Criteria.Any(c => c.Rating is null))
            return BadRequest(new { message = "Rate every criterion before completing the review." });

        review.KeyStrengths = req.KeyStrengths;
        review.AreasOfImprovement = req.AreasOfImprovement;
        review.TrainingSupportRequired = req.TrainingSupportRequired;
        review.Recommendation = req.Recommendation;
        review.EligibleForRoleEnhancement = req.EligibleForRoleEnhancement;
        review.OverallRating = CalculateOverallRating(review.Criteria);
        review.OverallAssessment = AssessmentFor(review.OverallRating.Value);
        review.Status = PerformanceReviewStatus.Completed;
        review.CompletedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ────── Helpers ──────

    private Task<PerformanceReview?> LoadReviewAsync(int id) =>
        _db.PerformanceReviews
            .Include(r => r.Employee)
            .Include(r => r.Reviewer)
            .Include(r => r.Criteria)
            .FirstOrDefaultAsync(r => r.Id == id);

    private async Task<List<PerformanceReviewDto>> MapReviewsAsync(List<PerformanceReview> reviews)
    {
        var result = new List<PerformanceReviewDto>();
        foreach (var review in reviews)
            result.Add(await MapReviewAsync(review));
        return result;
    }

    private async Task<PerformanceReviewDto> MapReviewAsync(PerformanceReview review)
    {
        var reviewer = review.Reviewer;
        if (reviewer == null && review.ReviewerId != 0)
            reviewer = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == review.ReviewerId);

        return new PerformanceReviewDto(
            review.Id,
            review.EmployeeId,
            review.Employee?.FullName,
            review.Employee?.EmployeeCode,
            review.Employee?.Department,
            review.Employee?.Designation,
            review.Employee?.ReportingManager?.FullName,
            review.ReviewerId,
            reviewer?.FullName,
            review.ReviewType.ToString(),
            review.ReviewDate,
            review.Status.ToString(),
            review.KeyStrengths,
            review.AreasOfImprovement,
            review.TrainingSupportRequired,
            review.Recommendation,
            review.EligibleForRoleEnhancement,
            review.OverallRating,
            review.OverallAssessment,
            review.CompletedOn,
            review.Criteria.Select(c => new ReviewCriterionScoreDto(
                c.Id, c.Category.ToString(), c.Title, c.WeightPercent,
                c.Rating, c.Remarks, c.Rating is int r ? r * c.WeightPercent : null
            )).ToList());
    }

    private static decimal CalculateOverallRating(IEnumerable<ReviewCriterionScore> criteria)
    {
        var categoryAverages = criteria
            .GroupBy(c => c.Category)
            .Select(g => g.Sum(c => c.Rating!.Value * c.WeightPercent) / 100m)
            .ToList();
        var overall = categoryAverages.Sum() / categoryAverages.Count;
        return Math.Round(overall, 1, MidpointRounding.AwayFromZero);
    }

    private static string AssessmentFor(decimal overallRating) => overallRating switch
    {
        >= 4.5m => "Outstanding",
        >= 3.5m => "Meets Expectations",
        >= 2.5m => "Needs Improvement",
        _ => "Unsatisfactory"
    };

    private async Task<bool> IsReviewManagerAsync()
    {
        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return false;
        var employee = await _db.Employees.Include(e => e.Role).AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == authenticatedEmployeeId.Value);
        return employee?.Role?.Name is string role && ReviewManagerRoles.Contains(role);
    }

    private int? GetAuthenticatedEmployeeId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var employeeId) ? employeeId : null;
    }
}