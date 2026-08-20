using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Kudos
{
    [Key]
    public int Id { get; set; }
    public int GiverEmployeeId { get; set; }
    public int ReceiverEmployeeId { get; set; }
    [Required, MaxLength(50)]
    public string Category { get; set; } = ""; // Teamwork, Innovation, Leadership, Customer Focus, Above & Beyond, Other
    [MaxLength(1000)]
    public string Message { get; set; } = "";
    public int Points { get; set; } = 10;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(GiverEmployeeId))]
    public Employee? Giver { get; set; }
    [ForeignKey(nameof(ReceiverEmployeeId))]
    public Employee? Receiver { get; set; }
}

public class RecognitionAward
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = "";
    [MaxLength(1000)]
    public string Description { get; set; } = "";
    [MaxLength(50)]
    public string Category { get; set; } = ""; // Individual, Team, Special
    [MaxLength(50)]
    public string Scope { get; set; } = ""; // Monthly, Quarterly, Annual, FunFriday
    [MaxLength(100)]
    public string PeriodLabel { get; set; } = ""; // e.g. "Aug 2026", "Q3 2026", "2026"
    [MaxLength(500)]
    public string ImageUrl { get; set; } = "";
    public int AwardPoints { get; set; } = 100;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public int CreatedByEmployeeId { get; set; }

    [ForeignKey(nameof(CreatedByEmployeeId))]
    public Employee? CreatedBy { get; set; }
    public ICollection<RecognitionAwardRecipient> Recipients { get; set; } = new List<RecognitionAwardRecipient>();
}

public class RecognitionAwardRecipient
{
    [Key]
    public int Id { get; set; }
    public int AwardId { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(200)]
    public string? TeamName { get; set; } // populated for team awards
    [MaxLength(50)]
    public string RecognitionType { get; set; } = "Individual"; // Individual, Team, Special
    [MaxLength(1000)]
    public string Reason { get; set; } = "";
    public DateTime AwardedOn { get; set; } = DateTime.UtcNow;
    public int AwardedByEmployeeId { get; set; }

    [ForeignKey(nameof(AwardId))]
    public RecognitionAward? Award { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(AwardedByEmployeeId))]
    public Employee? AwardedBy { get; set; }
}

public class FunFridayCelebration
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Title { get; set; } = "";
    [MaxLength(1000)]
    public string Description { get; set; } = "";
    [MaxLength(500)]
    public string ImageUrl { get; set; } = "";
    public DateTime CelebrationDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public int CreatedByEmployeeId { get; set; }

    [ForeignKey(nameof(CreatedByEmployeeId))]
    public Employee? CreatedBy { get; set; }
}