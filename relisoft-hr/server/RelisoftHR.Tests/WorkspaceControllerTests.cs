using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Controllers;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Tests;

public class WorkspaceControllerTests : IDisposable
{
    private readonly AppDbContext _db = TestDbContext.Create();

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task CreateEmployee_PersistsMultipleProjectsAndOnePrimaryProject()
    {
        _db.Projects.Add(new Project { Id = 2, Name = "Second Project", ManagerId = 4 });
        _db.Teams.Add(new Team { Id = 2, Name = "Second Team", ProjectId = 2, LeadId = 5 });
        await _db.SaveChangesAsync();

        var controller = new WorkspaceController(_db);
        var result = await controller.CreateEmployee(CreateRequest(
            primaryProjectId: 1,
            projectIds: [1, 2],
            primaryTeamId: 1,
            teamIds: [1, 2]));

        Assert.IsType<OkObjectResult>(result.Result);
        var employee = await _db.Employees
            .Include(e => e.EmployeeProjects)
            .Include(e => e.EmployeeTeams)
            .SingleAsync(e => e.EmployeeCode == "EMP-100");
        Assert.Equal(2, employee.EmployeeProjects.Count);
        Assert.Equal(1, employee.EmployeeProjects.Single(project => project.IsPrimary).ProjectId);
        Assert.Equal([1, 2], employee.EmployeeTeams.Select(team => team.TeamId).Order().ToArray());
    }

    [Fact]
    public async Task CreateEmployee_RejectsTeamOutsideSelectedProjects()
    {
        _db.Projects.Add(new Project { Id = 2, Name = "Second Project", ManagerId = 4 });
        _db.Teams.Add(new Team { Id = 2, Name = "Second Team", ProjectId = 2, LeadId = 5 });
        await _db.SaveChangesAsync();

        var controller = new WorkspaceController(_db);
        var result = await controller.CreateEmployee(CreateRequest(
            primaryProjectId: 1,
            projectIds: [1],
            primaryTeamId: 1,
            teamIds: [1, 2]));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateEmployee_RejectsBackupApproverTogetherWithSelfApproval()
    {
        var controller = new WorkspaceController(_db);

        var result = await controller.CreateEmployee(CreateRequest(
            primaryProjectId: 1,
            projectIds: [1],
            primaryTeamId: 1,
            teamIds: [1],
            backupApproverId: 6,
            allowSelfApproval: true));

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateEmployee_PersistsAndReturnsHrSelectedBackupApprover()
    {
        var controller = new WorkspaceController(_db);

        var result = await controller.CreateEmployee(CreateRequest(
            primaryProjectId: 1,
            projectIds: [1],
            primaryTeamId: 1,
            teamIds: [1],
            backupApproverId: 6));

        Assert.IsType<OkObjectResult>(result.Result);
        var employee = await _db.Employees.SingleAsync(item => item.EmployeeCode == "EMP-100");
        Assert.Equal(6, employee.BackupApproverId);
        Assert.False(employee.AllowSelfApproval);

        var workspace = Assert.IsType<WorkspaceResponse>(
            Assert.IsType<OkObjectResult>((await controller.GetWorkspace()).Result).Value);
        var dto = workspace.Employees.Single(item => item.Id == employee.Id);
        Assert.Equal(6, dto.BackupApproverId);
        Assert.Equal("Dev Delegate", dto.BackupApproverName);
    }

    [Fact]
    public async Task CreateProject_WithDelegateEmployee_CreatesProjectScopedDelegation()
    {
        var controller = CreateAdminController();

        var result = await controller.CreateProject(new CreateProjectRequest(
            "Delegated Project", 4, "Delegate", 6));

        Assert.IsType<OkObjectResult>(result);
        var project = await _db.Projects
            .Include(p => p.ApprovalDelegate)
            .SingleAsync(p => p.Name == "Delegated Project");
        Assert.Equal(ProjectApprovalRoute.Delegate, project.ApprovalRoute);
        Assert.NotNull(project.ApprovalDelegateId);
        Assert.Equal(4, project.ApprovalDelegate!.ManagerId);
        Assert.Equal(6, project.ApprovalDelegate.DelegateId);
        Assert.Equal(project.Id, project.ApprovalDelegate.ProjectId);

        var workspaceResult = await controller.GetWorkspace();
        var workspace = Assert.IsType<WorkspaceResponse>(
            Assert.IsType<OkObjectResult>(workspaceResult.Result).Value);
        var projectDto = workspace.Projects.Single(p => p.Id == project.Id);
        Assert.Equal(6, projectDto.ApprovalDelegateEmployeeId);
        Assert.Equal("Dev Delegate", projectDto.ApprovalDelegateName);
    }

    [Fact]
    public async Task CreateProject_RejectsManagerAsTheirOwnDelegate()
    {
        var controller = CreateAdminController();

        var result = await controller.CreateProject(new CreateProjectRequest(
            "Invalid Delegation", 4, "Delegate", 4));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.False(await _db.Projects.AnyAsync(p => p.Name == "Invalid Delegation"));
    }

    [Fact]
    public async Task CreateProjects_SameManagerCanHaveDifferentDelegatePerProject()
    {
        var controller = CreateAdminController();

        Assert.IsType<OkObjectResult>(await controller.CreateProject(new CreateProjectRequest(
            "Arif Project One", 4, "Delegate", 6)));
        Assert.IsType<OkObjectResult>(await controller.CreateProject(new CreateProjectRequest(
            "Arif Project Two", 4, "Delegate", 5)));

        var projects = await _db.Projects
            .Include(project => project.ApprovalDelegate)
            .Where(project => project.Name.StartsWith("Arif Project"))
            .OrderBy(project => project.Name)
            .ToListAsync();
        Assert.Equal(2, projects.Count);
        Assert.All(projects, project => Assert.Equal(4, project.ManagerId));
        Assert.Equal(6, projects[0].ApprovalDelegate?.DelegateId);
        Assert.Equal(5, projects[1].ApprovalDelegate?.DelegateId);
        Assert.NotEqual(projects[0].ApprovalDelegateId, projects[1].ApprovalDelegateId);
    }

    [Fact]
    public async Task AddDelegate_RejectsGeneralDelegateWithoutProject()
    {
        var controller = CreateAdminController();

        var result = await controller.AddDelegate(new ApprovalDelegateRequest(null, 6), managerId: 4);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateProject_ByProjectManager_IsForbidden()
    {
        var controller = CreateManagerController();

        var result = await controller.CreateProject(new CreateProjectRequest(
            "Manager Created Project", 4));

        Assert.IsType<ForbidResult>(result);
        Assert.False(await _db.Projects.AnyAsync(project => project.Name == "Manager Created Project"));
    }

    [Fact]
    public async Task UpdateProject_ByProjectManager_CannotRenameProject()
    {
        var controller = CreateManagerController();

        var result = await controller.UpdateProject(1, new UpdateProjectRequest(
            "Renamed By Manager", 4, "ProjectManager"));

        Assert.IsType<ForbidResult>(result);
        Assert.Equal("Test Project", (await _db.Projects.FindAsync(1))?.Name);
    }

    [Fact]
    public async Task DeleteTeam_ByOwningProjectManager_RemovesNonPrimaryTeam()
    {
        _db.Teams.Add(new Team
        {
            Id = 2,
            Name = "Temporary Team",
            ProjectId = 1,
            LeadId = 5,
            RowVersion = [1, 2, 3, 4, 5, 6, 7, 8]
        });
        await _db.SaveChangesAsync();
        var controller = CreateManagerController();
        controller.Request.Headers["If-Match"] = "\"AQIDBAUGBwg=\"";

        var result = await controller.DeleteTeam(2);

        Assert.IsType<OkObjectResult>(result);
        Assert.Null(await _db.Teams.FindAsync(2));
    }

    [Fact]
    public async Task GetWorkspace_WhenManagerOwnsPrimaryProject_DisplaysOrganizationalFallback()
    {
        var manager = await _db.Employees.FindAsync(4);
        Assert.NotNull(manager);
        manager.PrimaryTeamId = 1;
        _db.EmployeeProjects.Add(new EmployeeProject
        {
            EmployeeId = 4,
            ProjectId = 1,
            IsPrimary = true
        });
        _db.EmployeeTeams.Add(new EmployeeTeam { EmployeeId = 4, TeamId = 1 });
        await _db.SaveChangesAsync();

        var controller = new WorkspaceController(_db);
        var workspace = Assert.IsType<WorkspaceResponse>(
            Assert.IsType<OkObjectResult>((await controller.GetWorkspace()).Result).Value);

        var dto = workspace.Employees.Single(employee => employee.Id == 4);
        Assert.Equal("Preeti Patil", dto.ApproverName);
    }

    private WorkspaceController CreateAdminController()
    {
        var identity = new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, "1"), new Claim(ClaimTypes.Role, "HRL2")],
            "Test");
        return new WorkspaceController(_db)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            }
        };
    }

    private WorkspaceController CreateManagerController()
    {
        var identity = new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, "4"), new Claim(ClaimTypes.Role, "Manager")],
            "Test");
        return new WorkspaceController(_db)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            }
        };
    }

    private static CreateEmployeeRequest CreateRequest(
        int primaryProjectId,
        List<int> projectIds,
        int primaryTeamId,
        List<int> teamIds,
        int? backupApproverId = null,
        bool allowSelfApproval = false) => new(
            "EMP-100", "Project Member", "project.member@relisofttechnologies.com", "Engineering",
            "Engineer", "Developer", "Full-time", "Pune", null,
            new DateTime(2026, 7, 19), 1,
            primaryProjectId, primaryTeamId, projectIds, teamIds,
            backupApproverId, allowSelfApproval);
}
