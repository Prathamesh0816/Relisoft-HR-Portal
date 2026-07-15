using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class LeaveApplication
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public bool IsHalfDay { get; set; }
    public decimal TotalDays { get; set; }
    [MaxLength(500)]
    public string? Reason { get; set; }
    [Required, MaxLength(50)]
    public string Status { get; set; } = "Pending";
    public int? ApproverId { get; set; }
    public string? ApproverName { get; set; }
    [MaxLength(500)]
    public string? ApprovalReason { get; set; }
    public DateTime AppliedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ActionedOn { get; set; }
    public bool CanCancel { get; set; } = true;
    public bool IsMedicalLeave { get; set; }
    public string? MedicalCertificatePath { get; set; }
    public bool LossOfPay { get; set; }

    public string? CancellationReason { get; set; }
    public DateTime? CancellationRequestedOn { get; set; }
    public int? CancellationActionedById { get; set; }
    public DateTime? CancellationActionedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(LeaveTypeId))]
    public LeaveType? LeaveType { get; set; }
}
