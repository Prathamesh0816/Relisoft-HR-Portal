using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class WorkforceEmployee
{
    [Key] public int Id { get; set; }
    [MaxLength(50)] public string EmployeeCode { get; set; } = "";
    [MaxLength(200)] public string FullName { get; set; } = "";
    [MaxLength(100)] public string Team { get; set; } = "";
    [MaxLength(100)] public string Role { get; set; } = "";
    [MaxLength(20)] public string Criticality { get; set; } = "Medium";
    [MaxLength(10)] public string BackupAvailable { get; set; } = "No";
    public int ExperienceYears { get; set; }
    public double AnnualSalaryUsd { get; set; }
    public double TenureYears { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforceProject
{
    [Key] public int Id { get; set; }
    [MaxLength(50)] public string ProjectCode { get; set; } = "";
    [MaxLength(200)] public string ProjectName { get; set; } = "";
    [MaxLength(100)] public string Team { get; set; } = "";
    [MaxLength(20)] public string Criticality { get; set; } = "Medium";
    public int DeadlineDays { get; set; }
    [MaxLength(200)] public string Client { get; set; } = "";
    public double AnnualContractValueUsd { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Active";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforceDependency
{
    [Key] public int Id { get; set; }
    public int OwnerId { get; set; }
    [MaxLength(200)] public string OwnerName { get; set; } = "";
    public int DependentId { get; set; }
    [MaxLength(200)] public string DependentName { get; set; } = "";
    [MaxLength(100)] public string DependencyType { get; set; } = "";
    [MaxLength(20)] public string Criticality { get; set; } = "Medium";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforceKnowledge
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(200)] public string EmployeeName { get; set; } = "";
    [MaxLength(200)] public string KnowledgeArea { get; set; } = "";
    [MaxLength(20)] public string DocumentationLevel { get; set; } = "Low";
    [MaxLength(20)] public string Proficiency { get; set; } = "Beginner";
    public DateTime? LastUpdated { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforcePerformance
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(200)] public string EmployeeName { get; set; } = "";
    [MaxLength(100)] public string Team { get; set; } = "";
    [MaxLength(20)] public string PerformanceRating { get; set; } = "";
    public int GoalsCompleted { get; set; }
    public int GoalsTotal { get; set; }
    public DateTime? LastReviewDate { get; set; }
    public int EngagementScore { get; set; }
    public double TenureAtCompany { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforceWorkload
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(200)] public string EmployeeName { get; set; } = "";
    [MaxLength(100)] public string Team { get; set; } = "";
    public int WeeklyHours { get; set; }
    [MaxLength(20)] public string TaskDifficulty { get; set; } = "Medium";
    public int ActiveProjects { get; set; }
    public int OverdueTasks { get; set; }
    public int PtoPlannedDays { get; set; }
    public int LastPtoDays { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforceScenario
{
    [Key] public int Id { get; set; }
    [MaxLength(200)] public string Name { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    [MaxLength(2000)] public string Configuration { get; set; } = "";
    public double BaselineScore { get; set; }
    public double ProjectedScore { get; set; }
    public double Impact { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Active";
    public int CreatedById { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class WorkforceFeedback
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(200)] public string EmployeeName { get; set; } = "";
    [MaxLength(200)] public string ActionTitle { get; set; } = "";
    [MaxLength(20)] public string Decision { get; set; } = "";
    [MaxLength(2000)] public string Reason { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}
