using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class HrPolicyDocument
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(100)] public string Category { get; set; } = "";
    [MaxLength(500)] public string? Description { get; set; }
    [Required, MaxLength(200)] public string FileName { get; set; } = "";
    [Required, MaxLength(500)] public string FilePath { get; set; } = "";
    public long FileSize { get; set; }
    [MaxLength(100)] public string? MimeType { get; set; }
    public int UploadedById { get; set; }
    public DateTime UploadedOn { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
    [MaxLength(50)] public string? Version { get; set; }
    [MaxLength(200)] public string? Tags { get; set; }

    [ForeignKey(nameof(UploadedById))] public Employee? UploadedBy { get; set; }
}
