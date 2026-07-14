using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeSkill
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(100)]
    public string SkillName { get; set; } = "";
    [MaxLength(100)]
    public string Category { get; set; } = "";
    public int EndorsementCount { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
