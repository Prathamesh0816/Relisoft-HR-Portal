using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class UserLogin
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [Required, MaxLength(100)]
    public string Username { get; set; } = "";
    [Required, MaxLength(500)]
    public string PasswordHash { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
