using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeOnboarding
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Rejected
    public int CompletedSteps { get; set; }
    public int TotalSteps { get; set; }
    public DateTime? ReliSoftIdCreatedOn { get; set; }
    public DateTime? ClientIdCreatedOn { get; set; }
    public DateTime? VirtualIdCardIssuedOn { get; set; }
    public DateTime? GatePassIssuedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    public ICollection<EmployeeOnboardingStep> Steps { get; set; } = new List<EmployeeOnboardingStep>();
}

public class EmployeeOnboardingStep
{
    [Key]
    public int Id { get; set; }
    public int OnboardingId { get; set; }
    public int ChecklistItemId { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Completed, Skipped
    public DateTime? CompletedOn { get; set; }
    [MaxLength(500)]
    public string? Notes { get; set; }

    [ForeignKey(nameof(OnboardingId))]
    public EmployeeOnboarding? Onboarding { get; set; }
    [ForeignKey(nameof(ChecklistItemId))]
    public OnboardingChecklistItem? ChecklistItem { get; set; }
}
