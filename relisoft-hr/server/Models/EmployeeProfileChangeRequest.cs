using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeProfileChangeRequest
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [Required, MaxLength(100)]
    public string Field { get; set; } = "";
    [MaxLength(1000)]
    public string? OldValue { get; set; }
    [MaxLength(1000)]
    public string? NewValue { get; set; }
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public int RequestedById { get; set; }
    public DateTime RequestedOn { get; set; } = DateTime.UtcNow;
    public int? ReviewedById { get; set; }
    public DateTime? ReviewedOn { get; set; }
    [MaxLength(500)]
    public string? ReviewComments { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(RequestedById))]
    public Employee? RequestedBy { get; set; }
    [ForeignKey(nameof(ReviewedById))]
    public Employee? ReviewedBy { get; set; }
}
