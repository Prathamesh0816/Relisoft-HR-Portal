namespace RelisoftHR.DTOs;

public record OnboardingChecklistDto(int Id, string Name, string? Description, bool IsMandatory);

public record EmployeeOnboardingDto(
    int Id, int EmployeeId, string EmployeeName, string EmployeeCode, string Status,
    int CompletedSteps, int TotalSteps, List<OnboardingStepDto> Steps,
    DateTime? ReliSoftIdCreatedOn, DateTime? ClientIdCreatedOn,
    DateTime? VirtualIdCardIssuedOn, DateTime? GatePassIssuedOn,
    DateTime CreatedOn, DateTime? CompletedOn
);

public record OnboardingStepDto(int Id, int ChecklistItemId, string ItemName, string Status, DateTime? CompletedOn, string? Notes);

public record CandidateOnboardingRequest(
    string FullName, string Email, string Department, string Designation,
    string JobRole, string Location, DateTime JoinDate, string? PanNumber,
    string? AadhaarNumber, bool HasPriorExperience
);

public record EmployeeOffboardingDto(
    int Id, int EmployeeId, string EmployeeName, string EmployeeCode,
    string Status, DateTime ResignationDate, DateTime? LastWorkingDay,
    DateTime? AssetsReturnedOn, DateTime? IdDeactivatedOn,
    DateTime? EmailDeactivatedOn, DateTime? GatePassReturnedOn,
    string? Remarks, DateTime CreatedOn, DateTime? CompletedOn
);

public record StartOffboardingRequest(int EmployeeId, DateTime ResignationDate, string? Remarks);

public record AssetDto(int Id, string Name, string AssetTag, string Category, string? SerialNumber, string Status, byte[]? RowVersion = null);

public record EmployeeAssetDto(
    int Id, int EmployeeId, string EmployeeName, int AssetId, string AssetName,
    string AssetTag, string AssetCategory, DateTime AssignedOn, DateTime? ReturnedOn, string Status
);

public record BulkOnboardRequest(List<CandidateOnboardingRequest> Candidates);
