using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class LeaveApplicationHistory
{
    [Key]
    public int Id { get; set; }
    public int LeaveApplicationId { get; set; }
    [MaxLength(100)]
    public string EventType { get; set; } = "";
    public int? ActorEmployeeId { get; set; }
    [MaxLength(500)]
    public string? Notes { get; set; }
    public DateTime OccurredOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(LeaveApplicationId))]
    public LeaveApplication? LeaveApplication { get; set; }
}
