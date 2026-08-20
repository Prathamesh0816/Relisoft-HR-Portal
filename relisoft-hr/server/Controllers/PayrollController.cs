using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.IO.Compression;
using System.Security.Claims;
using System.Text;

namespace RelisoftHR.Controllers;

[ApiController]
[Authorize]
[Route("api/payroll")]
public class PayrollController : ControllerBase
{
    private static readonly string[] PayrollAdminRoles = { "HRL2", "HR", "Admin", "SuperAdmin" };

    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly IInternCompensationService _internComp;
    private readonly IAuditLogService _audit;
    private readonly ILogger<PayrollController> _logger;

    public PayrollController(AppDbContext db, IEmailService emailService, IInternCompensationService internComp, IAuditLogService audit, ILogger<PayrollController> logger)
    {
        _db = db;
        _emailService = emailService;
        _internComp = internComp;
        _audit = audit;
        _logger = logger;
    }

    // ────── Pay components ──────

    [HttpGet("components")]
    public async Task<ActionResult<List<PayComponentDto>>> GetComponents([FromQuery] bool activeOnly = false)
    {
        var query = _db.PayComponents.AsNoTracking().AsQueryable();
        if (activeOnly) query = query.Where(c => c.IsActive);
        var list = await query.OrderBy(c => c.Type).ThenBy(c => c.Name).ToListAsync();
        return Ok(list.Select(c => MapComponent(c)).ToList());
    }

    [HttpPost("components")]
    public async Task<ActionResult> CreateComponent(CreatePayComponentRequest req)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { message = "Component name is required." });
        if (!Enum.TryParse<PayComponentType>(req.Type, true, out var type))
            return BadRequest(new { message = "Type must be Earning or Deduction." });

        _db.PayComponents.Add(new PayComponent
        {
            Name = req.Name.Trim(),
            Type = type,
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            IsAuto = req.IsAuto && type == PayComponentType.Deduction,
            Rate = req.IsAuto ? Math.Abs(req.Rate) : 0
        });
        await _db.SaveChangesAsync();
        return Ok(new { id = _db.PayComponents.Local.Last().Id, message = "Pay component created." });
    }

    [HttpPut("components/{id}")]
    public async Task<ActionResult> UpdateComponent(int id, UpdatePayComponentRequest req)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        if (id != req.Id) return BadRequest(new { message = "Route id must match body id." });
        var component = await _db.PayComponents.FindAsync(id);
        if (component == null) return NotFound();
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { message = "Component name is required." });
        if (!Enum.TryParse<PayComponentType>(req.Type, true, out var type))
            return BadRequest(new { message = "Type must be Earning or Deduction." });

        component.Name = req.Name.Trim();
        component.Type = type;
        component.Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim();
        component.IsActive = req.IsActive;
        component.IsAuto = req.IsAuto && type == PayComponentType.Deduction;
        component.Rate = component.IsAuto ? Math.Abs(req.Rate) : 0;
        component.UpdatedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ────── Salary structures ──────

    [HttpGet("salary-structures/{employeeId}")]
    public async Task<ActionResult<EmployeeSalaryStructureDto?>> GetSalaryStructure(int employeeId)
    {
        var structure = await _db.EmployeeSalaryStructures
            .Include(s => s.Employee)
            .Include(s => s.Lines)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.EmployeeId == employeeId);
        if (structure == null) return Ok(null);

        return Ok(await MapStructureAsync(structure));
    }

    [HttpPut("salary-structures/{employeeId}")]
    public async Task<ActionResult> SetSalaryStructure(int employeeId, SetSalaryStructureRequest req)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        if (employeeId != req.EmployeeId) return BadRequest(new { message = "Route id must match body employeeId." });
        var employee = await _db.Employees.FindAsync(req.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });
        if (req.Lines == null || req.Lines.Any(l => l.MonthlyAmount < 0))
            return BadRequest(new { message = "Monthly amounts cannot be negative." });

        var existing = await _db.EmployeeSalaryStructures
            .Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.EmployeeId == req.EmployeeId);

        if (existing == null)
        {
            existing = new EmployeeSalaryStructure
            {
                EmployeeId = req.EmployeeId,
                EffectiveFrom = req.EffectiveFrom,
                Lines = req.Lines
                    .Select(l => new EmployeeSalaryStructureLine { PayComponentId = l.PayComponentId, MonthlyAmount = l.MonthlyAmount })
                    .ToList()
            };
            _db.EmployeeSalaryStructures.Add(existing);
        }
        else
        {
            _db.EmployeeSalaryStructureLines.RemoveRange(existing.Lines);
            existing.EffectiveFrom = req.EffectiveFrom;
            existing.UpdatedOn = DateTime.UtcNow;
            existing.Lines = req.Lines
                .Select(l => new EmployeeSalaryStructureLine { PayComponentId = l.PayComponentId, MonthlyAmount = l.MonthlyAmount })
                .ToList();
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync(GetAuthenticatedEmployeeId(), await GetActorNameAsync(), "SalaryStructureUpdated", "EmployeeSalaryStructure", existing.Id,
            $"Updated salary structure for {employee.FullName} ({employee.EmployeeCode}).",
            after: new { req.EffectiveFrom, Lines = req.Lines.Select(l => new { l.PayComponentId, l.MonthlyAmount }) });
        return NoContent();
    }

    private async Task<string> GetActorNameAsync()
    {
        var id = GetAuthenticatedEmployeeId();
        return id == null ? "" : await _db.Employees.AsNoTracking().Where(e => e.Id == id).Select(e => e.FullName).FirstOrDefaultAsync() ?? "";
    }

    [HttpGet("runs")]
    public async Task<ActionResult<List<PayRunDto>>> GetPayRuns()
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        var runs = await _db.PayRuns
            .Include(r => r.Payslips)
            .AsNoTracking()
            .OrderByDescending(r => r.PeriodYear)
            .ThenByDescending(r => r.PeriodMonth)
            .ToListAsync();
        return Ok(runs.Select(r => MapRun(r)).ToList());
    }

    [HttpGet("runs/{id}")]
    public async Task<ActionResult<PayRunDetailDto>> GetPayRun(int id)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        var run = await _db.PayRuns
            .Include(r => r.Payslips)
            .ThenInclude(p => p.Lines)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();

        var employeeIds = run.Payslips.Select(p => p.EmployeeId).Distinct().ToList();
        var employees = await _db.Employees.AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id);

        var detail = new PayRunDetailDto(
            run.Id, run.PeriodMonth, run.PeriodYear, run.Status.ToString(),
            run.ProcessedOn, run.Payslips.Count, run.Payslips.Sum(p => p.NetPay),
            run.Payslips.Select(p => MapPayslip(p, run, employees.GetValueOrDefault(p.EmployeeId)?.FullName ?? "Unknown")).ToList());

        return Ok(detail);
    }

    [HttpPost("runs")]
    public async Task<ActionResult> CreatePayRun(CreatePayRunRequest req)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        if (req.PeriodMonth < 1 || req.PeriodMonth > 12) return BadRequest(new { message = "Period month must be between 1 and 12." });

        var exists = await _db.PayRuns.AnyAsync(r => r.PeriodMonth == req.PeriodMonth && r.PeriodYear == req.PeriodYear);
        if (exists) return BadRequest(new { message = $"A pay run for {req.PeriodMonth}/{req.PeriodYear} already exists." });

        var run = new PayRun { PeriodMonth = req.PeriodMonth, PeriodYear = req.PeriodYear };
        _db.PayRuns.Add(run);
        await _db.SaveChangesAsync();
        return Ok(new { id = run.Id, message = "Pay run created." });
    }

    [HttpPost("runs/{id}/generate")]
    public async Task<ActionResult> GeneratePayslips(int id)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        var run = await _db.PayRuns
            .Include(r => r.Payslips)
            .ThenInclude(p => p.Lines)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();
        if (run.Status != PayRunStatus.Draft) return BadRequest(new { message = "Only a draft pay run's payslips can be regenerated." });

        var activeEmployees = await _db.Employees.AsNoTracking()
            .Where(e => e.Status == "Active")
            .Select(e => new { e.Id, e.EmploymentType, e.IsUnpaidIntern })
            .ToListAsync();

        var eligibleEmployeeIds = new List<int>();
        foreach (var emp in activeEmployees)
        {
            if (emp.EmploymentType == "Intern" || emp.EmploymentType == "Probation")
            {
                if (await _internComp.IsEligibleForPayAsync(emp.Id, DateTime.UtcNow))
                    eligibleEmployeeIds.Add(emp.Id);
            }
            else if (!emp.IsUnpaidIntern)
            {
                eligibleEmployeeIds.Add(emp.Id);
            }
        }

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
        return NoContent();
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

    [HttpPost("runs/{id}/process")]
    public async Task<ActionResult> ProcessPayRun(int id)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        var run = await _db.PayRuns
            .Include(r => r.Payslips)
            .ThenInclude(p => p.Lines)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();
        if (run.Status != PayRunStatus.Draft) return BadRequest(new { message = "Only a draft pay run can be processed." });
        if (run.Payslips.Count == 0) return BadRequest(new { message = "Generate payslips before processing this pay run." });

        run.Status = PayRunStatus.Processed;
        run.ProcessedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _ = SendPayslipEmailsAsync(run);
        return NoContent();
    }

    // ────── Payslips ──────

    [HttpPost("runs/{id}/payslips/{payslipId}/lines")]
    public async Task<ActionResult> AddPayslipLine(int id, int payslipId, [FromBody] AddPayslipLineRequest req)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();
        var run = await _db.PayRuns.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();
        if (run.Status != PayRunStatus.Draft) return BadRequest(new { message = "One-off additions can only be made on a draft pay run." });

        var payslip = await _db.Payslips
            .Include(p => p.Lines)
            .FirstOrDefaultAsync(p => p.Id == payslipId && p.PayRunId == id);
        if (payslip == null) return NotFound(new { message = "Payslip not found in this pay run." });

        var component = await _db.PayComponents.AsNoTracking().FirstOrDefaultAsync(c => c.Id == req.PayComponentId);
        if (component == null) return NotFound(new { message = "Pay component not found." });
        if (req.Amount == 0) return BadRequest(new { message = "Amount cannot be zero." });
        if (req.Amount < 0) return BadRequest(new { message = "Amount cannot be negative." });

        payslip.Lines.Add(new PayslipLine
        {
            PayslipId = payslip.Id,
            PayComponentId = component.Id,
            ComponentName = component.Name,
            Type = component.Type,
            Amount = req.Amount
        });
        payslip.GrossEarnings = payslip.Lines.Where(l => l.Type == PayComponentType.Earning).Sum(l => l.Amount);
        payslip.TotalDeductions = payslip.Lines.Where(l => l.Type == PayComponentType.Deduction).Sum(l => l.Amount);
        payslip.NetPay = payslip.GrossEarnings - payslip.TotalDeductions;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Added {component.Name} of ₹{req.Amount:N2} to the payslip." });
    }

    [HttpGet("payslips/employee/{employeeId}")]
    public async Task<ActionResult<List<PayslipDto>>> GetPayslipsForEmployee(int employeeId)
    {
        var currentEmployeeId = GetAuthenticatedEmployeeId();
        if (currentEmployeeId == null) return Unauthorized();
        var isAdmin = await IsPayrollAdminAsync();
        if (!isAdmin && currentEmployeeId.Value != employeeId) return Forbid();

        var runs = await _db.PayRuns
            .Include(r => r.Payslips)
            .ThenInclude(p => p.Lines)
            .AsNoTracking()
            .Where(r => r.Status == PayRunStatus.Processed && r.Payslips.Any(p => p.EmployeeId == employeeId))
            .OrderByDescending(r => r.PeriodYear)
            .ThenByDescending(r => r.PeriodMonth)
            .ToListAsync();

        var employee = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employeeId);

        var payslips = new List<PayslipDto>();
        foreach (var run in runs)
        {
            var payslip = run.Payslips.FirstOrDefault(p => p.EmployeeId == employeeId);
            if (payslip != null)
                payslips.Add(MapPayslip(payslip, run, employee?.FullName ?? "Unknown"));
        }
        return Ok(payslips);
    }

    [HttpGet("form16/{employeeId}")]
    public async Task<ActionResult> DownloadForm16(int employeeId, [FromQuery] int? year)
    {
        var currentEmployeeId = GetAuthenticatedEmployeeId();
        if (currentEmployeeId == null) return Unauthorized();
        var isAdmin = await IsPayrollAdminAsync();
        if (!isAdmin && currentEmployeeId.Value != employeeId) return Forbid();

        var targetYear = year ?? DateTime.UtcNow.Year;
        var employee = await _db.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employeeId);
        if (employee == null) return NotFound();

        var payslips = await _db.Payslips
            .Include(p => p.PayRun)
            .Include(p => p.Lines)
            .AsNoTracking()
            .Where(p => p.EmployeeId == employeeId && p.PayRun!.PeriodYear == targetYear && p.PayRun!.Status == PayRunStatus.Processed)
            .OrderBy(p => p.PayRun!.PeriodMonth)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Form 16");

        ws.Cell(1, 1).Value = "Relisoft Technologies";
        ws.Cell(1, 1).Style.Font.SetBold(true).Font.FontSize = 14;
        ws.Cell(2, 1).Value = $"Annual Tax Statement (Form 16 Summary) — FY {targetYear - 1}-{targetYear}";
        ws.Cell(2, 1).Style.Font.SetBold(true);
        ws.Cell(4, 1).Value = "Employee Name"; ws.Cell(4, 2).Value = employee.FullName;
        ws.Cell(5, 1).Value = "Designation"; ws.Cell(5, 2).Value = employee.Designation ?? "";
        ws.Cell(6, 1).Value = "PAN"; ws.Cell(6, 2).Value = employee.PanNumber ?? "—";
        ws.Cell(7, 1).Value = "UAN"; ws.Cell(7, 2).Value = employee.UanNumber ?? "—";
        ws.Cell(8, 1).Value = "Department"; ws.Cell(8, 2).Value = employee.Department ?? "";

        var headerRow = 10;
        ws.Cell(headerRow, 1).Value = "Month";
        ws.Cell(headerRow, 2).Value = "Gross Earnings";
        ws.Cell(headerRow, 3).Value = "PF";
        ws.Cell(headerRow, 4).Value = "TDS";
        ws.Cell(headerRow, 5).Value = "ESI";
        ws.Cell(headerRow, 6).Value = "Professional Tax";
        ws.Cell(headerRow, 7).Value = "Other Deductions";
        ws.Cell(headerRow, 8).Value = "Net Pay";
        ws.Range(headerRow, 1, headerRow, 8).Style.Font.SetBold(true).Fill.SetBackgroundColor(XLColor.FromHtml("#F5A623"));

        decimal totalGross = 0, totalPf = 0, totalTds = 0, totalEsi = 0, totalPt = 0, totalOther = 0, totalNet = 0;
        var row = headerRow + 1;
        foreach (var p in payslips)
        {
            decimal pf = 0, tds = 0, esi = 0, pt = 0, other = 0;
            foreach (var l in p.Lines)
            {
                var name = l.ComponentName;
                if (l.Type == PayComponentType.Deduction)
                {
                    if (name.Contains("PF", StringComparison.OrdinalIgnoreCase) || name.Contains("Provident", StringComparison.OrdinalIgnoreCase)) pf += l.Amount;
                    else if (name.Equals("TDS", StringComparison.OrdinalIgnoreCase)) tds += l.Amount;
                    else if (name.Contains("ESI", StringComparison.OrdinalIgnoreCase) || name.Contains("Insurance", StringComparison.OrdinalIgnoreCase)) esi += l.Amount;
                    else if (name.Contains("Professional Tax", StringComparison.OrdinalIgnoreCase)) pt += l.Amount;
                    else other += l.Amount;
                }
            }
            var monthName = new DateTime(2000, p.PayRun!.PeriodMonth, 1).ToString("MMMM");
            ws.Cell(row, 1).Value = $"{monthName} {p.PayRun.PeriodYear}";
            ws.Cell(row, 2).Value = p.GrossEarnings;
            ws.Cell(row, 3).Value = pf;
            ws.Cell(row, 4).Value = tds;
            ws.Cell(row, 5).Value = esi;
            ws.Cell(row, 6).Value = pt;
            ws.Cell(row, 7).Value = other;
            ws.Cell(row, 8).Value = p.NetPay;
            totalGross += p.GrossEarnings; totalPf += pf; totalTds += tds; totalEsi += esi;
            totalPt += pt; totalOther += other; totalNet += p.NetPay;
            row++;
        }

        ws.Cell(row, 1).Value = "TOTAL";
        ws.Cell(row, 2).Value = totalGross;
        ws.Cell(row, 3).Value = totalPf;
        ws.Cell(row, 4).Value = totalTds;
        ws.Cell(row, 5).Value = totalEsi;
        ws.Cell(row, 6).Value = totalPt;
        ws.Cell(row, 7).Value = totalOther;
        ws.Cell(row, 8).Value = totalNet;
        ws.Range(row, 1, row, 8).Style.Font.SetBold(true).Fill.SetBackgroundColor(XLColor.FromHtml("#E2E8F0"));

        ws.Columns(1, 8).AdjustToContents();
        ws.Range(headerRow + 1, 2, row, 8).Style.NumberFormat.Format = "₹#,##0.00";

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;
        var fileName = $"Form16_{employee.FullName.Replace(" ", "_")}_{targetYear}.xlsx";
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    // ────── Bulk payslip export & email ──────

    [HttpGet("runs/{id}/export")]
    public async Task<ActionResult> ExportPayslips(int id)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();

        var run = await _db.PayRuns
            .Include(r => r.Payslips).ThenInclude(p => p.Employee)
            .Include(r => r.Payslips).ThenInclude(p => p.Lines)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();

        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var payslip in run.Payslips)
            {
                var name = payslip.Employee?.FullName?.Replace(" ", "_") ?? payslip.EmployeeId.ToString();
                var entry = archive.CreateEntry($"{name}_Payslip_{run.PeriodYear}_{run.PeriodMonth:D2}.html");
                using var entryStream = entry.Open();
                var html = BuildPayslipHtml(payslip, run);
                var bytes = Encoding.UTF8.GetBytes(html);
                entryStream.Write(bytes, 0, bytes.Length);
            }
        }
        ms.Position = 0;
        var zipName = $"Payslips_{run.PeriodYear}_{run.PeriodMonth:D2}.zip";
        return File(ms.ToArray(), "application/zip", zipName);
    }

    [HttpPost("runs/{id}/email-payslips")]
    public async Task<ActionResult> EmailPayslips(int id)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();

        var run = await _db.PayRuns
            .Include(r => r.Payslips).ThenInclude(p => p.Employee)
            .Include(r => r.Payslips).ThenInclude(p => p.Lines)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
        if (run == null) return NotFound();

        var monthName = new DateTime(2000, run.PeriodMonth, 1).ToString("MMMM");
        var sent = 0;
        foreach (var payslip in run.Payslips)
        {
            var emp = payslip.Employee;
            if (emp == null || string.IsNullOrWhiteSpace(emp.Email)) continue;
            try
            {
                await _emailService.SendEmailAsync(emp.Email,
                    $"Your payslip for {monthName} {run.PeriodYear}",
                    EmailTemplates.Payslip(emp.FullName, monthName, run.PeriodYear, payslip));
                sent++;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to email payslip to {Email}", emp.Email);
            }
        }

        _logger.LogInformation("[PAYSLIP-BULK] Run {RunId} emailed to {Count} employee(s).", id, sent);
        return Ok(new { message = $"Payslips emailed to {sent} employee(s)." });
    }

    // ────── Statutory register (PF / ESI / PT) ──────

    [HttpGet("statutory/{runId}")]
    public async Task<ActionResult<StatutoryReportDto>> GetStatutoryReport(int runId)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();

        var run = await _db.PayRuns
            .Include(r => r.Payslips).ThenInclude(p => p.Lines)
            .Include(r => r.Payslips).ThenInclude(p => p.Employee)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == runId);
        if (run == null) return NotFound();
        if (run.Status != PayRunStatus.Processed) return BadRequest(new { message = "Statutory register is only available for a processed pay run." });

        var lines = new List<StatutoryLineDto>();
        foreach (var payslip in run.Payslips.OrderBy(p => p.Employee?.FullName))
        {
            var basicLine = payslip.Lines
                .Where(l => l.Type == PayComponentType.Earning && l.ComponentName.Contains("Basic", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(l => l.Amount)
                .FirstOrDefault();
            var basic = basicLine?.Amount ?? payslip.GrossEarnings * 0.5m;
            var tds = payslip.Lines
                .Where(l => l.Type == PayComponentType.Deduction && l.ComponentName.Contains("TDS", StringComparison.OrdinalIgnoreCase))
                .Sum(l => l.Amount);

            lines.Add(StatutoryCalculator.ComputeLine(
                payslip.EmployeeId,
                payslip.Employee?.FullName ?? "Unknown",
                payslip.Employee?.EmployeeCode ?? "",
                basic, payslip.GrossEarnings, tds));
        }

        return Ok(new StatutoryReportDto(
            run.Id, run.PeriodMonth, run.PeriodYear, lines, StatutoryCalculator.Totals(lines)));
    }

    [HttpGet("statutory/{runId}/export")]
    public async Task<ActionResult> ExportStatutoryReport(int runId)
    {
        if (!await IsPayrollAdminAsync()) return Forbid();

        var run = await _db.PayRuns
            .Include(r => r.Payslips).ThenInclude(p => p.Lines)
            .Include(r => r.Payslips).ThenInclude(p => p.Employee)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == runId);
        if (run == null) return NotFound();
        if (run.Status != PayRunStatus.Processed) return BadRequest(new { message = "Statutory register is only available for a processed pay run." });

        var lines = new List<StatutoryLineDto>();
        foreach (var payslip in run.Payslips.OrderBy(p => p.Employee?.FullName))
        {
            var basicLine = payslip.Lines
                .Where(l => l.Type == PayComponentType.Earning && l.ComponentName.Contains("Basic", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(l => l.Amount)
                .FirstOrDefault();
            var basic = basicLine?.Amount ?? payslip.GrossEarnings * 0.5m;
            var tds = payslip.Lines
                .Where(l => l.Type == PayComponentType.Deduction && l.ComponentName.Contains("TDS", StringComparison.OrdinalIgnoreCase))
                .Sum(l => l.Amount);

            lines.Add(StatutoryCalculator.ComputeLine(
                payslip.EmployeeId,
                payslip.Employee?.FullName ?? "Unknown",
                payslip.Employee?.EmployeeCode ?? "",
                basic, payslip.GrossEarnings, tds));
        }

        var totals = StatutoryCalculator.Totals(lines);

        using var wb = new XLWorkbook();
        var ws = wb.Worksheets.Add($"Statutory_{run.PeriodYear}_{run.PeriodMonth:D2}");
        ws.Cell(1, 1).Value = "Relisoft Technologies Pvt. Ltd. - Statutory Payroll Register";
        ws.Cell(2, 1).Value = $"Period: {new DateTime(2000, run.PeriodMonth, 1).ToString("MMMM")} {run.PeriodYear}";
        ws.Range(1, 1, 1, 12).Merge();
        ws.Range(1, 1, 2, 12).Style.Font.Bold = true;

        var header = new[] { "Employee", "Code", "Basic", "Gross", "PF (Emp)", "PF (Emp)", "EPS", "EDLI", "ESI (Emp)", "ESI (Emp)", "PT", "TDS", "Net Pay" };
        for (var i = 0; i < header.Length; i++) ws.Cell(4, i + 1).Value = header[i];
        ws.Range(4, 1, 4, header.Length).Style.Font.Bold = true;

        var row = 5;
        foreach (var l in lines)
        {
            ws.Cell(row, 1).Value = l.EmployeeName;
            ws.Cell(row, 2).Value = l.EmployeeCode;
            ws.Cell(row, 3).Value = l.Basic;
            ws.Cell(row, 4).Value = l.Gross;
            ws.Cell(row, 5).Value = l.EmployeePf;
            ws.Cell(row, 6).Value = l.EmployerPf;
            ws.Cell(row, 7).Value = l.EmployerEps;
            ws.Cell(row, 8).Value = l.EmployerEdli;
            ws.Cell(row, 9).Value = l.EmployeeEsi;
            ws.Cell(row, 10).Value = l.EmployerEsi;
            ws.Cell(row, 11).Value = l.ProfessionalTax;
            ws.Cell(row, 12).Value = l.Tds;
            ws.Cell(row, 13).Value = l.NetPay;
            row++;
        }

        ws.Cell(row, 1).Value = "TOTAL";
        ws.Cell(row, 2).Value = "";
        ws.Cell(row, 3).Value = totals.Basic;
        ws.Cell(row, 4).Value = totals.Gross;
        ws.Cell(row, 5).Value = totals.EmployeePf;
        ws.Cell(row, 6).Value = totals.EmployerPf;
        ws.Cell(row, 7).Value = totals.EmployerEps;
        ws.Cell(row, 8).Value = totals.EmployerEdli;
        ws.Cell(row, 9).Value = totals.EmployeeEsi;
        ws.Cell(row, 10).Value = totals.EmployerEsi;
        ws.Cell(row, 11).Value = totals.ProfessionalTax;
        ws.Cell(row, 12).Value = totals.Tds;
        ws.Range(row, 1, row, 13).Style.Font.Bold = true;

        ws.Columns(1, 13).AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        var fileName = $"Statutory_Register_{run.PeriodYear}_{run.PeriodMonth:D2}.xlsx";
        return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    private static string BuildPayslipHtml(Payslip payslip, PayRun run)
    {
        var monthName = new DateTime(2000, run.PeriodMonth, 1).ToString("MMMM");
        var lines = new StringBuilder();
        foreach (var l in payslip.Lines)
        {
            lines.Append("<tr>");
            lines.Append($"<td>{l.ComponentName}</td><td>{l.Type}</td><td>{(l.Type == PayComponentType.Deduction ? "-" : "")}₹{l.Amount:N2}</td>");
            lines.Append("</tr>");
        }
        return $@"<!DOCTYPE html><html><head><meta charset='utf-8'><title>Payslip</title>
<style>body{{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:30px}}
.payslip{{max-width:720px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.1)}}
.hd{{background:#001428;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}}
.hd h1{{margin:0;font-size:20px}}table{{width:100%;border-collapse:collapse}}
td{{padding:10px 16px;border-bottom:1px solid #eef2f7;font-size:13px}}
td:first-child{{font-weight:600}}tfoot td{{font-weight:800;background:#f8fafc}}
@media print{{body{{background:#fff}} .payslip{{box-shadow:none}}}}</style></head><body>
<div class='payslip'><div class='hd'><h1>Relisoft Technologies — Payslip</h1><div>{monthName} {run.PeriodYear}</div></div>
<table><tr><th>Employee</th><td>{payslip.Employee?.FullName ?? ""}</td><th>Employee ID</th><td>{payslip.Employee?.EmployeeCode ?? ""}</td></tr>
{lines}
<tfoot><tr><td>Gross Earnings</td><td colspan='3'>₹{payslip.GrossEarnings:N2}</td></tr>
<tr><td>Total Deductions</td><td colspan='3'>-₹{payslip.TotalDeductions:N2}</td></tr>
<tr><td>Net Pay</td><td colspan='3'>₹{payslip.NetPay:N2}</td></tr></tfoot></table>
<div style='padding:16px;font-size:11px;color:#94a3b8'>This is a system-generated payslip. Relisoft Technologies Pvt. Ltd.</div></div></body></html>";
    }

    // ────── Mapping helpers ──────

    private async Task<EmployeeSalaryStructureDto> MapStructureAsync(EmployeeSalaryStructure s)
    {
        var componentIds = s.Lines.Select(l => l.PayComponentId).Distinct().ToList();
        var components = await _db.PayComponents.AsNoTracking()
            .Where(c => componentIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id);

        return new EmployeeSalaryStructureDto(
            s.EmployeeId,
            s.Employee?.FullName ?? "Unknown",
            s.EffectiveFrom,
            s.Lines.Select(l => new SalaryStructureLineDto(
                l.PayComponentId,
                components.TryGetValue(l.PayComponentId, out var c) ? c.Name : "Unknown",
                components.TryGetValue(l.PayComponentId, out var cc) ? cc.Type.ToString() : PayComponentType.Earning.ToString(),
                l.MonthlyAmount
            )).ToList());
    }

    private static PayComponentDto MapComponent(PayComponent c) =>
        new(c.Id, c.Name, c.Type.ToString(), c.Description, c.IsActive, c.IsAuto, c.Rate);

    private static PayRunDto MapRun(PayRun r) =>
        new(r.Id, r.PeriodMonth, r.PeriodYear, r.Status.ToString(), r.ProcessedOn,
            r.Payslips.Count, r.Payslips.Sum(p => p.NetPay));

    private static PayslipDto MapPayslip(Payslip p, PayRun run, string employeeName) =>
        new(p.Id, run.Id, run.PeriodMonth, run.PeriodYear, p.EmployeeId, employeeName,
            p.GrossEarnings, p.TotalDeductions, p.NetPay,
            p.Lines.Select(l => new PayslipLineDto(l.ComponentName, l.Type.ToString(), l.Amount)).ToList());

    private async Task SendPayslipEmailsAsync(PayRun run)
    {
        var employeeIds = run.Payslips.Select(p => p.EmployeeId).Distinct().ToList();
        var employees = await _db.Employees.AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id);

        var monthName = new DateTime(2000, run.PeriodMonth, 1).ToString("MMMM");
        foreach (var payslip in run.Payslips)
        {
            if (!employees.TryGetValue(payslip.EmployeeId, out var employee) || string.IsNullOrEmpty(employee.Email))
                continue;
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

    private async Task<bool> IsPayrollAdminAsync()
    {
        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return false;
        var employee = await _db.Employees.Include(e => e.Role).AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == authenticatedEmployeeId.Value);
        return employee?.Role?.Name is string role && PayrollAdminRoles.Contains(role);
    }

    private int? GetAuthenticatedEmployeeId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var employeeId) ? employeeId : null;
    }
}