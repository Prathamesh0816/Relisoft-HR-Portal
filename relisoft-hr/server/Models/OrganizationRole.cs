using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class OrganizationRole
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";
    [MaxLength(100)]
    public string? Label { get; set; }
    public bool IsCustom { get; set; }
    public int BaseRoleId { get; set; }
    public int Importance { get; set; }
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}
