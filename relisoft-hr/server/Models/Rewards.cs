using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class RewardPointsAccount
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int Balance { get; set; }
    public int LifetimeEarned { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}

public class RewardTransaction
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int Points { get; set; }
    [MaxLength(50)]
    public string Type { get; set; } = ""; // Earned, Redeemed, Expired
    [MaxLength(500)]
    public string Reference { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
}

public class RewardCatalogItem : IHasRowVersion
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(200)]
    public string Name { get; set; } = "";
    [MaxLength(1000)]
    public string Description { get; set; } = "";
    public int PointsCost { get; set; }
    [MaxLength(500)]
    public string ImageUrl { get; set; } = "";
    [MaxLength(100)]
    public string Category { get; set; } = "";
    public int Quantity { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }
}

public class RewardRedemption
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ItemId { get; set; }
    public int PointsCost { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Fulfilled, Rejected
    [MaxLength(500)]
    public string Notes { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? FulfilledOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(ItemId))]
    public RewardCatalogItem? Item { get; set; }
}
