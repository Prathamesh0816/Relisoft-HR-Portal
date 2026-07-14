using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeOffboarding
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
    public DateTime ResignationDate { get; set; }
    public DateTime? LastWorkingDay { get; set; }
    public DateTime? AssetsReturnedOn { get; set; }
    public DateTime? IdDeactivatedOn { get; set; }
    public DateTime? EmailDeactivatedOn { get; set; }
    public DateTime? GatePassReturnedOn { get; set; }
    [MaxLength(1000)]
    public string? Remarks { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
