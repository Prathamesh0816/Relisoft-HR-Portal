namespace RelisoftHR.DTOs;

public record ReviewCriterionScoreDto(
    int Id, string Category, string Title, int WeightPercent,
    int? Rating, string? Remarks, int? WeightedScore);

public record PerformanceReviewDto(
    int Id, int EmployeeId, string? EmployeeName, string? EmployeeCode,
    string? Department, string? Designation, string? ReportingManagerName,
    int ReviewerId, string? ReviewerName,
    string ReviewType, DateTime ReviewDate, string Status,
    string? KeyStrengths, string? AreasOfImprovement, string? TrainingSupportRequired,
    string? Recommendation, bool EligibleForRoleEnhancement,
    decimal? OverallRating, string? OverallAssessment, DateTime? CompletedOn,
    List<ReviewCriterionScoreDto> Criteria);

public record CreateReviewRequest(int EmployeeId, int ReviewerId, string ReviewType, DateTime ReviewDate);
public record RateCriterionRequest(int PerformanceReviewId, int CriterionId, int Rating, string? Remarks);
public record CompleteReviewRequest(
    int PerformanceReviewId,
    string? KeyStrengths,
    string? AreasOfImprovement,
    string? TrainingSupportRequired,
    string? Recommendation,
    bool EligibleForRoleEnhancement);
