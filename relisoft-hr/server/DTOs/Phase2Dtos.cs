namespace RelisoftHR.DTOs;

public record EncashmentRequest(int LeaveTypeId, decimal DaysRequested, decimal RatePerDay = 0, string? Reason = null);

public record RegularizationRequest(int AttendanceRecordId, string RequestType, string? Reason);

public record ReviewRegularizationRequest(bool Approve);

public record UploadDocumentRequest(int EmployeeId, string DocumentType, string DocumentName, DateTime? ExpiryDate);

public record VerifyDocumentRequest(bool Verified, string? Remarks);