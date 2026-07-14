using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class BragPost
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [Required, MaxLength(1000)]
    public string Message { get; set; } = "";
    public int LikeCount { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    public ICollection<BragLike> Likes { get; set; } = new List<BragLike>();
}

public class BragLike
{
    [Key]
    public int Id { get; set; }
    public int BragPostId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(BragPostId))]
    public BragPost? BragPost { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
