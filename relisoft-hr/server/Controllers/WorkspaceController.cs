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

    private async Task<bool> CanManageDelegate(int managerId) =>
        CanAdministerProjects() ||
        (managerId == GetUserId() && await _db.Projects.AnyAsync(p => p.ManagerId == managerId));

    private bool CanAdministerProjects() =>
        User.IsInRole("HR") || User.IsInRole("HRL2") ||
        User.IsInRole("OrganizationHead") || User.IsInRole("Admin") ||
        User.IsInRole("SuperAdmin");

    private bool CanManageProject(Project project) =>
        CanAdministerProjects() || project.ManagerId == GetUserId();

    [HttpGet]
    public async Task<ActionResult<WorkspaceResponse>> GetWorkspace()
    {
        var employees = await _db.Employees
            .Include(e => e.Role)
            .Include(e => e.SalaryStructure)
            .Include(e => e.PrimaryTeam).ThenInclude(t => t!.Project)!.ThenInclude(p => p!.Manager)
            .Include(e => e.PrimaryTeam).ThenInclude(t => t!.Lead)
            .Include(e => e.EmployeeProjects).ThenInclude(ep => ep.Project)!.ThenInclude(p => p!.Manager)
            .Include(e => e.EmployeeProjects).ThenInclude(ep => ep.Project)!.ThenInclude(p => p!.ApprovalDelegate)!.ThenInclude(d => d!.Delegate)
            .Include(e => e.EmployeeTeams).ThenInclude(et => et.Team).ThenInclude(t => t!.Project)!.ThenInclude(p => p!.Manager)
            .Include(e => e.LeaveBalances).ThenInclude(lb => lb.LeaveType)
            .ToListAsync();

        var projects = await _db.Projects
            .Include(p => p.Manager)
            .Include(p => p.ApprovalDelegate)!.ThenInclude(d => d!.Delegate)
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
    [Authorize(Roles = "HR,HRL2,OrganizationHead,Admin,SuperAdmin")]
    public async Task<ActionResult<CreateEmployeeResponse>> CreateEmployee(CreateEmployeeRequest req)
    {
        var assignmentError = await ValidateEmployeeAssignments(
            req.PrimaryProjectId, req.PrimaryTeamId, req.ProjectIds, req.TeamIds);
        if (assignmentError != null) return BadRequest(new { message = assignmentError });

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

        if (req.SalaryStructure != null)
        {
            employee.SalaryStructure = new SalaryStructure
            {
                FixedPay = req.SalaryStructure.FixedPay,
                VariablePay = req.SalaryStructure.VariablePay,
                PF = req.SalaryStructure.PF,
                Gratuity = req.SalaryStructure.Gratuity,
                Insurance = req.SalaryStructure.Insurance,
                OtherDeductions = req.SalaryStructure.OtherDeductions
            };
        }

        foreach (var projectId in req.ProjectIds.Distinct())
        {
            employee.EmployeeProjects.Add(new EmployeeProject
            {
                ProjectId = projectId,
                IsPrimary = projectId == req.PrimaryProjectId
            });
        }

        foreach (var teamId in req.TeamIds.Distinct())
        {
            employee.EmployeeTeams.Add(new EmployeeTeam { TeamId = teamId });
        }

        var username = req.Email.Split('@')[0];
        var tempPassword = "demo123";
        employee.UserLogin = new UserLogin
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword)
        };

        await _db.SaveChangesAsync();

        return Ok(new CreateEmployeeResponse(
            "Employee registered successfully.",
            username, tempPassword
        ));
    }

    [HttpPut("employees/{id}")]
    [Authorize(Roles = "HR,HRL2,OrganizationHead,Admin,SuperAdmin")]
    public async Task<ActionResult> UpdateEmployee(int id, UpdateEmployeeRequest req)
    {
        var assignmentError = await ValidateEmployeeAssignments(
            req.PrimaryProjectId, req.PrimaryTeamId, req.ProjectIds, req.TeamIds);
        if (assignmentError != null) return BadRequest(new { message = assignmentError });

        var employee = await _db.Employees
            .Include(e => e.EmployeeProjects)
            .Include(e => e.EmployeeTeams)
            .Include(e => e.SalaryStructure)
            .FirstOrDefaultAsync(e => e.Id == id);
        if (employee == null) return NotFound(new { message = "Employee not found." });
        HttpConcurrency.RequireIfMatch(Request, _db, employee);
        await using var transaction = _db.Database.IsRelational()
            ? await _db.Database.BeginTransactionAsync()
            : null;

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

        var requestedProjectIds = req.ProjectIds.Distinct().ToHashSet();
        var previousPrimary = employee.EmployeeProjects.FirstOrDefault(ep => ep.IsPrimary);
        if (previousPrimary != null && previousPrimary.ProjectId != req.PrimaryProjectId)
        {
            previousPrimary.IsPrimary = false;
            await _db.SaveChangesAsync();
        }

        foreach (var membership in employee.EmployeeProjects.ToList())
        {
            if (!requestedProjectIds.Contains(membership.ProjectId))
                _db.EmployeeProjects.Remove(membership);
            else
                membership.IsPrimary = membership.ProjectId == req.PrimaryProjectId;
        }
        foreach (var projectId in requestedProjectIds.Except(employee.EmployeeProjects.Select(ep => ep.ProjectId)))
        {
            employee.EmployeeProjects.Add(new EmployeeProject
            {
                ProjectId = projectId,
                IsPrimary = projectId == req.PrimaryProjectId
            });
        }

        var requestedTeamIds = req.TeamIds.Distinct().ToHashSet();
        foreach (var membership in employee.EmployeeTeams.ToList())
        {
            if (!requestedTeamIds.Contains(membership.TeamId))
                _db.EmployeeTeams.Remove(membership);
        }
        foreach (var teamId in requestedTeamIds.Except(employee.EmployeeTeams.Select(et => et.TeamId)))
        {
            employee.EmployeeTeams.Add(new EmployeeTeam { TeamId = teamId });
        }

        await _db.SaveChangesAsync();
        if (transaction != null) await transaction.CommitAsync();
        HttpConcurrency.SetETag(Response, employee.RowVersion);
        return Ok(new { message = "Employee updated.", employee.RowVersion });
    }

    [HttpPost("projects")]
    public async Task<ActionResult> CreateProject(CreateProjectRequest req)
    {
        if (!CanAdministerProjects()) return Forbid();
        var validation = await ValidateProjectConfiguration(
            req.ManagerId, req.ApprovalRoute, req.DelegateEmployeeId);
        if (validation.Error != null) return BadRequest(new { message = validation.Error });

        var project = new Project
        {
            Name = req.Name.Trim(),
            ManagerId = req.ManagerId,
            ApprovalRoute = validation.Route == ProjectApprovalRoute.Delegate
                ? ProjectApprovalRoute.ProjectManager
                : validation.Route
        };

        await using var transaction = _db.Database.IsRelational() && validation.Route == ProjectApprovalRoute.Delegate
            ? await _db.Database.BeginTransactionAsync()
            : null;
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        if (validation.DelegateEmployee != null)
        {
            var delegation = new ApprovalDelegate
            {
                ManagerId = req.ManagerId,
                ProjectId = project.Id,
                DelegateId = validation.DelegateEmployee.Id
            };
            _db.ApprovalDelegates.Add(delegation);
            await _db.SaveChangesAsync();

            project.ApprovalRoute = ProjectApprovalRoute.Delegate;
            project.ApprovalDelegateId = delegation.Id;
            await _db.SaveChangesAsync();
        }

        if (transaction != null) await transaction.CommitAsync();
        HttpConcurrency.SetETag(Response, project.RowVersion);
        return Ok(new { message = "Project created.", project.Id, project.RowVersion });
    }

    [HttpPut("projects/{id}")]
    public async Task<ActionResult> UpdateProject(int id, UpdateProjectRequest req)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project == null) return NotFound(new { message = "Project not found." });
        if (!CanManageProject(project)) return Forbid();
        if (project.ManagerId != req.ManagerId && !CanAdministerProjects()) return Forbid();
        var validation = await ValidateProjectConfiguration(
            req.ManagerId, req.ApprovalRoute, req.DelegateEmployeeId);
        if (validation.Error != null) return BadRequest(new { message = validation.Error });
        HttpConcurrency.RequireIfMatch(Request, _db, project);

        var projectDelegations = await _db.ApprovalDelegates
            .Where(d => d.ProjectId == project.Id)
            .ToListAsync();
        ApprovalDelegate? selectedDelegation = null;
        if (validation.DelegateEmployee != null)
        {
            selectedDelegation = projectDelegations.FirstOrDefault(d =>
                d.ManagerId == req.ManagerId &&
                d.DelegateId == validation.DelegateEmployee.Id);
            if (selectedDelegation == null)
            {
                selectedDelegation = new ApprovalDelegate
                {
                    ManagerId = req.ManagerId,
                    ProjectId = project.Id,
                    DelegateId = validation.DelegateEmployee.Id
                };
                _db.ApprovalDelegates.Add(selectedDelegation);
            }
        }

        foreach (var delegation in projectDelegations.Where(d => d != selectedDelegation))
            _db.SoftDelete(delegation, GetUserId());

        project.Name = req.Name.Trim();
        project.ManagerId = req.ManagerId;
        project.ApprovalRoute = validation.Route;
        project.ApprovalDelegateId = null;
        project.ApprovalDelegate = selectedDelegation;
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, project.RowVersion);
        return Ok(new { message = "Project updated.", project.RowVersion });
    }

    [HttpPost("teams")]
    public async Task<ActionResult> CreateTeam(CreateTeamRequest req)
    {
        var validation = await ValidateTeamConfiguration(req.ProjectId, req.LeadId);
        if (validation.Error != null) return BadRequest(new { message = validation.Error });
        if (!CanManageProject(validation.Project!)) return Forbid();

        var team = new Team
        {
            Name = req.Name.Trim(),
            ProjectId = req.ProjectId,
            LeadId = req.LeadId
        };
        team.EmployeeTeams.Add(new EmployeeTeam { EmployeeId = team.LeadId });
        await EnsureEmployeeProjectMembership(team.LeadId, team.ProjectId);
        _db.Teams.Add(team);
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, team.RowVersion);
        return Ok(new { message = "Team created.", team.Id, team.RowVersion });
    }

    [HttpPut("teams/{id}")]
    public async Task<ActionResult> UpdateTeam(int id, UpdateTeamRequest req)
    {
        var team = await _db.Teams
            .Include(t => t.EmployeeTeams)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (team == null) return NotFound(new { message = "Team not found." });
        var currentProject = await _db.Projects.FindAsync(team.ProjectId);
        if (currentProject == null || !CanManageProject(currentProject)) return Forbid();

        var validation = await ValidateTeamConfiguration(req.ProjectId, req.LeadId);
        if (validation.Error != null) return BadRequest(new { message = validation.Error });
        if (!CanManageProject(validation.Project!)) return Forbid();

        if (team.ProjectId != req.ProjectId &&
            await _db.Employees.AnyAsync(e => e.PrimaryTeamId == team.Id))
        {
            return Conflict(new { message = "Change the primary team assignment for affected employees before moving this team to another project." });
        }

        HttpConcurrency.RequireIfMatch(Request, _db, team);
        team.Name = req.Name.Trim();
        team.ProjectId = req.ProjectId;
        team.LeadId = req.LeadId;
        if (!await _db.EmployeeTeams.AnyAsync(et => et.TeamId == team.Id && et.EmployeeId == team.LeadId))
            _db.EmployeeTeams.Add(new EmployeeTeam { TeamId = team.Id, EmployeeId = team.LeadId });
        foreach (var employeeId in team.EmployeeTeams.Select(et => et.EmployeeId).Append(team.LeadId).Distinct())
            await EnsureEmployeeProjectMembership(employeeId, req.ProjectId);
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
        if (!await CanManageDelegate(managerId)) return Forbid();
        var delegates = await _db.ApprovalDelegates
            .Include(d => d.Delegate)
            .Include(d => d.Project)
            .Where(d => d.ManagerId == managerId)
            .ToListAsync();

        return Ok(delegates.Select(d => new { d.Id, d.ManagerId, d.DelegateId, DelegateName = d.Delegate?.FullName, d.ProjectId, ProjectName = d.Project?.Name, IsGeneral = !d.ProjectId.HasValue, d.RowVersion }));
    }

    [HttpPost("delegates")]
    public async Task<ActionResult> AddDelegate(ApprovalDelegateRequest req, [FromQuery] int managerId)
    {
        if (!await CanManageDelegate(managerId)) return Forbid();
        if (managerId == req.DelegateId)
            return BadRequest(new { message = "A manager cannot delegate approval to themselves." });
        if (!await _db.Employees.AnyAsync(e => e.Id == req.DelegateId && e.Status != "Inactive" && e.Status != "Separated"))
            return BadRequest(new { message = "Select an active employee as delegate." });
        if (req.ProjectId.HasValue && !await _db.Projects.AnyAsync(p => p.Id == req.ProjectId && p.ManagerId == managerId))
            return BadRequest(new { message = "The selected project is not managed by this manager." });

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
        if (!await CanManageDelegate(d.ManagerId)) return Forbid();
        if (await _db.Projects.AnyAsync(p => p.ApprovalDelegateId == id))
            return Conflict(new { message = "This delegate is assigned as a project approver. Change the project approval route before removing the delegate." });
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
            et.Team.Lead?.FullName ?? "", et.Team.RowVersion,
            et.Team.Project?.ManagerId, et.Team.Project?.Manager?.FullName
        )).ToList();
        var projectMemberships = e.EmployeeProjects
            .Where(ep => ep.Project != null)
            .OrderByDescending(ep => ep.IsPrimary)
            .ThenBy(ep => ep.Project!.Name)
            .ToList();
        var primaryProjectMembership = projectMemberships.FirstOrDefault(ep => ep.IsPrimary);

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
            primaryProjectMembership?.Project == null
                ? null
                : MapEmployeeProject(primaryProjectMembership.Project),
            primaryProjectMembership?.ProjectId,
            projectMemberships.Select(ep => MapEmployeeProject(ep.Project!)).ToList(),
            e.PrimaryTeam != null
                ? new TeamDto(e.PrimaryTeam.Id, e.PrimaryTeam.Name,
                    e.PrimaryTeam.ProjectId, e.PrimaryTeam.Project?.Name ?? "",
                    e.PrimaryTeam.LeadId, e.PrimaryTeam.Lead?.FullName ?? "", e.PrimaryTeam.RowVersion,
                    e.PrimaryTeam.Project?.ManagerId, e.PrimaryTeam.Project?.Manager?.FullName)
                : null,
            e.PrimaryTeamId,
            teams,
            e.LeaveBalances.Select(lb => new LeaveBalanceDto(
                lb.Id, lb.LeaveTypeId, lb.LeaveType?.Name ?? "",
                lb.AllocatedLeaves, lb.UsedLeaves, lb.RemainingLeaves
            )).ToList(),
            GetConfiguredApproverName(primaryProjectMembership?.Project, e.PrimaryTeam),
            e.RowVersion
        );
    }

    private static EmployeeProjectDto MapEmployeeProject(Project project) => new(
        project.Id, project.Name, project.ManagerId, project.Manager?.FullName,
        project.ApprovalRoute.ToString(), project.ApprovalDelegateId,
        project.ApprovalDelegate?.DelegateId,
        project.ApprovalDelegate?.Delegate?.FullName);

    private static ProjectDto MapProject(Project p)
    {
        return new ProjectDto(p.Id, p.Name,
            p.Teams.Select(t => new TeamDto(
                t.Id, t.Name, p.Id, p.Name, t.LeadId, t.Lead?.FullName ?? "", t.RowVersion,
                p.ManagerId, p.Manager?.FullName
            )).ToList(),
            p.RowVersion, p.ManagerId, p.Manager?.FullName,
            p.ApprovalRoute.ToString(), p.ApprovalDelegateId,
            p.ApprovalDelegate?.DelegateId,
            p.ApprovalDelegate?.Delegate?.FullName
        );
    }

    private static string? GetConfiguredApproverName(Project? project, Team? primaryTeam)
    {
        if (project == null) return null;
        return project.ApprovalRoute switch
        {
            ProjectApprovalRoute.TeamLead => primaryTeam?.Lead?.FullName,
            ProjectApprovalRoute.Delegate => project.ApprovalDelegate?.Delegate?.FullName,
            _ => project.Manager?.FullName
        } ?? project.Manager?.FullName ?? primaryTeam?.Lead?.FullName;
    }

    private async Task<bool> IsEligibleProjectManager(int employeeId)
    {
        return await _db.Employees
            .Include(e => e.Role)
            .AnyAsync(e => e.Id == employeeId &&
                e.Status != "Inactive" && e.Status != "Separated" &&
                (e.Role!.Name == "Manager" || e.Role.Name == "ManagerL2" ||
                 e.Role.Name == "OrganizationHead"));
    }

    private async Task<string?> ValidateEmployeeAssignments(
        int primaryProjectId,
        int primaryTeamId,
        IEnumerable<int> projectIds,
        IEnumerable<int> teamIds)
    {
        var distinctProjectIds = projectIds.Distinct().ToList();
        var distinctTeamIds = teamIds.Distinct().ToList();

        if (!distinctProjectIds.Contains(primaryProjectId))
            return "The primary project must also be included in the employee's project memberships.";
        if (!distinctTeamIds.Contains(primaryTeamId))
            return "The primary team must also be included in the employee's team memberships.";

        var existingProjectCount = await _db.Projects.CountAsync(project => distinctProjectIds.Contains(project.Id));
        if (existingProjectCount != distinctProjectIds.Count)
            return "One or more selected projects do not exist.";

        var selectedTeams = await _db.Teams
            .Where(team => distinctTeamIds.Contains(team.Id))
            .Select(team => new { team.Id, team.ProjectId })
            .ToListAsync();
        if (selectedTeams.Count != distinctTeamIds.Count)
            return "One or more selected teams do not exist.";
        if (selectedTeams.Any(team => !distinctProjectIds.Contains(team.ProjectId)))
            return "Every selected team must belong to one of the employee's selected projects.";

        var primaryTeam = selectedTeams.First(team => team.Id == primaryTeamId);
        return primaryTeam.ProjectId == primaryProjectId
            ? null
            : "The primary team must belong to the employee's primary project.";
    }

    private async Task<(ProjectApprovalRoute Route, Employee? DelegateEmployee, string? Error)>
        ValidateProjectConfiguration(int managerId, string approvalRoute, int? delegateEmployeeId)
    {
        if (!await IsEligibleProjectManager(managerId))
            return (default, null, "Select an active manager for the project.");
        if (!Enum.TryParse<ProjectApprovalRoute>(approvalRoute, true, out var route))
            return (default, null, "Approval route must be ProjectManager, TeamLead, or Delegate.");

        if (route != ProjectApprovalRoute.Delegate)
        {
            if (delegateEmployeeId.HasValue)
                return (route, null, "A delegate can only be selected for the Delegate approval route.");
            return (route, null, null);
        }

        if (!delegateEmployeeId.HasValue)
            return (route, null, "Select a delegate for the Delegate approval route.");
        if (delegateEmployeeId == managerId)
            return (route, null, "A project manager cannot delegate approval to themselves.");

        var delegateEmployee = await _db.Employees.FirstOrDefaultAsync(e =>
            e.Id == delegateEmployeeId && e.Status != "Inactive" && e.Status != "Separated");
        if (delegateEmployee == null)
            return (route, null, "Select an active employee as delegate.");

        return (route, delegateEmployee, null);
    }

    private async Task<(Project? Project, string? Error)> ValidateTeamConfiguration(int projectId, int leadId)
    {
        var project = await _db.Projects.FindAsync(projectId);
        if (project == null) return (null, "Project not found.");
        if (!project.ManagerId.HasValue) return (project, "Assign a project manager before creating teams.");
        if (!await _db.Employees.AnyAsync(e => e.Id == leadId && e.Status != "Inactive" && e.Status != "Separated"))
            return (project, "Select an active employee as team lead.");
        return (project, null);
    }

    private async Task EnsureEmployeeProjectMembership(int employeeId, int projectId)
    {
        if (await _db.EmployeeProjects.AnyAsync(ep => ep.EmployeeId == employeeId && ep.ProjectId == projectId))
            return;

        var hasPrimaryProject = await _db.EmployeeProjects.AnyAsync(ep => ep.EmployeeId == employeeId && ep.IsPrimary);
        _db.EmployeeProjects.Add(new EmployeeProject
        {
            EmployeeId = employeeId,
            ProjectId = projectId,
            IsPrimary = !hasPrimaryProject
        });
    }

}
