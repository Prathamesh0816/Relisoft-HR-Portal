using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RelisoftHR.Models;

public enum PayComponentType
{
    Earning = 0,
    Deduction = 1
}

public enum PayRunStatus
{
    Draft = 0,
    Processed = 1
}

public class PayComponent
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Name { get; set; } = "";
    public PayComponentType Type { get; set; }
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsAuto { get; set; }
    public decimal Rate { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }
}

public class EmployeeSalaryStructure
{
    [Key]
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedOn { get; set; }

    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    public ICollection<EmployeeSalaryStructureLine> Lines { get; set; } = new List<EmployeeSalaryStructureLine>();
}

public class EmployeeSalaryStructureLine
{
    [Key]
    public int Id { get; set; }
    public int SalaryStructureId { get; set; }
    public int PayComponentId { get; set; }
    public decimal MonthlyAmount { get; set; }

    [ForeignKey(nameof(SalaryStructureId))]
    public EmployeeSalaryStructure? SalaryStructure { get; set; }
    [ForeignKey(nameof(PayComponentId))]
    public PayComponent? PayComponent { get; set; }
}

public class PayRun
{
    [Key]
    public int Id { get; set; }
    public int PeriodMonth { get; set; }
    public int PeriodYear { get; set; }
    public PayRunStatus Status { get; set; } = PayRunStatus.Draft;
    public DateTime? ProcessedOn { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

    public ICollection<Payslip> Payslips { get; set; } = new List<Payslip>();
}

public class Payslip
{
    [Key]
    public int Id { get; set; }
    public int PayRunId { get; set; }
    public int EmployeeId { get; set; }
    public decimal GrossEarnings { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal NetPay { get; set; }

    [ForeignKey(nameof(PayRunId))]
    public PayRun? PayRun { get; set; }
    [ForeignKey(nameof(EmployeeId))]
    public Employee? Employee { get; set; }
    public ICollection<PayslipLine> Lines { get; set; } = new List<PayslipLine>();
}

public class PayslipLine
{
    [Key]
    public int Id { get; set; }
    public int PayslipId { get; set; }
    public int PayComponentId { get; set; }
    [Required, MaxLength(100)]
    public string ComponentName { get; set; } = "";
    public PayComponentType Type { get; set; }
    public decimal Amount { get; set; }

    [ForeignKey(nameof(PayslipId))]
    public Payslip? Payslip { get; set; }
}
