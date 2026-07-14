using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class SkillEndorsement
{
    [Key]
    public int Id { get; set; }
    public int EmployeeSkillId { get; set; }
    public int EndorsedById { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeSkillId))]
    public EmployeeSkill? EmployeeSkill { get; set; }
    [ForeignKey(nameof(EndorsedById))]
    public Employee? EndorsedBy { get; set; }
}
