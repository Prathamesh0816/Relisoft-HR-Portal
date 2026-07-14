using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeTicketTimelineEvent
{
    [Key]
    public int Id { get; set; }
    public int TicketId { get; set; }
    [Required, MaxLength(50)]
    public string Status { get; set; } = "";
    public string? Notes { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(TicketId))]
    public EmployeeTicket? Ticket { get; set; }
}
