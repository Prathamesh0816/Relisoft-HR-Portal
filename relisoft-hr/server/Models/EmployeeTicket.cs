using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeTicket
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [Required, MaxLength(50)]
    public string Category { get; set; } = "General";
    [Required, MaxLength(100)]
    public string RequestType { get; set; } = "Other Inquiry";
    [MaxLength(200)]
    public string? ItemDetail { get; set; }
    [Required, MaxLength(500)]
    public string Subject { get; set; } = "";
    public string Description { get; set; } = "";
    [Required, MaxLength(50)]
    public string Status { get; set; } = "Submitted";
    public int? AssignedHrId { get; set; }
    public string? AssignedHrName { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    public ICollection<EmployeeTicketTimelineEvent> Timeline { get; set; } = new List<EmployeeTicketTimelineEvent>();
}
