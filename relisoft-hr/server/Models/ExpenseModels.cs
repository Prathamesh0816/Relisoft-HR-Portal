using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class ExpenseCategory
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [MaxLength(500)] public string Description { get; set; } = "";
    public bool RequiresReceipt { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class ExpenseClaim
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int CategoryId { get; set; }
    [MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(1000)] public string Description { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; }
    [MaxLength(500)] public string ReceiptUrl { get; set; } = "";
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    public int? ApprovedById { get; set; }
    public DateTime? ApprovedOn { get; set; }
    [MaxLength(500)] public string RejectionReason { get; set; } = "";
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ReimbursedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
    [ForeignKey(nameof(CategoryId))] public ExpenseCategory? Category { get; set; }
    [ForeignKey(nameof(ApprovedById))] public Employee? ApprovedBy { get; set; }
}
