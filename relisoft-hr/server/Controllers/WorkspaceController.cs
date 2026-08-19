using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/workspace")]
public class WorkspaceController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILeaveBalanceService _leaveBalanceService;
    private readonly JoinerAnnouncementService _joinerService;

    public WorkspaceController(AppDbContext db, ILeaveBalanceService leaveBalanceService, JoinerAnnouncementService joinerService)
    {
        _db = db;
        _leaveBalanceService = leaveBalanceService;
        _joinerService = joinerService;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<ActionResult<WorkspaceResponse>> GetWorkspace()
    {
        var employees = await _db.Employees
            .Include(e => e.Role)
            .Include(e => e.SalaryStructure)
            .Include(e => e.PrimaryTeam).ThenInclude(t => t!.Project)
            .Include(e => e.EmployeeTeams).ThenInclude(et => et.Team).ThenInclude(t => t!.Project)
            .Include(e => e.LeaveBalances).ThenInclude(lb => lb.LeaveType)
            .ToListAsync();

        var projects = await _db.Projects
            .Include(p => p.Teams).ThenInclude(t => t.Lead)
            .ToListAsync();

        var leaveTypes = await _db.LeaveTypes.Where(lt => lt.IsActive).OrderBy(lt => lt.SortOrder).ToListAsync();
        var roles = await _db.OrganizationRoles.ToListAsync();
        var hrPolicy = await _db.HrPolicies.FirstOrDefaultAsync() ?? new HrPolicy();
        var employeeDtos = new List<EmployeeDto>();
        var plannedLeaveTypeId = leaveTypes.SingleOrDefault(leaveType => leaveType.Name == "Planned Leave")?.Id;
        foreach (var employee in employees)
            employeeDtos.Add(await MapEmployeeAsync(employee, plannedLeaveTypeId));

        return Ok(new WorkspaceResponse(
            employeeDtos,
            projects.Select(p => MapProject(p)).ToList(),
            leaveTypes.Select(lt => new LeaveTypeDto(lt.Id, lt.Name, lt.CarryForwardPct, lt.IsCompOff, lt.IsFloaterHoliday, lt.MaxFloaterPerYear, lt.CompOffValidityDays)).ToList(),
            roles.Select(r => new RoleDto(r.Id, r.Name, r.Label, r.IsCustom, r.BaseRoleId)).ToList(),
            new HrPolicyDto(hrPolicy.AllowHalfDayLeave, hrPolicy.SandwichLeave)
        ));
    }

    [HttpPost("employees")]
    public async Task<ActionResult<CreateEmployeeResponse>> CreateEmployee(CreateEmployeeRequest req)
    {
        // NEW: resolve the selected manager's EmployeeCode from their Id
        string? managerCode = null;
        if (req.ManagerId.HasValue)
        {
            var manager = await _db.Employees.FindAsync(req.ManagerId.Value);
            managerCode = manager?.EmployeeCode;
        }

        var employee = new Employee
        {
            EmployeeCode = req.EmployeeCode,
            FullName = req.FullName,
            Email = req.Email,
            Department = req.Department,
            Designation = req.Designation,
            JobRole = req.JobRole,
            EmploymentType = req.EmploymentType,
            Location = req.Location,
            JoinDate = req.JoinDate,
            RoleId = req.Role,
            PrimaryTeamId = req.PrimaryTeamId,
            ManagerCode = managerCode,   // NEW
            UanNumber = string.IsNullOrWhiteSpace(req.UanNumber) ? null : req.UanNumber.Trim(),
            PanNumber = string.IsNullOrWhiteSpace(req.PanNumber) ? null : req.PanNumber.Trim(),
            IsUnpaidIntern = req.IsUnpaidIntern
        };

        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        if (req.SalaryStructure != null)
        {
            var ss = new SalaryStructure
            {
                EmployeeId = employee.Id,
                FixedPay = req.SalaryStructure.FixedPay,
                VariablePay = req.SalaryStructure.VariablePay,
                PF = req.SalaryStructure.PF,
                Gratuity = req.SalaryStructure.Gratuity,
                Insurance = req.SalaryStructure.Insurance,
                OtherDeductions = req.SalaryStructure.OtherDeductions
            };
            _db.SalaryStructures.Add(ss);
            await _db.SaveChangesAsync();
        }

        foreach (var teamId in req.TeamIds)
        {
            _db.EmployeeTeams.Add(new EmployeeTeam { EmployeeId = employee.Id, TeamId = teamId });
        }

        var username = req.Email.Split('@')[0];
        var tempPassword = "demo123";
        _db.UserLogins.Add(new UserLogin
        {
            EmployeeId = employee.Id,
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword)
        });

        await _db.SaveChangesAsync();

        await _joinerService.AnnounceJoinerAsync(employee, GetUserId());

        return Ok(new CreateEmployeeResponse(
            "Employee registered successfully.",
            username, tempPassword
        ));
    }

    [HttpPut("employees/{id}")]
    public async Task<ActionResult> UpdateEmployee(int id, UpdateEmployeeRequest req)
    {
        var employee = await _db.Employees
            .Include(e => e.EmployeeTeams)
            .Include(e => e.SalaryStructure)
            .FirstOrDefaultAsync(e => e.Id == id);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        employee.EmployeeCode = req.EmployeeCode;
        employee.FullName = req.FullName;
        employee.Email = req.Email;
        employee.Department = req.Department;
        employee.Designation = req.Designation;
        employee.JobRole = req.JobRole;
        employee.EmploymentType = req.EmploymentType;
        employee.Location = req.Location;
        employee.JoinDate = req.JoinDate;
        employee.RoleId = req.Role;
        employee.PrimaryTeamId = req.PrimaryTeamId;
        employee.UanNumber = string.IsNullOrWhiteSpace(req.UanNumber) ? null : req.UanNumber.Trim();
        employee.PanNumber = string.IsNullOrWhiteSpace(req.PanNumber) ? null : req.PanNumber.Trim();
        employee.IsUnpaidIntern = req.IsUnpaidIntern;
        employee.UpdatedOn = DateTime.UtcNow;

        if (req.SalaryStructure != null)
        {
            var ss = employee.SalaryStructure;
            if (ss == null)
            {
                ss = new SalaryStructure { EmployeeId = id };
                _db.SalaryStructures.Add(ss);
            }
            ss.FixedPay = req.SalaryStructure.FixedPay;
            ss.VariablePay = req.SalaryStructure.VariablePay;
            ss.PF = req.SalaryStructure.PF;
            ss.Gratuity = req.SalaryStructure.Gratuity;
            ss.Insurance = req.SalaryStructure.Insurance;
            ss.OtherDeductions = req.SalaryStructure.OtherDeductions;
        }

        _db.EmployeeTeams.RemoveRange(employee.EmployeeTeams);
        foreach (var teamId in req.TeamIds)
        {
            _db.EmployeeTeams.Add(new EmployeeTeam { EmployeeId = id, TeamId = teamId });
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Employee updated." });
    }

    [HttpPost("projects")]
    public async Task<ActionResult> CreateProject(CreateProjectRequest req)
    {
        _db.Projects.Add(new Project { Name = req.Name });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Project created." });
    }

    [HttpPut("projects/{id}")]
    public async Task<ActionResult> UpdateProject(int id, UpdateProjectRequest req)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound(new { message = "Project not found." });
        project.Name = req.Name;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Project updated." });
    }

    [HttpPost("teams")]
    public async Task<ActionResult> CreateTeam(CreateTeamRequest req)
    {
        _db.Teams.Add(new Team
        {
            Name = req.Name,
            ProjectId = req.ProjectId,
            LeadId = req.LeadId
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Team created." });
    }

    [HttpPut("teams/{id}")]
    public async Task<ActionResult> UpdateTeam(int id, UpdateTeamRequest req)
    {
        var team = await _db.Teams.FindAsync(id);
        if (team == null) return NotFound(new { message = "Team not found." });
        team.Name = req.Name;
        team.ProjectId = req.ProjectId;
        team.LeadId = req.LeadId;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Team updated." });
    }

    [HttpPut("hr-policy")]
    public async Task<ActionResult> UpdateHrPolicy(UpdateHrPolicyRequest req)
    {
        var policy = await _db.HrPolicies.FirstOrDefaultAsync();
        if (policy == null)
        {
            _db.HrPolicies.Add(new HrPolicy { AllowHalfDayLeave = req.AllowHalfDayLeave, SandwichLeave = req.SandwichLeave });
        }
        else
        {
            policy.AllowHalfDayLeave = req.AllowHalfDayLeave;
            policy.SandwichLeave = req.SandwichLeave;
            policy.UpdatedOn = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "HR policy updated." });
    }

    [HttpGet("delegates/{managerId}")]
    public async Task<ActionResult> GetDelegates(int managerId)
    {
        var delegates = await _db.ApprovalDelegates
            .Include(d => d.Delegate)
            .Include(d => d.Project)
            .Where(d => d.ManagerId == managerId)
            .ToListAsync();

        return Ok(delegates.Select(d => new { d.Id, d.DelegateId, DelegateName = d.Delegate?.FullName, d.ProjectId, ProjectName = d.Project?.Name, IsGeneral = !d.ProjectId.HasValue }));
    }

    [HttpPost("delegates")]
    public async Task<ActionResult> AddDelegate(ApprovalDelegateRequest req, [FromQuery] int managerId)
    {
        var exists = await _db.ApprovalDelegates.AnyAsync(d => d.ManagerId == managerId && d.ProjectId == req.ProjectId && d.DelegateId == req.DelegateId);
        if (exists) return Conflict(new { message = "Delegate already exists." });

        _db.ApprovalDelegates.Add(new ApprovalDelegate
        {
            ManagerId = managerId,
            ProjectId = req.ProjectId,
            DelegateId = req.DelegateId
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Delegate added." });
    }

    [HttpDelete("delegates/{id}")]
    public async Task<ActionResult> RemoveDelegate(int id)
    {
        var d = await _db.ApprovalDelegates.FindAsync(id);
        if (d == null) return NotFound();
        _db.ApprovalDelegates.Remove(d);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Delegate removed." });
    }

    [HttpGet("leave-report")]
    public async Task<ActionResult> GetLeaveReport([FromQuery] int? year)
    {
        var y = year ?? DateTime.UtcNow.Year;
        var leaves = await _db.LeaveApplications
            .Include(l => l.Employee)
                 .ThenInclude(e => e!.LeaveBalances)
            .Include(l => l.LeaveType)
            .Where(l => l.AppliedOn.Year == y)
            .OrderBy(l => l.Employee!.FullName)
            .ThenBy(l => l.AppliedOn)
            .ToListAsync();

        var report = new List<object>();

        foreach (var leave in leaves)
        {
            decimal remainingLeaves = 0;

            var balance = await _leaveBalanceService.GetBalanceAsync(
                leave.EmployeeId,
                leave.LeaveTypeId
            );

            if (balance != null)
            {
                remainingLeaves = balance.RemainingLeaves;
            }

            report.Add(new
            {
                leave.Id,
                EmployeeName = leave.Employee?.FullName,
                leave.Employee?.EmployeeCode,
                LeaveType = leave.LeaveType?.Name,
                leave.FromDate,
                leave.ToDate,
                leave.TotalDays,
                leave.Status,
                ApprovedBy = leave.ApproverName,
                RemainingLeaves = remainingLeaves,

                ExtraLeavesTaken =
                    leave.Status == "Approved"
                        ? leave.LopDays
                        : 0m,

                leave.LossOfPay
            });
        }

        return Ok(report);
    }

    [HttpGet("floater-usage/{employeeId}")]
    public async Task<ActionResult> GetFloaterUsage(int employeeId, [FromQuery] int year)
    {
        var y = year;
        var used = await _db.LeaveApplications
            .CountAsync(l => l.EmployeeId == employeeId && l.LeaveType!.IsFloaterHoliday && l.FromDate.Year == y && l.Status == "Approved");
        var lt = await _db.LeaveTypes.FirstOrDefaultAsync(l => l.IsFloaterHoliday);
        return Ok(new FloaterHolidayUsageDto(used, lt?.MaxFloaterPerYear ?? 2));
    }

    private async Task<EmployeeDto> MapEmployeeAsync(Employee e, int? plannedLeaveTypeId)
    {
        var teams = e.EmployeeTeams.Select(et => new TeamDto(
            et.Team!.Id, et.Team.Name, et.Team.ProjectId,
            et.Team.Project?.Name ?? "", et.Team.LeadId,
            et.Team.Lead?.FullName ?? ""
        )).ToList();

        SalaryStructureDto? ss = null;
        if (e.SalaryStructure != null)
        {
            ss = new SalaryStructureDto(e.SalaryStructure.FixedPay, e.SalaryStructure.VariablePay,
                e.SalaryStructure.PF, e.SalaryStructure.Gratuity,
                e.SalaryStructure.Insurance, e.SalaryStructure.OtherDeductions);
        }

        var leaveBalances = e.LeaveBalances.Select(lb => new LeaveBalanceDto(
            lb.Id, lb.LeaveTypeId, lb.LeaveType?.Name ?? "",
            lb.AllocatedLeaves, lb.UsedLeaves, lb.RemainingLeaves,
            lb.CarryForwardDays, lb.FinancialYear
        )).ToList();

        if (plannedLeaveTypeId.HasValue)
        {
            var plannedBalance = await _leaveBalanceService.GetBalanceAsync(e.Id, plannedLeaveTypeId.Value);
            if (plannedBalance != null)
            {
                var existingIndex = leaveBalances.FindIndex(balance => balance.LeaveTypeId == plannedLeaveTypeId.Value);
                var dynamicBalance = new LeaveBalanceDto(plannedBalance.Id, plannedBalance.LeaveTypeId,
                    plannedBalance.LeaveTypeName, plannedBalance.AllocatedLeaves, plannedBalance.UsedLeaves,
                    plannedBalance.RemainingLeaves);
                if (existingIndex >= 0) leaveBalances[existingIndex] = dynamicBalance;
                else leaveBalances.Add(dynamicBalance);
            }
        }

        return new EmployeeDto(
            e.Id, e.EmployeeCode, e.FullName, e.Email, e.Department,
            e.Designation, e.JobRole, e.EmploymentType, e.Status, e.Location,
            ss, e.JoinDate,
            e.Role?.Name ?? "", e.RoleId, e.Role?.Label,
            e.PrimaryTeam != null
                ? new TeamDto(e.PrimaryTeam.Id, e.PrimaryTeam.Name,
                    e.PrimaryTeam.ProjectId, e.PrimaryTeam.Project?.Name ?? "",
                    e.PrimaryTeam.LeadId, e.PrimaryTeam.Lead?.FullName ?? "")
                : null,
            e.PrimaryTeamId,
            teams,
            leaveBalances,
            null,
            e.UanNumber, e.PanNumber, e.IsUnpaidIntern
        );
    }

    private static ProjectDto MapProject(Project p)
    {
        return new ProjectDto(p.Id, p.Name,
            p.Teams.Select(t => new TeamDto(
                t.Id, t.Name, p.Id, p.Name, t.LeadId, t.Lead?.FullName ?? ""
            )).ToList()
        );
    }
}
