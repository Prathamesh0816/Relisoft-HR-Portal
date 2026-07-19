using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class AppraisalCycle : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Active"; // Active, Closed
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }
}
