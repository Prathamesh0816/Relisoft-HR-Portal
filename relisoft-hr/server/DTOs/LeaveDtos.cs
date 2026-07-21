namespace RelisoftHR.DTOs;

public record ApplyLeaveRequest(
    int EmployeeId, int LeaveTypeId, DateTime StartDate, DateTime EndDate,
    bool IsHalfDay, string Reason, bool IsMedicalLeave = false
);

public record LeaveRequestDto(
    int Id, int EmployeeId, string EmployeeName, string EmployeeCode,
    string EmployeeRole, string LeaveTypeName, DateTime FromDate, DateTime ToDate,
    decimal TotalDays, bool IsHalfDay, string Reason, string Status,
    string? ApproverName, DateTime AppliedOn, DateTime? ActionedOn,
    string? ApprovalReason, bool CanCancel, string? PrimaryTeamName,
    bool IsMedicalLeave, bool LossOfPay, string? MedicalCertificatePath,
    string? CancellationReason = null, DateTime? CancellationRequestedOn = null
);

public record ReviewerDecisionRequest(int LeaveApplicationId, int ApproverId, string Action, string? Reason = null);

public record CancelLeaveRequest(int EmployeeId, string Reason);

public record RequestCancellationRequest(int EmployeeId, string Reason);

public record CancelDecisionRequest(int ApproverId, string Action, string? Reason = null);

public record BulkDecisionRequest(List<int> LeaveApplicationIds, int ApproverId, string Action, string? Reason = null);

public record ApproverInfo(string Name, string? TeamName);

public record ApprovalDelegateRequest(int? ProjectId, int DelegateId);

public record CompOffRequestData(int EmployeeId, DateTime WorkedDate, string Reason);

public record FloaterHolidayUsageDto(int Used, int Max);

public record CompOffTransferRequest(int FromEmployeeId, int ToEmployeeId, decimal Days, string Reason);
public record CompOffTransferResponse(
    int Id, int FromEmployeeId, string FromEmployeeName, string FromEmployeeCode,
    int ToEmployeeId, string ToEmployeeName, string ToEmployeeCode,
    decimal Days, string Reason, string Status, DateTime CreatedOn, DateTime? ActionedOn
);

public record CalendarEvent(
    int Id, int EmployeeId, string EmployeeName, string EmployeeCode,
    string LeaveTypeName, DateTime FromDate, DateTime ToDate, decimal TotalDays
);

public record HolidayDto(int Id, string Name, string Date, string Day, string Type);
