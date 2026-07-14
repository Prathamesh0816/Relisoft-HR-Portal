using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class TrainingCourse
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(2000)] public string Description { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(100)] public string Provider { get; set; } = "";
    public int DurationHours { get; set; }
    [MaxLength(50)] public string Mode { get; set; } = "Online";
    [MaxLength(500)] public string ResourceUrl { get; set; } = "";
    public int MaxSeats { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class TrainingRegistration
{
    [Key] public int Id { get; set; }
    public int CourseId { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Registered";
    public int? Score { get; set; }
    public bool IsCertified { get; set; }
    public DateTime? CompletedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(CourseId))] public TrainingCourse? Course { get; set; }
    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
}
