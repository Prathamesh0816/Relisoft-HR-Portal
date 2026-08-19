using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public enum ReviewType
{
    SixMonth = 0,
    Yearly = 1
}

public enum PerformanceReviewStatus
{
    Draft = 0,
    Completed = 1
}

public enum ReviewCriterionCategory
{
    PerformanceAndDelivery = 0,
    BehavioralAndTeamSkills = 1
}

public static class ReviewCriteriaCatalog
{
    public sealed record Entry(ReviewCriterionCategory Category, string Title, int WeightPercent);

    public static readonly IReadOnlyList<Entry> All = new List<Entry>
    {
        new(ReviewCriterionCategory.PerformanceAndDelivery, "Quality of Work", 20),
        new(ReviewCriterionCategory.PerformanceAndDelivery, "Productivity & Timely Delivery", 20),
        new(ReviewCriterionCategory.PerformanceAndDelivery, "Technical/Job Knowledge", 20),
        new(ReviewCriterionCategory.PerformanceAndDelivery, "Ownership & Accountability", 20),
        new(ReviewCriterionCategory.PerformanceAndDelivery, "Problem Solving & Learning Agility", 20),
        new(ReviewCriterionCategory.BehavioralAndTeamSkills, "Communication Skills", 25),
        new(ReviewCriterionCategory.BehavioralAndTeamSkills, "Teamwork & Collaboration", 25),
        new(ReviewCriterionCategory.BehavioralAndTeamSkills, "Professionalism & Discipline", 25),
        new(ReviewCriterionCategory.BehavioralAndTeamSkills, "Adaptability & Positive Attitude", 25)
    };
}

public class PerformanceReview
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ReviewerId { get; set; }
    public ReviewType ReviewType { get; set; }
    public DateTime ReviewDate { get; set; }
    public PerformanceReviewStatus Status { get; set; } = PerformanceReviewStatus.Draft;

    [MaxLength(4000)]
    public string? KeyStrengths { get; set; }
    [MaxLength(4000)]
    public string? AreasOfImprovement { get; set; }
    [MaxLength(4000)]
    public string? TrainingSupportRequired { get; set; }
    [MaxLength(4000)]
    public string? Recommendation { get; set; }
    public bool EligibleForRoleEnhancement { get; set; }

    public decimal? OverallRating { get; set; }
    [MaxLength(50)]
    public string? OverallAssessment { get; set; }
    public DateTime? CompletedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(ReviewerId))]
    public Employee? Reviewer { get; set; }
    public ICollection<ReviewCriterionScore> Criteria { get; set; } = new List<ReviewCriterionScore>();
}

public class ReviewCriterionScore
{
    [Key]
    public int Id { get; set; }
    public int PerformanceReviewId { get; set; }
    public ReviewCriterionCategory Category { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = "";
    public int WeightPercent { get; set; }
    public int? Rating { get; set; }
    [MaxLength(2000)]
    public string? Remarks { get; set; }

    [ForeignKey(nameof(PerformanceReviewId))]
    public PerformanceReview? PerformanceReview { get; set; }
}
