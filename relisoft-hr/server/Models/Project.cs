using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public enum ProjectApprovalRoute
{
    ProjectManager,
    TeamLead,
    Delegate
}

public class Project : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public int? ManagerId { get; set; }
    public ProjectApprovalRoute ApprovalRoute { get; set; } = ProjectApprovalRoute.ProjectManager;
    public int? ApprovalDelegateId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }

    public Employee? Manager { get; set; }
    public ApprovalDelegate? ApprovalDelegate { get; set; }
    public ICollection<Team> Teams { get; set; } = new List<Team>();
    public ICollection<EmployeeProject> EmployeeProjects { get; set; } = new List<EmployeeProject>();
}
