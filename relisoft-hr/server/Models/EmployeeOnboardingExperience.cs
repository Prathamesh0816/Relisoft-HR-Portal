using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeOnboardingExperience
{
    [Key]
    public int Id { get; set; }
    public int OnboardingProfileId { get; set; }
    [MaxLength(200)]
    public string CompanyName { get; set; } = "";
    [MaxLength(200)]
    public string JobTitle { get; set; } = "";
    public decimal? YearsOfExperience { get; set; }
    public bool RelievingEmailForwarded { get; set; }

    [ForeignKey(nameof(OnboardingProfileId))]
    public EmployeeOnboardingProfile? Profile { get; set; }
}
