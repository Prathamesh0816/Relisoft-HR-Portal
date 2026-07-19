namespace RelisoftHR.DTOs;

public record WorkspaceResponse(
    List<EmployeeDto> Employees,
    List<ProjectDto> Projects,
    List<LeaveTypeDto> LeaveTypes,
    List<RoleDto> Roles,
    HrPolicyDto HrPolicy
);

public record ProjectDto(
    int Id, string Name, List<TeamDto> Teams, byte[]? RowVersion = null,
    int? ManagerId = null, string? ManagerName = null
);

public record LeaveTypeDto(int Id, string Name, decimal CarryForwardPct = 0, bool IsCompOff = false, bool IsFloaterHoliday = false, int MaxFloaterPerYear = 0, int CompOffValidityDays = 0);

public record RoleDto(int Id, string Name, string? Label, bool IsCustom, int BaseRoleId);

public record HrPolicyDto(bool AllowHalfDayLeave, bool SandwichLeave, byte[]? RowVersion = null);

public record CreateProjectRequest(string Name, int ManagerId);

public record UpdateProjectRequest(string Name, int ManagerId);

public record CreateTeamRequest(
    string Name, int ProjectId, int LeadId,
    string ApprovalRoute = "ProjectManager", int? ApprovalDelegateId = null
);

public record UpdateTeamRequest(
    string Name, int ProjectId, int LeadId,
    string ApprovalRoute = "ProjectManager", int? ApprovalDelegateId = null
);

public record UpdateHrPolicyRequest(bool AllowHalfDayLeave, bool SandwichLeave);
