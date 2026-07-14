using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class SalaryDiscussion
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public decimal ProposedSalary { get; set; }
    public decimal? ApprovedSalary { get; set; }
    [MaxLength(50)]
    public string Status { get; set; } = "Proposed"; // Proposed, Approved, Rejected
    public int? ProposedById { get; set; }
    public int? ApprovedById { get; set; }
    public DateTime DiscussionDate { get; set; } = DateTime.UtcNow;
    [MaxLength(1000)]
    public string? Notes { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    [ForeignKey(nameof(ProposedById))]
    public Employee? ProposedBy { get; set; }
    [ForeignKey(nameof(ApprovedById))]
    public Employee? ApprovedBy { get; set; }
}
