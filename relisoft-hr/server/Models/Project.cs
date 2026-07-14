using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class Project
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public ICollection<Team> Teams { get; set; } = new List<Team>();
}
