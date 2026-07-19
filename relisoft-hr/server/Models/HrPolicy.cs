using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class HrPolicy : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    public bool AllowHalfDayLeave { get; set; }
    public bool SandwichLeave { get; set; }
    public DateTime UpdatedOn { get; set; }
    public byte[]? RowVersion { get; set; }
}
