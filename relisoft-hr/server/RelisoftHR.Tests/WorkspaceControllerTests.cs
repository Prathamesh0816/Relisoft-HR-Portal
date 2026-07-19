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

    private static CreateEmployeeRequest CreateRequest(
        int primaryProjectId,
        List<int> projectIds,
        int primaryTeamId,
        List<int> teamIds) => new(
            "EMP-100", "Project Member", "project.member@relisofttechnologies.com", "Engineering",
            "Engineer", "Developer", "Full-time", "Pune", null,
            new DateTime(2026, 7, 19), 1,
            primaryProjectId, primaryTeamId, projectIds, teamIds);
}
