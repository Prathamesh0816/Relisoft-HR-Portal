using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
using ClosedXML.Excel;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/excel")]
public class ExcelController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExcelController(AppDbContext db) => _db = db;

    [HttpGet("existing-employees-template")]
    public ActionResult DownloadExistingEmployeesTemplate()
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Existing Employees");
        ws.Cell(1, 1).Value = "EmployeeCode";
        ws.Cell(1, 2).Value = "FullName";
        ws.Cell(1, 3).Value = "Email";
        ws.Cell(1, 4).Value = "Department";
        ws.Cell(1, 5).Value = "Designation";
        ws.Cell(1, 6).Value = "JobRole";
        ws.Cell(1, 7).Value = "EmploymentType";
        ws.Cell(1, 8).Value = "Location";
        ws.Cell(1, 9).Value = "JoinDate";
        ws.Cell(1, 10).Value = "PrimaryProjectId";
        ws.Cell(1, 11).Value = "ProjectIds";
        ws.Cell(1, 12).Value = "PrimaryTeamId";
        ws.Cell(1, 13).Value = "TeamIds";

        var header = ws.Row(1);
        header.Style.Font.Bold = true;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "existing-employees-template.xlsx");
    }

    [HttpPost("upload-existing-employees")]
    public async Task<ActionResult> UploadExistingEmployees(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        stream.Position = 0;

        using var workbook = new XLWorkbook(stream);
        var ws = workbook.Worksheet(1);
        var rows = ws.RowsUsed().Skip(1);

        var processed = 0;
        var failed = 0;
        var errors = new List<string>();

        foreach (var row in rows)
        {
            try
            {
                var employeeCode = row.Cell(1).GetString().Trim();
                if (string.IsNullOrEmpty(employeeCode))
                {
                    failed++;
                    continue;
                }

                if (await _db.Employees.AnyAsync(e => e.EmployeeCode == employeeCode))
                {
                    failed++;
                    errors.Add($"Duplicate employee code: {employeeCode}");
                    continue;
                }

                var primaryProjectId = row.Cell(10).GetValue<int>();
                var projectIds = ParseIds(row.Cell(11).GetString());
                var primaryTeamId = row.Cell(12).GetValue<int>();
                var teamIds = ParseIds(row.Cell(13).GetString());
                if (!projectIds.Contains(primaryProjectId) || !teamIds.Contains(primaryTeamId))
                    throw new InvalidOperationException("Primary project/team must be included in the corresponding membership list.");

                var existingProjectCount = await _db.Projects.CountAsync(project => projectIds.Contains(project.Id));
                var selectedTeams = await _db.Teams
                    .Where(team => teamIds.Contains(team.Id))
                    .Select(team => new { team.Id, team.ProjectId })
                    .ToListAsync();
                if (existingProjectCount != projectIds.Count || selectedTeams.Count != teamIds.Count)
                    throw new InvalidOperationException("One or more project or team IDs do not exist.");
                if (selectedTeams.Any(team => !projectIds.Contains(team.ProjectId)) ||
                    selectedTeams.Single(team => team.Id == primaryTeamId).ProjectId != primaryProjectId)
                    throw new InvalidOperationException("Team memberships must belong to selected projects, including the primary team.");

                var employee = new Employee
                {
                    EmployeeCode = employeeCode,
                    FullName = row.Cell(2).GetString().Trim(),
                    Email = row.Cell(3).GetString().Trim(),
                    Department = row.Cell(4).GetString().Trim(),
                    Designation = row.Cell(5).GetString().Trim(),
                    JobRole = row.Cell(6).GetString().Trim(),
                    EmploymentType = row.Cell(7).GetString().Trim(),
                    Location = row.Cell(8).GetString().Trim(),
                    JoinDate = row.Cell(9).GetDateTime(),
                    RoleId = 1,
                    PrimaryTeamId = primaryTeamId
                };

                _db.Employees.Add(employee);
                foreach (var projectId in projectIds)
                {
                    employee.EmployeeProjects.Add(new EmployeeProject
                    {
                        ProjectId = projectId,
                        IsPrimary = projectId == primaryProjectId
                    });
                }
                foreach (var teamId in teamIds)
                {
                    employee.EmployeeTeams.Add(new EmployeeTeam { TeamId = teamId });
                }
                await _db.SaveChangesAsync();

                processed++;
            }
            catch (Exception ex)
            {
                failed++;
                errors.Add($"Row {row.RowNumber()}: {ex.Message}");
            }
        }

        return Ok(new
        {
            recordsProcessed = processed,
            recordsFailed = failed,
            errors = errors.Take(20).ToList()
        });
    }

    [HttpGet("leave-balance-template")]
    public ActionResult DownloadLeaveBalanceTemplate()
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Leave Balances");
        ws.Cell(1, 1).Value = "EmployeeCode";
        ws.Cell(1, 2).Value = "LeaveTypeName";
        ws.Cell(1, 3).Value = "AllocatedLeaves";
        ws.Cell(1, 4).Value = "UsedLeaves";

        ws.Row(1).Style.Font.Bold = true;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "leave-balance-template.xlsx");
    }

    [HttpGet("leave-report")]
    public async Task<ActionResult> ExportLeaveReport()
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Leave Report");

        ws.Cell(1, 1).Value = "EmployeeCode";
        ws.Cell(1, 2).Value = "FullName";
        ws.Cell(1, 3).Value = "Role";
        ws.Cell(1, 4).Value = "LeaveType";
        ws.Cell(1, 5).Value = "Allocated";
        ws.Cell(1, 6).Value = "Used";
        ws.Cell(1, 7).Value = "Remaining";

        ws.Row(1).Style.Font.Bold = true;

        var employees = await _db.Employees.Include(e => e.Role).ToListAsync();
        var leaveTypes = await _db.LeaveTypes.ToListAsync();
        var row = 2;

        foreach (var emp in employees)
        {
            foreach (var lt in leaveTypes)
            {
                var balance = await _db.EmployeeLeaveBalances
                    .FirstOrDefaultAsync(lb => lb.EmployeeId == emp.Id && lb.LeaveTypeId == lt.Id);
                var effectiveBalance = LeaveAccrualCalculator.Calculate(balance, emp, lt, DateTime.UtcNow);

                ws.Cell(row, 1).Value = emp.EmployeeCode;
                ws.Cell(row, 2).Value = emp.FullName;
                ws.Cell(row, 3).Value = emp.Role?.Label ?? "";
                ws.Cell(row, 4).Value = lt.Name;
                ws.Cell(row, 5).Value = effectiveBalance.Allocated;
                ws.Cell(row, 6).Value = effectiveBalance.Used;
                ws.Cell(row, 7).Value = effectiveBalance.Remaining;
                row++;
            }
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "leave-report.xlsx");
    }

    [HttpPost("upload-leave-balances")]
    public async Task<ActionResult> UploadLeaveBalances(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        stream.Position = 0;

        using var workbook = new XLWorkbook(stream);
        var ws = workbook.Worksheet(1);
        var rows = ws.RowsUsed().Skip(1);

        var processed = 0;
        var skipped = 0;
        var failed = 0;
        var errors = new List<string>();

        foreach (var row in rows)
        {
            try
            {
                var employeeCode = row.Cell(1).GetString().Trim();
                var leaveTypeName = row.Cell(2).GetString().Trim();

                var employee = await _db.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
                var leaveType = await _db.LeaveTypes.FirstOrDefaultAsync(lt => lt.Name == leaveTypeName);

                if (employee == null || leaveType == null)
                {
                    skipped++;
                    continue;
                }

                var allocated = decimal.TryParse(row.Cell(3).GetString(), out var alloc) ? alloc : 0;
                var used = decimal.TryParse(row.Cell(4).GetString(), out var u) ? u : 0;

                var balance = await _db.EmployeeLeaveBalances
                    .FirstOrDefaultAsync(lb => lb.EmployeeId == employee.Id && lb.LeaveTypeId == leaveType.Id);

                if (balance == null)
                {
                    balance = new EmployeeLeaveBalance
                    {
                        EmployeeId = employee.Id,
                        LeaveTypeId = leaveType.Id,
                        AllocatedLeaves = allocated,
                        UsedLeaves = used,
                        RemainingLeaves = allocated - used
                    };
                    LeaveAccrualCalculator.RefreshStoredRemaining(balance, employee, leaveType, DateTime.UtcNow);
                    _db.EmployeeLeaveBalances.Add(balance);
                }
                else
                {
                    balance.AllocatedLeaves = allocated;
                    balance.UsedLeaves = used;
                    LeaveAccrualCalculator.RefreshStoredRemaining(balance, employee, leaveType, DateTime.UtcNow);
                }

                processed++;
            }
            catch (Exception ex)
            {
                failed++;
                errors.Add($"Row {row.RowNumber()}: {ex.Message}");
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            recordsProcessed = processed,
            recordsSkipped = skipped,
            recordsFailed = failed,
            errors = errors.Take(20).ToList()
        });
    }

    private static List<int> ParseIds(string value) => value
        .Split([',', ';'], StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
        .Select(id => int.TryParse(id, out var parsed) ? parsed : 0)
        .Where(id => id > 0)
        .Distinct()
        .ToList();
}
