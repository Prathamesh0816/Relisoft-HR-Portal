using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class Project : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    public int? ManagerId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }

    public Employee? Manager { get; set; }
    public ICollection<Team> Teams { get; set; } = new List<Team>();
}
