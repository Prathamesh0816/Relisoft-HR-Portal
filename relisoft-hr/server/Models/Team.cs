using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public enum TeamApprovalRoute
{
    ProjectManager,
    TeamLead,
    Delegate
}

public class Team : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public int ProjectId { get; set; }
    public int LeadId { get; set; }
    public TeamApprovalRoute ApprovalRoute { get; set; } = TeamApprovalRoute.ProjectManager;
    public int? ApprovalDelegateId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }

    public Project? Project { get; set; }
    public Employee? Lead { get; set; }
    public ApprovalDelegate? ApprovalDelegate { get; set; }
    public ICollection<EmployeeTeam> EmployeeTeams { get; set; } = new List<EmployeeTeam>();
}
