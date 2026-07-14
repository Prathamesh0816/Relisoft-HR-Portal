using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class CommuteRoute
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    [MaxLength(200)]
    public string SourceArea { get; set; } = "";
    [MaxLength(200)]
    public string DestinationArea { get; set; } = "";
    [MaxLength(100)]
    public string CommuteDays { get; set; } = "";
    public TimeSpan PreferredTime { get; set; }
    public bool IsDriver { get; set; }
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}

public class CarpoolGroup
{
    [Key]
    public int Id { get; set; }
    [MaxLength(200)]
    public string Name { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public ICollection<CarpoolMember> Members { get; set; } = new List<CarpoolMember>();
}

public class CarpoolMember
{
    [Key]
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int EmployeeId { get; set; }
    public bool IsDriver { get; set; }
    public DateTime JoinedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(GroupId))]
    public CarpoolGroup? Group { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}
