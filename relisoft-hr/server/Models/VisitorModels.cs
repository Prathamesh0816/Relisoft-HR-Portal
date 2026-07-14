using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Visitor
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string FullName { get; set; } = "";
    [MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(50)] public string Phone { get; set; } = "";
    [MaxLength(200)] public string Company { get; set; } = "";
    [MaxLength(200)] public string VisitingEmployee { get; set; } = "";
    [MaxLength(200)] public string Purpose { get; set; } = "";
    public DateTime ExpectedDate { get; set; }
    public TimeSpan ExpectedTime { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Expected";
    [MaxLength(500)] public string Notes { get; set; } = "";
    public bool HasIdCard { get; set; }
    public int? HostEmployeeId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(HostEmployeeId))] public Employee? HostEmployee { get; set; }
}
