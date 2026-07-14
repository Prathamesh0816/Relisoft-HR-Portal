using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class ShiftTemplate
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public double TotalHours { get; set; }
    public bool IsNightShift { get; set; }
    [MaxLength(500)] public string Description { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class ShiftAssignment
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ShiftTemplateId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    [MaxLength(50)] public string DayOfWeek { get; set; } = "";
    public bool IsRecurring { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
    [ForeignKey(nameof(ShiftTemplateId))] public ShiftTemplate? ShiftTemplate { get; set; }
}

public class ShiftSwap
{
    [Key] public int Id { get; set; }
    public int RequestedById { get; set; }
    public int TargetEmployeeId { get; set; }
    public DateTime Date { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    [MaxLength(500)] public string Reason { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(RequestedById))] public Employee? RequestedBy { get; set; }
    [ForeignKey(nameof(TargetEmployeeId))] public Employee? TargetEmployee { get; set; }
}
