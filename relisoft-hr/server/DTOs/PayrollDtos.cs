namespace RelisoftHR.DTOs;

public record PayComponentDto(int Id, string Name, string Type, string? Description, bool IsActive, bool IsAuto, decimal Rate);
public record CreatePayComponentRequest(string Name, string Type, string? Description, bool IsAuto = false, decimal Rate = 0);
public record UpdatePayComponentRequest(int Id, string Name, string Type, string? Description, bool IsActive, bool IsAuto = false, decimal Rate = 0);

public record SalaryStructureLineDto(int PayComponentId, string ComponentName, string Type, decimal MonthlyAmount);
public record EmployeeSalaryStructureDto(int EmployeeId, string EmployeeName, DateTime EffectiveFrom, List<SalaryStructureLineDto> Lines);
public record SalaryLineInput(int PayComponentId, decimal MonthlyAmount);
public record SetSalaryStructureRequest(int EmployeeId, DateTime EffectiveFrom, List<SalaryLineInput> Lines);

public record PayRunDto(int Id, int PeriodMonth, int PeriodYear, string Status, DateTime? ProcessedOn, int PayslipCount, decimal TotalNetPay);
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
    DateTime? ProcessedOn, int PayslipCount, decimal TotalNetPay,
    List<PayslipDto> Payslips);
