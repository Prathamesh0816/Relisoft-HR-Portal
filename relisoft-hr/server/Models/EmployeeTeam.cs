using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeTeam
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int TeamId { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(TeamId))]
    public Team? Team { get; set; }
}
