using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class ComplianceRequirement : IHasRowVersion
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string Name { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(200)] public string Authority { get; set; } = "";
    public DateTime DueDate { get; set; }
    public bool IsRecurring { get; set; }
    public int RecurrenceDays { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }
}

public class ComplianceRecord
{
    [Key] public int Id { get; set; }
    public int RequirementId { get; set; }
    public int? EmployeeId { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    public DateTime? CompletedOn { get; set; }
    [MaxLength(1000)] public string Notes { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(RequirementId))] public ComplianceRequirement? Requirement { get; set; }
    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
}
