using Microsoft.AspNetCore.Authorization;
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

    public WorkspaceController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    private bool CanManageDelegate(int managerId) =>
        managerId == GetUserId() ||
        User.IsInRole("HR") ||
        User.IsInRole("HRL2") ||
        User.IsInRole("OrganizationHead");

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

        return Ok(new WorkspaceResponse(
            employees.Select(e => MapEmployee(e)).ToList(),
            projects.Select(p => MapProject(p)).ToList(),
            leaveTypes.Select(lt => new LeaveTypeDto(lt.Id, lt.Name, lt.CarryForwardPct, lt.IsCompOff, lt.IsFloaterHoliday, lt.MaxFloaterPerYear, lt.CompOffValidityDays)).ToList(),
            roles.Select(r => new RoleDto(r.Id, r.Name, r.Label, r.IsCustom, r.BaseRoleId)).ToList(),
            new HrPolicyDto(hrPolicy.AllowHalfDayLeave, hrPolicy.SandwichLeave, hrPolicy.RowVersion)
        ));
    }

    [HttpPost("employees")]
    public async Task<ActionResult<CreateEmployeeResponse>> CreateEmployee(CreateEmployeeRequest req)
    {
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
            PrimaryTeamId = req.PrimaryTeamId
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
        HttpConcurrency.RequireIfMatch(Request, _db, employee);

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
        HttpConcurrency.SetETag(Response, employee.RowVersion);
        return Ok(new { message = "Employee updated.", employee.RowVersion });
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
        HttpConcurrency.RequireIfMatch(Request, _db, project);
        project.Name = req.Name;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, project.RowVersion);
        return Ok(new { message = "Project updated.", project.RowVersion });
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
        HttpConcurrency.RequireIfMatch(Request, _db, team);
        team.Name = req.Name;
        team.ProjectId = req.ProjectId;
        team.LeadId = req.LeadId;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, team.RowVersion);
        return Ok(new { message = "Team updated.", team.RowVersion });
    }

    [HttpPut("hr-policy")]
    public async Task<ActionResult> UpdateHrPolicy(UpdateHrPolicyRequest req)
    {
        var policy = await _db.HrPolicies.FirstOrDefaultAsync();
        if (policy == null)
        {
            policy = new HrPolicy { AllowHalfDayLeave = req.AllowHalfDayLeave, SandwichLeave = req.SandwichLeave };
            _db.HrPolicies.Add(policy);
        }
        else
        {
            HttpConcurrency.RequireIfMatch(Request, _db, policy);
            policy.AllowHalfDayLeave = req.AllowHalfDayLeave;
            policy.SandwichLeave = req.SandwichLeave;
            policy.UpdatedOn = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, policy?.RowVersion);
        return Ok(new { message = "HR policy updated.", RowVersion = policy?.RowVersion });
    }

    [HttpGet("delegates/{managerId}")]
    public async Task<ActionResult> GetDelegates(int managerId)
    {
        var delegates = await _db.ApprovalDelegates
            .Include(d => d.Delegate)
            .Include(d => d.Project)
            .Where(d => d.ManagerId == managerId)
            .ToListAsync();

        return Ok(delegates.Select(d => new { d.Id, d.DelegateId, DelegateName = d.Delegate?.FullName, d.ProjectId, ProjectName = d.Project?.Name, IsGeneral = !d.ProjectId.HasValue, d.RowVersion }));
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
        if (!CanManageDelegate(d.ManagerId)) return Forbid();
        HttpConcurrency.RequireIfMatch(Request, _db, d);
        _db.SoftDelete(d, GetUserId());
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, d.RowVersion);
        return Ok(new { message = "Delegate removed." });
    }

    [HttpGet("leave-report")]
    public async Task<ActionResult> GetLeaveReport([FromQuery] int? year)
    {
        var y = year ?? DateTime.UtcNow.Year;
        var leaves = await _db.LeaveApplications
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => l.AppliedOn.Year == y)
            .OrderBy(l => l.Employee!.FullName)
            .ThenBy(l => l.AppliedOn)
            .ToListAsync();

        return Ok(leaves.Select(l => new
        {
            l.Id, EmployeeName = l.Employee?.FullName, l.Employee?.EmployeeCode,
            LeaveType = l.LeaveType?.Name, l.FromDate, l.ToDate, l.TotalDays, l.Status, l.LossOfPay
        }));
    }

    [HttpGet("floater-usage/{employeeId}")]
    public async Task<ActionResult> GetFloaterUsage(int employeeId, [FromQuery] int year)
    {
        var y = year;
        var used = await _db.LeaveApplications
            .CountAsync(l => l.EmployeeId == employeeId && l.LeaveType!.IsFloaterHoliday && l.AppliedOn.Year == y && l.Status == "Approved");
        var lt = await _db.LeaveTypes.FirstOrDefaultAsync(l => l.IsFloaterHoliday);
        return Ok(new FloaterHolidayUsageDto(used, lt?.MaxFloaterPerYear ?? 2));
    }

    private EmployeeDto MapEmployee(Employee e)
    {
        var teams = e.EmployeeTeams.Select(et => new TeamDto(
            et.Team!.Id, et.Team.Name, et.Team.ProjectId,
            et.Team.Project?.Name ?? "", et.Team.LeadId,
            et.Team.Lead?.FullName ?? "", et.Team.RowVersion
        )).ToList();

        SalaryStructureDto? ss = null;
        if (e.SalaryStructure != null)
        {
            ss = new SalaryStructureDto(e.SalaryStructure.FixedPay, e.SalaryStructure.VariablePay,
                e.SalaryStructure.PF, e.SalaryStructure.Gratuity,
                e.SalaryStructure.Insurance, e.SalaryStructure.OtherDeductions);
        }

        return new EmployeeDto(
            e.Id, e.EmployeeCode, e.FullName, e.Email, e.Department,
            e.Designation, e.JobRole, e.EmploymentType, e.Status, e.Location,
            ss, e.JoinDate,
            e.Role?.Name ?? "", e.RoleId, e.Role?.Label,
            e.PrimaryTeam != null
                ? new TeamDto(e.PrimaryTeam.Id, e.PrimaryTeam.Name,
                    e.PrimaryTeam.ProjectId, e.PrimaryTeam.Project?.Name ?? "",
                    e.PrimaryTeam.LeadId, e.PrimaryTeam.Lead?.FullName ?? "", e.PrimaryTeam.RowVersion)
                : null,
            e.PrimaryTeamId,
            teams,
            e.LeaveBalances.Select(lb => new LeaveBalanceDto(
                lb.Id, lb.LeaveTypeId, lb.LeaveType?.Name ?? "",
                lb.AllocatedLeaves, lb.UsedLeaves, lb.RemainingLeaves
            )).ToList(),
            null,
            e.RowVersion
        );
    }

    private static ProjectDto MapProject(Project p)
    {
        return new ProjectDto(p.Id, p.Name,
            p.Teams.Select(t => new TeamDto(
                t.Id, t.Name, p.Id, p.Name, t.LeadId, t.Lead?.FullName ?? "", t.RowVersion
            )).ToList(),
            p.RowVersion
        );
    }
}
