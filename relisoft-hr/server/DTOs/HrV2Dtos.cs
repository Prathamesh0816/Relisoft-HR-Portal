namespace RelisoftHR.DTOs;

public record EmployeeProbationDto(
    int Id, int EmployeeId, string EmployeeName, string EmployeeCode,
    DateTime StartDate, DateTime OriginalEndDate, DateTime? CurrentEndDate,
    int ExtensionCount, string Status, string? Notes, DateTime? ConfirmedOn
);

public record AppraisalCycleDto(int Id, string Name, DateTime StartDate, DateTime EndDate, string Status, byte[]? RowVersion = null);

public record EmployeeAppraisalDto(
    int Id, int EmployeeId, string EmployeeName, int CycleId, string CycleName,
    int? ReviewerId, string ReviewerName,
    int? SelfRating, int? ManagerRating, int? FinalRating,
    string? SelfComments, string? ManagerComments,
    string Status, DateTime? SubmittedOn, DateTime? CompletedOn,
    List<AppraisalGoalDto> Goals
);

public record AppraisalGoalDto(int Id, string Goal, DateTime? TargetDate, bool Achieved);

public record StartProbationRequest(int EmployeeId, DateTime StartDate, int ProbationMonths);

public record ExtendProbationRequest(int EmployeeId, int ExtraMonths, string? Reason);

public record ConfirmProbationRequest(int EmployeeId);

public record SelfAppraisalRequest(int? SelfRating, string? SelfComments, List<AppraisalGoalDto> Goals);

public record ManagerAppraisalRequest(int? ManagerRating, string? ManagerComments, string Status);

public record InternConversionRequest(int EmployeeId, int NewRoleId, string NewDesignation, string NewEmploymentType);

public record SalaryDiscussionDto(
    int Id, int EmployeeId, string EmployeeName, decimal ProposedSalary, decimal? ApprovedSalary,
    string Status, string? ProposedByName, string? ApprovedByName, DateTime DiscussionDate, string? Notes,
    byte[]? RowVersion = null
);

public record SalaryDiscussionRequest(int EmployeeId, decimal ProposedSalary, int? ProposedById, string? Notes);

public record ApproveSalaryRequest(decimal ApprovedSalary, int? ApprovedById);
