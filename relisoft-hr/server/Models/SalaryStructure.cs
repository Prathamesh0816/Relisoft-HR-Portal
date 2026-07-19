using System.ComponentModel.DataAnnotations;

namespace RelisoftHR.Models;

public class SalaryStructure
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public decimal FixedPay { get; set; }
    public decimal VariablePay { get; set; }
    public decimal PF { get; set; }
    public decimal Gratuity { get; set; }
    public decimal Insurance { get; set; }
    public decimal OtherDeductions { get; set; }
    public decimal TotalCtc => FixedPay + VariablePay;

    public Employee? Employee { get; set; }
}
