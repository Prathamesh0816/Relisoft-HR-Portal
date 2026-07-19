namespace RelisoftHR.DTOs;

public record CreateEmployeeRequest(
    string EmployeeCode, string FullName, string Email, string Department,
    string Designation, string JobRole, string EmploymentType, string Location,
    SalaryStructureDto? SalaryStructure, DateTime JoinDate, int Role,
    int PrimaryProjectId, int PrimaryTeamId, List<int> ProjectIds, List<int> TeamIds
);

public record UpdateEmployeeRequest(
    string EmployeeCode, string FullName, string Email, string Department,
    string Designation, string JobRole, string EmploymentType, string Location,
    SalaryStructureDto? SalaryStructure, DateTime JoinDate, int Role,
    int PrimaryProjectId, int PrimaryTeamId, List<int> ProjectIds, List<int> TeamIds
);

public record SalaryStructureDto(
    decimal FixedPay, decimal VariablePay, decimal PF,
    decimal Gratuity, decimal Insurance, decimal OtherDeductions
);

public record CreateEmployeeResponse(
    string Message, string LoginUsername, string TemporaryPassword
);

public record EmployeeDto(
    int Id, string EmployeeCode, string FullName, string Email,
    string Department, string Designation, string JobRole,
    string EmploymentType, string Status, string Location, SalaryStructureDto? SalaryStructure,
    DateTime JoinDate, string Role, int RoleId, string? RoleLabel,
    EmployeeProjectDto? PrimaryProject, int? PrimaryProjectId,
    List<EmployeeProjectDto> Projects,
    TeamDto? PrimaryTeam, int? PrimaryTeamId,
    List<TeamDto> Teams, List<LeaveBalanceDto> LeaveBalances,
    string? ApproverName,
    byte[]? RowVersion = null
);

public record EmployeeProjectDto(
    int Id, string Name, int? ManagerId, string? ManagerName,
    string ApprovalRoute, int? ApprovalDelegateId,
    int? ApprovalDelegateEmployeeId, string? ApprovalDelegateName
);

public record TeamDto(
    int Id, string Name, int ProjectId, string ProjectName,
    int LeadId, string LeadName, byte[]? RowVersion = null,
    int? ProjectManagerId = null,
    string? ProjectManagerName = null
);

public record LeaveBalanceDto(
    int Id, int LeaveTypeId, string LeaveTypeName,
    decimal AllocatedLeaves, decimal UsedLeaves, decimal RemainingLeaves
);
