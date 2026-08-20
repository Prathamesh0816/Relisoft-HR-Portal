using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class JobPosting
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = "";
    [Required, MaxLength(100)]
    public string Department { get; set; } = "";
    [MaxLength(100)]
    public string Location { get; set; } = "";
    [MaxLength(50)]
    public string EmploymentType { get; set; } = "Full-time"; // Full-time, Part-time, Contract, Intern
    [MaxLength(50)]
    public string ExperienceRequired { get; set; } = "";
    public int Openings { get; set; } = 1;
    [MaxLength(4000)]
    public string Description { get; set; } = "";
    [MaxLength(50)]
    public string Status { get; set; } = "Open"; // Open, Closed
    public DateTime PostedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedOn { get; set; }
    public int CreatedByEmployeeId { get; set; }

    [ForeignKey(nameof(CreatedByEmployeeId))]
    public Employee? CreatedBy { get; set; }
    public ICollection<Candidate> Candidates { get; set; } = new List<Candidate>();
}

public class Candidate
{
    [Key]
    public int Id { get; set; }
    public int JobPostingId { get; set; }
    [Required, MaxLength(200)]
    public string FullName { get; set; } = "";
    [Required, MaxLength(200)]
    public string Email { get; set; } = "";
    [MaxLength(30)]
    public string Phone { get; set; } = "";
    [MaxLength(4000)]
    public string ResumeSummary { get; set; } = "";
    [MaxLength(50)]
    public string Stage { get; set; } = "Applied"; // Applied, Shortlisted, Interview, Offered, Hired, Rejected
    [MaxLength(50)]
    public string Source { get; set; } = ""; // Referral, LinkedIn, Portal, Walk-in, Internal
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public int? AppliedByEmployeeId { get; set; }

    [ForeignKey(nameof(JobPostingId))]
    public JobPosting? JobPosting { get; set; }
    [ForeignKey(nameof(AppliedByEmployeeId))]
    public Employee? AppliedBy { get; set; }
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}

public class Interview
{
    [Key]
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobPostingId { get; set; }
    public int InterviewerEmployeeId { get; set; }
    public DateTime ScheduledAt { get; set; }
    [MaxLength(50)]
    public string Mode { get; set; } = "Video"; // Video, In-person, Phone
    [MaxLength(50)]
    public string Round { get; set; } = "Screening"; // Screening, Technical, Managerial, HR, Final
    [MaxLength(50)]
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled, No-show
    [MaxLength(2000)]
    public string Feedback { get; set; } = "";
    public int Rating { get; set; } = 0; // 1-5
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(CandidateId))]
    public Candidate? Candidate { get; set; }
    [ForeignKey(nameof(JobPostingId))]
    public JobPosting? JobPosting { get; set; }
    [ForeignKey(nameof(InterviewerEmployeeId))]
    public Employee? Interviewer { get; set; }
}

public class JobOffer
{
    [Key]
    public int Id { get; set; }
    public int CandidateId { get; set; }
    public int JobPostingId { get; set; }
    [Required, MaxLength(200)]
    public string Position { get; set; } = "";
    public decimal OfferedSalary { get; set; }
    [MaxLength(2000)]
    public string Notes { get; set; } = "";
    [MaxLength(50)]
    public string Status { get; set; } = "Sent"; // Sent, Accepted, Declined, Joined
    public DateTime? DecisionDate { get; set; }
    public DateTime OfferedOn { get; set; } = DateTime.UtcNow;
    public int CreatedByEmployeeId { get; set; }

    [ForeignKey(nameof(CandidateId))]
    public Candidate? Candidate { get; set; }
    [ForeignKey(nameof(JobPostingId))]
    public JobPosting? JobPosting { get; set; }
    [ForeignKey(nameof(CreatedByEmployeeId))]
    public Employee? CreatedBy { get; set; }
}