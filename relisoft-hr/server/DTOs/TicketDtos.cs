namespace RelisoftHR.DTOs;

public record CreateTicketRequest(
    int EmployeeId, string Category, string RequestType,
    string? ItemDetail, string Subject, string Description
);

public record TicketDto(
    int Id, int EmployeeId, string EmployeeName, string EmployeeCode,
    string Category, string RequestType, string? ItemDetail, string Subject, string Description,
    string Status, int? AssignedHrId, string? AssignedHrName,
    DateTime CreatedOn, List<TimelineEventDto> Timeline
);

public record TimelineEventDto(int Id, string Status, string? Notes, DateTime CreatedOn);

public record AddTimelineRequest(string Status, string? Notes, int? AssignedHrId);

public record CancelTicketRequest(int EmployeeId, string Reason);
