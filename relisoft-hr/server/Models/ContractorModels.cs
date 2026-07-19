using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class Contractor : IHasRowVersion
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string CompanyName { get; set; } = "";
    [MaxLength(200)] public string ContactPerson { get; set; } = "";
    [MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(50)] public string Phone { get; set; } = "";
    [MaxLength(500)] public string Services { get; set; } = "";
    public DateTime ContractStart { get; set; }
    public DateTime ContractEnd { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Active";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }
}

public class ContractorEmployee : IHasRowVersion
{
    [Key] public int Id { get; set; }
    public int ContractorId { get; set; }
    [Required, MaxLength(200)] public string FullName { get; set; } = "";
    [MaxLength(200)] public string Email { get; set; } = "";
    [MaxLength(50)] public string Phone { get; set; } = "";
    [MaxLength(200)] public string Designation { get; set; } = "";
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public byte[]? RowVersion { get; set; }

    [ForeignKey(nameof(ContractorId))] public Contractor? Contractor { get; set; }
}
