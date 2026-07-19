using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeOnboardingDocument
{
    [Key]
    public int Id { get; set; }
    public int OnboardingProfileId { get; set; }
    public int? ExperienceId { get; set; }
    [Required, MaxLength(100)]
    public string DocumentType { get; set; } = "";
    [Required, MaxLength(500)]
    public string OriginalFileName { get; set; } = "";
    [Required, MaxLength(500)]
    public string StoredFilePath { get; set; } = "";
    public string? ExperienceCompanyName { get; set; }
    public DateTime UploadedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(OnboardingProfileId))]
    public EmployeeOnboardingProfile? Profile { get; set; }
    public EmployeeOnboardingExperience? Experience { get; set; }
}
