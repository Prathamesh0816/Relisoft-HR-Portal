using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Notification
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(2000)] public string Message { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(200)] public string Link { get; set; } = "";
    public bool IsRead { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
}

public class NotificationTemplate
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string EventType { get; set; } = "";
    [MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(2000)] public string Message { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}
