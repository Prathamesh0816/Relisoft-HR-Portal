using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class LeaveCarryForwardLog
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    [MaxLength(10)]
    public string FromFinancialYear { get; set; } = "";
    [MaxLength(10)]
    public string ToFinancialYear { get; set; } = "";
    public decimal PreviousYearRemaining { get; set; }
    public decimal CarryForwardPct { get; set; }
    public decimal CarryForwardDays { get; set; }
    public decimal LapsedDays { get; set; }
    [MaxLength(20)]
    public string TriggerType { get; set; } = "";
    public int? ProcessedById { get; set; }
    public DateTime ProcessedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(LeaveTypeId))]
    public LeaveType? LeaveType { get; set; }
}
