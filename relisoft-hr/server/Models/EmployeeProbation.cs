using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeProbation
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime OriginalEndDate { get; set; }
    public DateTime? CurrentEndDate { get; set; }
    public int ExtensionCount { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Probation"; // Probation, Confirmed, Extended, Separated
    [MaxLength(500)]
    public string? Notes { get; set; }
    public DateTime? ConfirmedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
