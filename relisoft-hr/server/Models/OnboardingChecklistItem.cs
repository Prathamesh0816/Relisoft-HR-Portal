using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class OnboardingChecklistItem
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool IsMandatory { get; set; } = true;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}
