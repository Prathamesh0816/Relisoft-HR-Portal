using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class MoodEntry
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int Score { get; set; }
    [MaxLength(500)]
    public string? Note { get; set; }
    public bool IsAnonymous { get; set; }
    public DateTime Date { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
