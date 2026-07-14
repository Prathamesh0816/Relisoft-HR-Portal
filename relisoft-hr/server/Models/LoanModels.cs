using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public class LoanType
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = "";
    [MaxLength(500)] public string Description { get; set; } = "";
    public decimal MinAmount { get; set; }
    public decimal MaxAmount { get; set; }
    public decimal InterestRate { get; set; }
    public int MaxInstallments { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}

public class EmployeeLoan
{
    [Key] public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int LoanTypeId { get; set; }
    public decimal Amount { get; set; }
    public decimal InterestRate { get; set; }
    public int Installments { get; set; }
    public decimal EmiAmount { get; set; }
    public decimal OutstandingBalance { get; set; }
    [MaxLength(1000)] public string Purpose { get; set; } = "";
    [MaxLength(50)] public string Status { get; set; } = "Pending";
    public int? ApprovedById { get; set; }
    public DateTime? ApprovedOn { get; set; }
    public DateTime? DisbursedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(EmployeeId))] public Employee? Employee { get; set; }
    [ForeignKey(nameof(LoanTypeId))] public LoanType? LoanType { get; set; }
    [ForeignKey(nameof(ApprovedById))] public Employee? ApprovedBy { get; set; }
}

public class LoanRepayment
{
    [Key] public int Id { get; set; }
    public int LoanId { get; set; }
    public int InstallmentNumber { get; set; }
    public decimal Amount { get; set; }
    public decimal PrincipalPortion { get; set; }
    public decimal InterestPortion { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaidOn { get; set; }
    [MaxLength(50)] public string Status { get; set; } = "Pending";

    [ForeignKey(nameof(LoanId))] public EmployeeLoan? Loan { get; set; }
}
