using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.DTOs;

public sealed record DeskRequest(
    [property: Required, StringLength(50)] string Name,
    [property: Required, StringLength(50)] string Floor,
    [property: Required, StringLength(100)] string Building);

public sealed record MeetingRoomRequest(
    [property: Required, StringLength(100)] string Name,
    [property: Range(1, 10000)] int Capacity,
    [property: Required, StringLength(50)] string Floor,
    [property: Required, StringLength(100)] string Building,
    bool HasProjector,
    bool HasMonitor);

public sealed record DeskBookingRequest(
    [property: Range(1, int.MaxValue)] int DeskId,
    DateTime Date,
    DateTime StartTime,
    DateTime EndTime);

public sealed record RoomBookingRequest(
    [property: Range(1, int.MaxValue)] int RoomId,
    DateTime Date,
    DateTime StartTime,
    DateTime EndTime,
    [property: Required, StringLength(200)] string Title);

public sealed record BenefitPlanRequest(
    [property: Required, StringLength(200)] string Name,
    [property: StringLength(1000)] string Description,
    [property: Required, StringLength(100)] string Category,
    [property: Range(typeof(decimal), "0", "9999999999999999")] decimal EmployeeCost,
    [property: Range(typeof(decimal), "0", "9999999999999999")] decimal EmployerCost);

public sealed record BenefitEnrollmentRequest(
    [property: Range(1, int.MaxValue)] int BenefitPlanId);

public sealed record CommuteRouteRequest(
    [property: Required, StringLength(200)] string SourceArea,
    [property: Required, StringLength(200)] string DestinationArea,
    [property: Required, StringLength(100)] string CommuteDays,
    TimeSpan PreferredTime,
    bool IsDriver,
    [property: Range(0, 100)] int Capacity);

public sealed record CarpoolGroupRequest(
    [property: Required, StringLength(200)] string Name);

public sealed record ContractorRequest(
    [property: Required, StringLength(200)] string CompanyName,
    [property: StringLength(200)] string ContactPerson,
    [property: EmailAddress, StringLength(200)] string Email,
    [property: Phone, StringLength(50)] string Phone,
    [property: StringLength(500)] string Services,
    DateTime ContractStart,
    DateTime ContractEnd,
    [property: Required, StringLength(50)] string Status);

public sealed record ContractorEmployeeRequest(
    [property: Required, StringLength(200)] string FullName,
    [property: EmailAddress, StringLength(200)] string Email,
    [property: Phone, StringLength(50)] string Phone,
    [property: StringLength(200)] string Designation,
    DateTime StartDate,
    DateTime? EndDate);

public sealed record ComplianceRequirementRequest(
    [property: Required, StringLength(200)] string Name,
    [property: StringLength(1000)] string Description,
    [property: StringLength(100)] string Category,
    [property: StringLength(200)] string Authority,
    DateTime DueDate,
    bool IsRecurring,
    [property: Range(0, int.MaxValue)] int RecurrenceDays);

public sealed record ComplianceRecordRequest(
    [property: Range(1, int.MaxValue)] int RequirementId,
    int? EmployeeId,
    [property: StringLength(1000)] string Notes);

public sealed record ExpenseCategoryRequest(
    [property: Required, StringLength(100)] string Name,
    [property: StringLength(500)] string Description,
    bool RequiresReceipt,
    int SortOrder);

public sealed record ExpenseClaimRequest(
    [property: Range(1, int.MaxValue)] int CategoryId,
    [property: Required, StringLength(200)] string Title,
    [property: StringLength(1000)] string Description,
    [property: Range(typeof(decimal), "0.01", "9999999999999999")] decimal Amount,
    DateTime ExpenseDate,
    [property: StringLength(500)] string ReceiptUrl);

public sealed record AnnouncementRequest(
    [property: Required, StringLength(200)] string Title,
    [property: Required, StringLength(5000)] string Content,
    [property: Required, StringLength(100)] string Category,
    [property: Required, StringLength(50)] string Priority);

public sealed record KnowledgeBaseArticleRequest(
    [property: Required, StringLength(200)] string Title,
    [property: Required, StringLength(20000)] string Content,
    [property: Required, StringLength(100)] string Category,
    [property: StringLength(1000)] string Tags,
    bool IsPublished);

public sealed record InternalJobPostingRequest(
    [property: Required, StringLength(200)] string Title,
    [property: StringLength(2000)] string Description,
    [property: StringLength(500)] string Requirements,
    [property: Required, StringLength(100)] string Department,
    [property: Required, StringLength(100)] string Location,
    DateTime PostingDate,
    DateTime ClosingDate);

public sealed record InternalJobApplicationRequest(
    [property: StringLength(1000)] string CoverNote);

public sealed record LoanTypeRequest(
    [property: Required, StringLength(100)] string Name,
    [property: StringLength(500)] string Description,
    [property: Range(typeof(decimal), "0", "9999999999999999")] decimal MinAmount,
    [property: Range(typeof(decimal), "0", "9999999999999999")] decimal MaxAmount,
    [property: Range(typeof(decimal), "0", "100")] decimal InterestRate,
    [property: Range(1, 600)] int MaxInstallments);

public sealed record EmployeeLoanRequest(
    [property: Range(1, int.MaxValue)] int LoanTypeId,
    [property: Range(typeof(decimal), "0.01", "9999999999999999")] decimal Amount,
    [property: Range(1, 600)] int Installments,
    [property: Required, StringLength(1000)] string Purpose);

public sealed record MentorshipProfileRequest(
    bool IsMentor,
    bool IsMentee,
    [property: StringLength(500)] string Bio,
    [property: StringLength(500)] string AreasOfExpertise,
    [property: StringLength(500)] string Goals,
    [property: Range(1, 100)] int MaxMentees);

public sealed record MentorshipMatchRequest(
    [property: Range(1, int.MaxValue)] int MentorId,
    [property: StringLength(1000)] string Goals,
    [property: StringLength(1000)] string Notes);

public sealed record MentorshipSessionRequest(
    DateTime Date,
    [property: Range(1, 1440)] int DurationMinutes,
    [property: StringLength(2000)] string Notes);

public sealed record MoodEntryRequest(
    [property: Range(1, 5)] int Score,
    [property: StringLength(500)] string? Note,
    bool IsAnonymous);

public sealed record EmployeeSkillRequest(
    [property: Required, StringLength(100)] string SkillName,
    [property: StringLength(100)] string Category);

public sealed record BragPostRequest(
    [property: Required, StringLength(1000)] string Message);

public sealed record NotificationRequest(
    [property: Range(1, int.MaxValue)] int EmployeeId,
    [property: Required, StringLength(200)] string Title,
    [property: StringLength(2000)] string Message,
    [property: StringLength(100)] string Category,
    [property: StringLength(200)] string Link);

public sealed record NotificationTemplateRequest(
    [property: Required, StringLength(100)] string EventType,
    [property: Required, StringLength(200)] string Title,
    [property: Required, StringLength(2000)] string Message,
    bool IsActive = true);

public sealed record RewardCatalogItemRequest(
    [property: Required, StringLength(200)] string Name,
    [property: StringLength(1000)] string Description,
    [property: Range(1, int.MaxValue)] int PointsCost,
    [property: StringLength(500)] string ImageUrl,
    [property: StringLength(100)] string Category,
    [property: Range(0, int.MaxValue)] int Quantity,
    bool IsActive = true);

public sealed record RewardRedemptionRequest(
    [property: StringLength(500)] string Notes);

public sealed record ShiftTemplateRequest(
    [property: Required, StringLength(100)] string Name,
    TimeSpan StartTime,
    TimeSpan EndTime,
    [property: Range(0.01, 24)] double TotalHours,
    bool IsNightShift,
    [property: StringLength(500)] string Description,
    bool IsActive = true);

public sealed record ShiftAssignmentRequest(
    [property: Range(1, int.MaxValue)] int EmployeeId,
    [property: Range(1, int.MaxValue)] int ShiftTemplateId,
    DateTime StartDate,
    DateTime? EndDate,
    [property: StringLength(50)] string DayOfWeek,
    bool IsRecurring);

public sealed record ShiftSwapRequest(
    [property: Range(1, int.MaxValue)] int TargetEmployeeId,
    DateTime Date,
    [property: StringLength(500)] string Reason);

public sealed record SurveyQuestionRequest(
    [property: Required, StringLength(1000)] string QuestionText,
    [property: Required, StringLength(50)] string QuestionType,
    [property: StringLength(2000)] string Options,
    int SortOrder,
    bool IsRequired);

public sealed record SurveyRequest(
    [property: Required, StringLength(200)] string Title,
    [property: StringLength(2000)] string Description,
    DateTime StartDate,
    DateTime EndDate,
    bool IsAnonymous,
    [property: MinLength(1)] IReadOnlyCollection<SurveyQuestionRequest> Questions);

public sealed record SurveyAnswerRequest(
    [property: Range(1, int.MaxValue)] int QuestionId,
    [property: StringLength(5000)] string Response);

public sealed record TimesheetEntryRequest(
    int? ProjectId,
    DateTime Date,
    [property: Range(0.01, 24)] double Hours,
    [property: Required, StringLength(1000)] string Description,
    [property: Required, StringLength(100)] string Category);

public sealed record TimesheetPeriodRequest(
    DateTime WeekStart,
    DateTime WeekEnd,
    [property: Range(0, 168)] double TotalHours);

public sealed record TrainingCourseRequest(
    [property: Required, StringLength(200)] string Title,
    [property: StringLength(2000)] string Description,
    [property: StringLength(100)] string Category,
    [property: StringLength(100)] string Provider,
    [property: Range(1, int.MaxValue)] int DurationHours,
    [property: Required, StringLength(50)] string Mode,
    [property: StringLength(500)] string ResourceUrl,
    [property: Range(1, int.MaxValue)] int MaxSeats,
    DateTime StartDate,
    DateTime? EndDate,
    bool IsActive = true);

public sealed record VisitorRequest(
    [property: Required, StringLength(200)] string FullName,
    [property: EmailAddress, StringLength(200)] string Email,
    [property: Phone, StringLength(50)] string Phone,
    [property: StringLength(200)] string Company,
    [property: StringLength(200)] string VisitingEmployee,
    [property: Required, StringLength(200)] string Purpose,
    DateTime ExpectedDate,
    TimeSpan ExpectedTime,
    [property: StringLength(500)] string Notes,
    bool HasIdCard,
    int? HostEmployeeId);
