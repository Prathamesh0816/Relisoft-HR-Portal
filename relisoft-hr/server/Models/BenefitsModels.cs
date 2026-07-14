using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class BenefitPlan
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string Name { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    public decimal EmployeeCost { get; set; }
    public decimal EmployerCost { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class BenefitEnrollment
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int BenefitPlanId { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public DateTime? EffectiveDate { get; set; }
    public DateTime? TerminationDate { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Active";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
    [ForeignKey(nameof(BenefitPlanId))] public BenefitPlan? BenefitPlan { get; set; }
}
