using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Employee
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(50)]
    public string EmployeeCode { get; set; } = "";
    [Required, MaxLength(200)]
    public string FullName { get; set; } = "";
    [Required, MaxLength(200)]
    public string Email { get; set; } = "";
    [MaxLength(100)]
    public string Department { get; set; } = "";
    [MaxLength(100)]
    public string Designation { get; set; } = "";
    [MaxLength(100)]
    public string JobRole { get; set; } = "";
    [MaxLength(50)]
    public string EmploymentType { get; set; } = "Full-time";
    [MaxLength(50)]
    public string Status { get; set; } = "Active"; // Active, Inactive, Onboarding, Offboarding, Separated
    [MaxLength(100)]
    public string Location { get; set; } = "";
    public int? SalaryStructureId { get; set; }
    public DateTime JoinDate { get; set; }
    public int RoleId { get; set; }
    public int? PrimaryTeamId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(RoleId))]
    public OrganizationRole? Role { get; set; }
    [ForeignKey(nameof(PrimaryTeamId))]
    public Team? PrimaryTeam { get; set; }
    [ForeignKey(nameof(SalaryStructureId))]
    public SalaryStructure? SalaryStructure { get; set; }
    public ICollection<EmployeeTeam> EmployeeTeams { get; set; } = new List<EmployeeTeam>();
    public ICollection<EmployeeLeaveBalance> LeaveBalances { get; set; } = new List<EmployeeLeaveBalance>();
    public ICollection<LeaveApplication> LeaveApplications { get; set; } = new List<LeaveApplication>();
    public UserLogin? UserLogin { get; set; }
    public EmployeeOnboarding? Onboarding { get; set; }
    public EmployeeOffboarding? Offboarding { get; set; }
    public EmployeeProbation? Probation { get; set; }
    public ICollection<EmployeeAsset> Assets { get; set; } = new List<EmployeeAsset>();
    public ICollection<EmployeeAppraisal> Appraisals { get; set; } = new List<EmployeeAppraisal>();
    public ICollection<SalaryDiscussion> SalaryDiscussions { get; set; } = new List<SalaryDiscussion>();
    public ICollection<EmployeeDocument> Documents { get; set; } = new List<EmployeeDocument>();
}
