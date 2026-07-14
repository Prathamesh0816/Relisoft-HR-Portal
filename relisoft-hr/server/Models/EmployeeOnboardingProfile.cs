using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeOnboardingProfile
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(20)]
    public string? PanNumber { get; set; }
    [MaxLength(20)]
    public string? AadhaarNumber { get; set; }
    public bool HasPriorExperience { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    public ICollection<EmployeeOnboardingExperience> Experiences { get; set; } = new List<EmployeeOnboardingExperience>();
    public ICollection<EmployeeOnboardingDocument> Documents { get; set; } = new List<EmployeeOnboardingDocument>();
}
