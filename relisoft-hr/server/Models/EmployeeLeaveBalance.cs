using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeLeaveBalance
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public decimal AllocatedLeaves { get; set; }
    public decimal UsedLeaves { get; set; }
    public decimal RemainingLeaves { get; set; }
    public decimal CarryForwardDays { get; set; }
    [MaxLength(10)]
    public string FinancialYear { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(LeaveTypeId))]
    public LeaveType? LeaveType { get; set; }
}
