using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class EmployeeAppraisal
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int CycleId { get; set; }
    public int? ReviewerId { get; set; }
    public int? SelfRating { get; set; }
    public int? ManagerRating { get; set; }
    public int? FinalRating { get; set; }
    [MaxLength(2000)]
    public string? SelfComments { get; set; }
    [MaxLength(2000)]
    public string? ManagerComments { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Draft"; // Draft, Submitted, UnderReview, Completed
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedOn { get; set; }
    public DateTime? CompletedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(CycleId))]
    public AppraisalCycle? Cycle { get; set; }
    [ForeignKey(nameof(ReviewerId))]
    public Employee? Reviewer { get; set; }
    public ICollection<EmployeeAppraisalGoal> Goals { get; set; } = new List<EmployeeAppraisalGoal>();
}

public class EmployeeAppraisalGoal : ISoftDeletable
{
    [Key]
    public int Id { get; set; }
    public int AppraisalId { get; set; }
    [MaxLength(500)]
    public string Goal { get; set; } = "";
    public DateTime? TargetDate { get; set; }
    public bool Achieved { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedOn { get; set; }
    public int? DeletedById { get; set; }

    [ForeignKey(nameof(AppraisalId))]
    public EmployeeAppraisal? Appraisal { get; set; }
}
