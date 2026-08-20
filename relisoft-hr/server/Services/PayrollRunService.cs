using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

/// <summary>
/// Shared payroll pipeline used by both the HTTP controller and the automatic
/// disbursement background job, so the two can never drift apart.
/// Flow: Draft → Ready (submitted) → Verified (sign-off) → Paid (salary shot).
/// </summary>
public class PayrollRunService
{
    private readonly AppDbContext _db;
    private readonly IInternCompensationService _internComp;
    private readonly IAuditLogService _audit;
    private readonly IEmailService _emailService;
    private readonly ILogger<PayrollRunService> _logger;

    public PayrollRunService(
        AppDbContext db,
        IInternCompensationService internComp,
        IAuditLogService audit,
        IEmailService emailService,
        ILogger<PayrollRunService> logger)
    {
        _db = db;
        _internComp = internComp;
        _audit = audit;
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>Active employees who should appear on a payslip for the given period.</summary>
    public async Task<List<int>> GetEligibleEmployeeIdsAsync(DateTime asOf)
    {
        var activeEmployees = await _db.Employees.AsNoTracking()
            .Where(e => e.Status == "Active")
            .Select(e => new { e.Id, e.EmploymentType, e.IsUnpaidIntern })
            .ToListAsync();

        var eligible = new List<int>();
        foreach (var emp in activeEmployees)
        {
            if (emp.EmploymentType == "Intern" || emp.EmploymentType == "Probation")
            {
                if (await _internComp.IsEligibleForPayAsync(emp.Id, asOf))
                    eligible.Add(emp.Id);
            }
            else if (!emp.IsUnpaidIntern)
            {
                eligible.Add(emp.Id);
            }
        }
        return eligible;
    }

    /// <summary>
    /// (Re)builds payslips for a run from salary structures (modern + legacy),
    /// applying auto-computed deductions (e.g. PF as a % of Basic). Idempotent.
    /// </summary>
    public async Task<int> GeneratePayslipsAsync(PayRun run)
    {
        var eligibleEmployeeIds = await GetEligibleEmployeeIdsAsync(DateTime.UtcNow);

        var structures = await _db.EmployeeSalaryStructures.AsNoTracking()
            .Include(s => s.Lines)
            .Where(s => eligibleEmployeeIds.Contains(s.EmployeeId))
            .ToListAsync();

        var components = await _db.PayComponents.AsNoTracking().ToListAsync();
        var compById = components.ToDictionary(c => c.Id);
        var compByName = components.ToDictionary(c => c.Name, StringComparer.OrdinalIgnoreCase);

        var employeeLines = new Dictionary<int, List<PayslipLine>>();
        foreach (var s in structures)
        {
            var lines = new List<PayslipLine>();
            foreach (var l in s.Lines)
            {
                if (!compById.TryGetValue(l.PayComponentId, out var comp)) continue;
                lines.Add(new PayslipLine { PayComponentId = comp.Id, ComponentName = comp.Name, Type = comp.Type, Amount = l.MonthlyAmount });
            }
            if (lines.Count > 0) employeeLines[s.EmployeeId] = lines;
        }

        // Fallback: employees without a payroll structure use the legacy SalaryStructure
        // (the one used by offer letters / salary approval / encashment) so no one is silently missed.
        var legacyIds = eligibleEmployeeIds.Where(id => !employeeLines.ContainsKey(id)).ToList();
        if (legacyIds.Count > 0)
        {
            var legacy = await _db.SalaryStructures.AsNoTracking()
                .Where(s => legacyIds.Contains(s.EmployeeId))
                .ToListAsync();

            foreach (var s in legacy)
            {
                var lines = new List<PayslipLine>();
                AddLegacyLine(lines, compByName, "Basic", PayComponentType.Earning, s.FixedPay / 12m);
                AddLegacyLine(lines, compByName, "Variable Pay", PayComponentType.Earning, s.VariablePay / 12m);
                AddLegacyLine(lines, compByName, "PF", PayComponentType.Deduction, s.PF / 12m);
                AddLegacyLine(lines, compByName, "Gratuity", PayComponentType.Deduction, s.Gratuity / 12m);
                AddLegacyLine(lines, compByName, "Insurance", PayComponentType.Deduction, s.Insurance / 12m);
                AddLegacyLine(lines, compByName, "Other Deductions", PayComponentType.Deduction, s.OtherDeductions / 12m);
                if (lines.Count > 0) employeeLines[s.EmployeeId] = lines;
            }
        }

        _db.Payslips.RemoveRange(run.Payslips);
        await _db.SaveChangesAsync();

        foreach (var (employeeId, lines) in employeeLines)
        {
            var payslip = new Payslip
            {
                PayRunId = run.Id,
                EmployeeId = employeeId,
                Lines = lines
            };

            // Auto-computed deductions (e.g. PF at a % of Basic Salary) are calculated
            // on generation so statutory amounts stay consistent with the basic pay.
            var basic = lines
                .FirstOrDefault(l => l.Type == PayComponentType.Earning &&
                    l.ComponentName.Contains("Basic", StringComparison.OrdinalIgnoreCase));
            foreach (var line in lines.Where(l => l.Type == PayComponentType.Deduction).ToList())
            {
                if (line.PayComponentId == 0) continue;
                if (!compById.TryGetValue(line.PayComponentId, out var component) || !component.IsAuto || component.Rate <= 0)
                    continue;
                var basis = basic?.Amount ?? lines.Where(l => l.Type == PayComponentType.Earning).Sum(l => l.Amount);
                line.Amount = Math.Round(basis * component.Rate / 100m, 2);
            }

            payslip.GrossEarnings = lines.Where(l => l.Type == PayComponentType.Earning).Sum(l => l.Amount);
            payslip.TotalDeductions = lines.Where(l => l.Type == PayComponentType.Deduction).Sum(l => l.Amount);
            payslip.NetPay = payslip.GrossEarnings - payslip.TotalDeductions;
            _db.Payslips.Add(payslip);
        }

        await _db.SaveChangesAsync();
        return employeeLines.Count;
    }

    private static void AddLegacyLine(List<PayslipLine> lines, Dictionary<string, PayComponent> compByName, string name, PayComponentType type, decimal monthly)
    {
        if (monthly <= 0) return;
        var comp = compByName.TryGetValue(name, out var c) ? c : null;
        lines.Add(new PayslipLine
        {
            PayComponentId = comp?.Id ?? 0,
            ComponentName = comp?.Name ?? name,
            Type = comp?.Type ?? type,
            Amount = Math.Round(monthly, 2)
        });
    }

    /// <summary>Fetches an existing run for a period or creates it (used by the auto-disbursement job).</summary>
    public async Task<PayRun> GetOrCreateRunAsync(int month, int year, string trigger, int? actorId, string actorName)
    {
        var run = await _db.PayRuns.FirstOrDefaultAsync(r => r.PeriodMonth == month && r.PeriodYear == year);
        if (run != null) return run;

        run = new PayRun { PeriodMonth = month, PeriodYear = year };
        _db.PayRuns.Add(run);
        await _db.SaveChangesAsync();
        await _audit.LogAsync(actorId, actorName, "PayRunAutoCreated", "PayRun", run.Id,
            $"{trigger}: auto-created run for {month}/{year}.");
        return run;
    }

    /// <summary>
    /// Runs the full pipeline for a period: create if missing → generate → verify → pay.
    /// Safe to call repeatedly; it advances the run only as far as needed.
    /// </summary>
    public async Task<string> DisbursePeriodAsync(int month, int year, string trigger, int? actorId, string actorName)
    {
        var run = await GetOrCreateRunAsync(month, year, trigger, actorId, actorName);

        if (run.Status == PayRunStatus.Draft)
        {
            await GeneratePayslipsAsync(run);
            run.Status = PayRunStatus.Ready;
            run.ReadyOn = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            _logger.LogInformation("Payroll {Trigger}: {Month}/{Year} generated {Count} payslips.",
                trigger, month, year, run.Payslips.Count);
        }

        if (run.Status == PayRunStatus.Ready)
        {
            run.Status = PayRunStatus.Verified;
            run.VerifiedOn = DateTime.UtcNow;
            run.VerifiedBy = actorId;
            run.ProcessedOn ??= DateTime.UtcNow;
            await _db.SaveChangesAsync();
            await _audit.LogAsync(actorId, actorName, "PayRunAutoVerified", "PayRun", run.Id,
                $"{trigger}: run for {month}/{year} verified automatically.");
        }

        if (run.Status == PayRunStatus.Verified)
        {
            run.Status = PayRunStatus.Paid;
            run.PaidOn = DateTime.UtcNow;
            run.PaidBy = actorId;
            run.AutoDisbursed = true;
            await _db.SaveChangesAsync();
            await _audit.LogAsync(actorId, actorName, "PayRunAutoDisbursed", "PayRun", run.Id,
                $"{trigger}: salary disbursed for {month}/{year}.");
            await EmailPayslipsAsync(run);
            _logger.LogInformation("Payroll {Trigger}: salary disbursed for {Month}/{Year}.", trigger, month, year);
        }

        return run.Status.ToString();
    }

    public async Task EmailPayslipsAsync(PayRun run)
    {
        var payslips = await _db.Payslips
            .Include(p => p.Employee)
            .Where(p => p.PayRunId == run.Id)
            .ToListAsync();

        var monthName = new DateTime(2000, run.PeriodMonth, 1).ToString("MMMM");
        foreach (var payslip in payslips)
        {
            var employee = payslip.Employee;
            if (employee == null || string.IsNullOrEmpty(employee.Email)) continue;
            try
            {
                await _emailService.SendEmailAsync(employee.Email,
                    $"Your payslip for {monthName} {run.PeriodYear}",
                    EmailTemplates.Payslip(employee.FullName, monthName, run.PeriodYear, payslip));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payslip email to {Email}", employee.Email);
            }
        }
    }

    /// <summary>
    /// Last working day of a month: the last weekday (Mon–Fri) that is not a company holiday.
    /// Pure and unit-testable.
    /// </summary>
    public static DateOnly LastWorkingDay(int year, int month, IEnumerable<DateOnly>? holidays = null)
    {
        var holidaySet = holidays?.ToHashSet() ?? new HashSet<DateOnly>();
        for (var day = DateTime.DaysInMonth(year, month); day >= 1; day--)
        {
            var d = new DateOnly(year, month, day);
            if (d.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday) continue;
            if (holidaySet.Contains(d)) continue;
            return d;
        }
        return new DateOnly(year, month, DateTime.DaysInMonth(year, month));
    }
}