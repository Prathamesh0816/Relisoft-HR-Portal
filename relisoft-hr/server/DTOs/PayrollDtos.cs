namespace RelisoftHR.DTOs;

public record PayComponentDto(int Id, string Name, string Type, string? Description, bool IsActive, bool IsAuto, decimal Rate);
public record CreatePayComponentRequest(string Name, string Type, string? Description, bool IsAuto = false, decimal Rate = 0);
public record UpdatePayComponentRequest(int Id, string Name, string Type, string? Description, bool IsActive, bool IsAuto = false, decimal Rate = 0);

public record SalaryStructureLineDto(int PayComponentId, string ComponentName, string Type, decimal MonthlyAmount);
public record EmployeeSalaryStructureDto(int EmployeeId, string EmployeeName, DateTime EffectiveFrom, List<SalaryStructureLineDto> Lines);
public record SalaryLineInput(int PayComponentId, decimal MonthlyAmount);
public record SetSalaryStructureRequest(int EmployeeId, DateTime EffectiveFrom, List<SalaryLineInput> Lines);

public record PayRunDto(
    int Id, int PeriodMonth, int PeriodYear, string Status, DateTime? ProcessedOn,
    DateTime? ReadyOn, DateTime? VerifiedOn, DateTime? PaidOn, bool AutoDisbursed,
    int PayslipCount, decimal TotalNetPay);
public record CreatePayRunRequest(int PeriodMonth, int PeriodYear);

public record PayslipLineDto(string ComponentName, string Type, decimal Amount);
public record PayslipDto(
    int Id, int PayRunId, int PeriodMonth, int PeriodYear,
    int EmployeeId, string EmployeeName,
    decimal GrossEarnings, decimal TotalDeductions, decimal NetPay,
    List<PayslipLineDto> Lines);

public record AddPayslipLineRequest(int PayComponentId, decimal Amount);

public record PayRunDetailDto(
    int Id, int PeriodMonth, int PeriodYear, string Status,
    DateTime? ProcessedOn, DateTime? ReadyOn, DateTime? VerifiedOn, DateTime? PaidOn, bool AutoDisbursed,
    int PayslipCount, decimal TotalNetPay,
    List<PayslipDto> Payslips);

public record UnpaidEmployeeDto(
    int EmployeeId, string EmployeeName, string EmployeeCode, string Department, string Reason);

public record StatutoryLineDto(
    int EmployeeId, string EmployeeName, string EmployeeCode,
    decimal Basic, decimal Gross,
    decimal EmployeePf, decimal EmployerPf, decimal EmployerEps, decimal EmployerEdli,
    decimal EmployeeEsi, decimal EmployerEsi, decimal ProfessionalTax, decimal Tds, decimal NetPay);

public record StatutoryTotalsDto(
    decimal Basic, decimal Gross,
    decimal EmployeePf, decimal EmployerPf, decimal EmployerEps, decimal EmployerEdli,
    decimal EmployeeEsi, decimal EmployerEsi, decimal ProfessionalTax, decimal Tds);

public record StatutoryReportDto(
    int RunId, int PeriodMonth, int PeriodYear,
    List<StatutoryLineDto> Employees, StatutoryTotalsDto Totals);
