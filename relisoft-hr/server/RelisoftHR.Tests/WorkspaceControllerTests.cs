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
