using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class Holiday
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public DateOnly Date { get; set; }
    [Required, MaxLength(50)]
    public string Type { get; set; } = ""; // "Fixed" or "Optional"
}
