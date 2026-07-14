using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class InternalJobPosting
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(2000)] public string Description { get; set; } = "";
    [MaxLength(500)] public string Requirements { get; set; } = "";
    [MaxLength(100)] public string Department { get; set; } = "";
    [MaxLength(100)] public string Location { get; set; } = "";
    public DateTime PostingDate { get; set; }
    public DateTime ClosingDate { get; set; }
    public bool IsActive { get; set; } = true;
    public int CreatedById { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(CreatedById))] public Employee? CreatedBy { get; set; }
}

public class InternalJobApplication
{
    [Key] public int Id { get; set; }
    public int JobPostingId { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(1000)] public string CoverNote { get; set; } = "";
    [MaxLength(50)] public string Status { get; set; } = "Applied";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(JobPostingId))] public InternalJobPosting? JobPosting { get; set; }
    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
}
