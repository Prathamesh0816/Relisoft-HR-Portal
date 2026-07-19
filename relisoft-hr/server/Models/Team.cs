using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class Team : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public int ProjectId { get; set; }
    public int LeadId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }

    public Project? Project { get; set; }
    public Employee? Lead { get; set; }
    public ICollection<EmployeeTeam> EmployeeTeams { get; set; } = new List<EmployeeTeam>();
}
