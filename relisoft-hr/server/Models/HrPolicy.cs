using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class HrPolicy
{
    [Key]
    public int Id { get; set; }
    public bool AllowHalfDayLeave { get; set; }
    public bool SandwichLeave { get; set; }
    public DateTime UpdatedOn { get; set; }
}
