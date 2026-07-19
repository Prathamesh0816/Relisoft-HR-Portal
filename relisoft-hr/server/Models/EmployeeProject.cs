using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeProject
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ProjectId { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime AssignedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(ProjectId))]
    public Project? Project { get; set; }
}
