using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class MentorshipProfile
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public bool IsMentor { get; set; }
    public bool IsMentee { get; set; }
    [MaxLength(500)]
    public string Bio { get; set; } = "";
    [MaxLength(500)]
    public string AreasOfExpertise { get; set; } = "";
    [MaxLength(500)]
    public string Goals { get; set; } = "";
    public int MaxMentees { get; set; } = 3;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}

public class MentorshipMatch
{
    [Key]
    public int Id { get; set; }
    public int MentorId { get; set; }
    public int MenteeId { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    [MaxLength(1000)]
    public string Goals { get; set; } = "";
    [MaxLength(1000)]
    public string Notes { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(MentorId))]
    public Employee? Mentor { get; set; }
    [ForeignKey(nameof(MenteeId))]
    public Employee? Mentee { get; set; }
}

public class MentorshipSession
{
    [Key]
    public int Id { get; set; }
    public int MatchId { get; set; }
    public DateTime Date { get; set; }
    public int DurationMinutes { get; set; }
    [MaxLength(2000)]
    public string Notes { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(MatchId))]
    public MentorshipMatch? Match { get; set; }
}
