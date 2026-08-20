using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class PasswordResetToken
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [Required, MaxLength(200)]
    public string Token { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresOn { get; set; }
    public DateTime? UsedOn { get; set; }
    [MaxLength(200)]
    public string? RequestedByIp { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}

public class LeaveEncashment
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int LeaveTypeId { get; set; }
    public decimal DaysRequested { get; set; }
    public decimal RatePerDay { get; set; }
    public decimal Amount { get; set; }
    [MaxLength(500)]
    public string? Reason { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Paid
    public DateTime? ApprovedOn { get; set; }
    public int? ApprovedById { get; set; }
    public DateTime? PaidOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(LeaveTypeId))]
    public LeaveType? LeaveType { get; set; }
    [ForeignKey(nameof(ApprovedById))]
    public Employee? ApprovedBy { get; set; }
}

public class AuditLogEntry
{
    [Key]
    public int Id { get; set; }
    public int? ActorEmployeeId { get; set; }
    [MaxLength(100)]
    public string? ActorName { get; set; }
    [MaxLength(50)]
    public string Action { get; set; } = "";      // e.g. SalaryUpdated, LeaveBalanceAdjusted, DocumentVerified
    [MaxLength(100)]
    public string EntityType { get; set; } = "";  // e.g. SalaryStructure, LeaveBalance, EmployeeDocument
    public int? EntityId { get; set; }
    [MaxLength(500)]
    public string? Details { get; set; }
    [MaxLength(500)]
    public string? BeforeJson { get; set; }
    [MaxLength(500)]
    public string? AfterJson { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(ActorEmployeeId))]
    public Employee? Actor { get; set; }
}

public class AttendanceRegularization
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int AttendanceRecordId { get; set; }
    [MaxLength(50)]
    public string RequestType { get; set; } = ""; // LateArrival, EarlyDeparture, MissedPunch, WorkFromHome
    [MaxLength(500)]
    public string? Reason { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime? ApprovedOn { get; set; }
    public int? ApprovedById { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(AttendanceRecordId))]
    public AttendanceRecord? AttendanceRecord { get; set; }
    [ForeignKey(nameof(ApprovedById))]
    public Employee? ApprovedBy { get; set; }
}