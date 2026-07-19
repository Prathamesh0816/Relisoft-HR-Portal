using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class TimesheetEntry : ISoftDeletable, IHasRowVersion
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int? ProjectId { get; set; }
    public DateTime Date { get; set; }
    public double Hours { get; set; }
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    public int? ApprovedById { get; set; }
    public DateTime? ApprovedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public int? DeletedById { get; set; }
    public byte[]? RowVersion { get; set; }

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }
    [ForeignKey(nameof(ApprovedById))] public Employee? ApprovedBy { get; set; }
}

public class TimesheetPeriod
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime WeekStart { get; set; }
    public DateTime WeekEnd { get; set; }
    public double TotalHours { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Draft";
    public int? ApprovedById { get; set; }
    public DateTime? ApprovedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
    [ForeignKey(nameof(ApprovedById))] public Employee? ApprovedBy { get; set; }
}
