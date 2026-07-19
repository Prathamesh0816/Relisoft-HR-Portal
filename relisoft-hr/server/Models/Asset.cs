using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Asset : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";
    [MaxLength(50)]
    public string AssetTag { get; set; } = "";
    [MaxLength(50)]
    public string Category { get; set; } = ""; // Laptop, Monitor, Keyboard, Mouse, Phone, AccessCard, etc.
    [MaxLength(200)]
    public string? SerialNumber { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Available"; // Available, Assigned, Damaged, Retired
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }
    public byte[]? RowVersion { get; set; }
}

public class EmployeeAsset
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int AssetId { get; set; }
    public DateTime AssignedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ReturnedOn { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Assigned"; // Assigned, Returned, Damaged

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(AssetId))]
    public Asset? Asset { get; set; }
}
