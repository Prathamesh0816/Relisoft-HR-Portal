namespace RelisoftHR.DTOs;

public record HrPolicyDocumentDto(
    int Id,
    string Title,
    string Category,
    string? Description,
    string FileName,
    long FileSize,
    string? MimeType,
    int UploadedById,
    string? UploadedByName,
    DateTime UploadedOn,
    DateTime? EffectiveDate,
    DateTime? ExpiryDate,
    bool IsActive,
    string? Version,
    string? Tags
);

public record CreateHrPolicyDocumentDto(
    string Title,
    string Category,
    string? Description,
    DateTime? EffectiveDate,
    DateTime? ExpiryDate,
    string? Version,
    string? Tags
);

public record UpdateHrPolicyDocumentDto(
    string? Title,
    string? Category,
    string? Description,
    DateTime? EffectiveDate,
    DateTime? ExpiryDate,
    bool? IsActive,
    string? Version,
    string? Tags
);
