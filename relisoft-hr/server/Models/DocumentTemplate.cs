using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class DocumentTemplate
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";
    [MaxLength(50)]
    public string DocumentType { get; set; } = ""; // OfferLetter, JoiningLetter, InternshipCompletionLetter, Form16, Visa, Other
    [MaxLength(500)]
    public string? Description { get; set; }
    public string? TemplateContent { get; set; } // HTML or JSON template with placeholders like {{FullName}}, {{Designation}}, etc.
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class EmployeeDocument
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int? TemplateId { get; set; }
    [MaxLength(50)]
    public string DocumentType { get; set; } = "";
    [MaxLength(200)]
    public string DocumentName { get; set; } = "";
    [MaxLength(500)]
    public string? FilePath { get; set; }
    public string? AutoFilledData { get; set; } // JSON snapshot of data used
    [MaxLength(50)]
    public string Status { get; set; } = "Generated"; // Generated, Sent, Acknowledged, Verified
    public DateTime GeneratedOn { get; set; } = DateTime.UtcNow;
    public DateTime? SentOn { get; set; }
    public DateTime? ExpiryDate { get; set; }
    [MaxLength(50)]
    public string VerificationStatus { get; set; } = "NotVerified"; // NotVerified, Pending, Verified, Rejected
    public DateTime? VerifiedOn { get; set; }
    public int? VerifiedById { get; set; }
    [MaxLength(1000)]
    public string? OneDrivePath { get; set; }
    [MaxLength(500)]
    public string? MimeType { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(TemplateId))]
    public DocumentTemplate? Template { get; set; }
    [ForeignKey(nameof(VerifiedById))]
    public Employee? VerifiedBy { get; set; }
}
