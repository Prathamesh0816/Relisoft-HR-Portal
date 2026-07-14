namespace RelisoftHR.DTOs;

public record OnboardingProfileResponse(
    EmployeeOnboardingProfileDto? Profile,
    List<OnboardingDocumentDto> Documents
);

public record EmployeeOnboardingProfileDto(
    int Id, string? PanNumber, string? AadhaarNumber, bool HasPriorExperience,
    List<OnboardingExperienceDto> Experiences
);

public record OnboardingExperienceDto(
    int Id, string CompanyName, string JobTitle, decimal? YearsOfExperience,
    bool RelievingEmailForwarded
);

public record OnboardingDocumentDto(
    int Id, string DocumentType, string OriginalFileName,
    int? EmployeeOnboardingExperienceId, string? ExperienceCompanyName
);
