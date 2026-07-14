using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class LeaveType
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public decimal CarryForwardPct { get; set; }
    public bool IsCompOff { get; set; }
    public bool IsFloaterHoliday { get; set; }
    public int MaxFloaterPerYear { get; set; }
    public int CompOffValidityDays { get; set; }
}
