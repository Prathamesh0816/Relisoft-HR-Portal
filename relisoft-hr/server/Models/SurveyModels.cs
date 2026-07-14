using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Survey
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(2000)] public string Description { get; set; } = "";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsAnonymous { get; set; }
    public bool IsActive { get; set; } = true;
    public int CreatedById { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(CreatedById))] public Employee? CreatedBy { get; set; }
    public ICollection<SurveyQuestion> Questions { get; set; } = new List<SurveyQuestion>();
}

public class SurveyQuestion
{
    [Key] public int Id { get; set; }
    public int SurveyId { get; set; }
    [Required, MaxLength(1000)] public string QuestionText { get; set; } = "";
    [MaxLength(50)] public string QuestionType { get; set; } = "text";
    [MaxLength(2000)] public string Options { get; set; } = "";
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }

    [ForeignKey(nameof(SurveyId))] public Survey? Survey { get; set; }
}

public class SurveyResponse
{
    [Key] public int Id { get; set; }
    public int SurveyId { get; set; }
    public int QuestionId { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(5000)] public string Response { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(SurveyId))] public Survey? Survey { get; set; }
    [ForeignKey(nameof(QuestionId))] public SurveyQuestion? Question { get; set; }
    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
}
