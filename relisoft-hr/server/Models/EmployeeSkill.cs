using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeSkill : ISoftDeletable, IHasRowVersion
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
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public int? DeletedById { get; set; }
    public byte[]? RowVersion { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
