using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Tests;

public static class TestDbContext
{
    public static AppDbContext Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        Seed(db);
        return db;
    }

    private static void Seed(AppDbContext db)
    {
        var utc = new DateTime(2026, 7, 15, 0, 0, 0, DateTimeKind.Utc);

        db.OrganizationRoles.AddRange(
            new OrganizationRole { Id = 1, Name = "Employee", Importance = 100 },
            new OrganizationRole { Id = 2, Name = "TeamLead", Label = "Team Lead", Importance = 200 },
            new OrganizationRole { Id = 3, Name = "HR", Label = "HR L1", Importance = 300 },
            new OrganizationRole { Id = 5, Name = "Manager", Label = "Technical Manager L1", Importance = 400 },
            new OrganizationRole { Id = 6, Name = "OrganizationHead", Label = "Organization Head", Importance = 600 },
            new OrganizationRole { Id = 7, Name = "HRL2", Label = "HR L2", Importance = 500 }
        );

        db.Employees.AddRange(
            new Employee { Id = 1, EmployeeCode = "EMP-001", FullName = "Preeti Patil", Email = "preeti.patil@relisofttechnologies.com", Department = "HR", Designation = "HR Lead", RoleId = 7, CreatedOn = utc },
            new Employee { Id = 2, EmployeeCode = "EMP-002", FullName = "Rakesh Patil", Email = "rakesh.patil@relisofttechnologies.com", Department = "Management", Designation = "CEO", RoleId = 6, CreatedOn = utc },
            new Employee { Id = 3, EmployeeCode = "EMP-003", FullName = "Aradhana Shinde", Email = "aradhana.shinde@relisofttechnologies.com", Department = "Engineering", Designation = "Software Engineer", RoleId = 1, PrimaryTeamId = 1, CreatedOn = utc },
            new Employee { Id = 4, EmployeeCode = "EMP-004", FullName = "Maya Manager", Email = "maya.manager@relisofttechnologies.com", Department = "Engineering", Designation = "Project Manager", RoleId = 5, CreatedOn = utc },
            new Employee { Id = 5, EmployeeCode = "EMP-005", FullName = "Tara Lead", Email = "tara.lead@relisofttechnologies.com", Department = "Engineering", Designation = "Team Lead", RoleId = 2, CreatedOn = utc },
            new Employee { Id = 6, EmployeeCode = "EMP-006", FullName = "Dev Delegate", Email = "dev.delegate@relisofttechnologies.com", Department = "Engineering", Designation = "Senior Engineer", RoleId = 1, CreatedOn = utc }
        );

        db.Projects.Add(new Project { Id = 1, Name = "Test Project", ManagerId = 4, CreatedOn = utc });
        db.Teams.Add(new Team { Id = 1, Name = "Test Team", ProjectId = 1, LeadId = 5, ApprovalRoute = TeamApprovalRoute.ProjectManager, CreatedOn = utc });
        db.EmployeeTeams.AddRange(
            new EmployeeTeam { Id = 1, EmployeeId = 3, TeamId = 1 },
            new EmployeeTeam { Id = 2, EmployeeId = 5, TeamId = 1 }
        );

        db.UserLogins.AddRange(
            new UserLogin { Id = 1, EmployeeId = 1, Username = "preeti", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = utc },
            new UserLogin { Id = 2, EmployeeId = 2, Username = "rakesh", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = utc },
            new UserLogin { Id = 3, EmployeeId = 3, Username = "aradhana", PasswordHash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy", CreatedOn = utc }
        );

        db.LeaveTypes.AddRange(
            new LeaveType { Id = 1, Name = "Sick/Casual Leave", SortOrder = 1, MaxConsecutiveDays = 3, RequiresAdvanceNotice = false },
            new LeaveType { Id = 2, Name = "Planned Leave", SortOrder = 2, CarryForwardPct = 50, MaxConsecutiveDays = 15, RequiresAdvanceNotice = true, AdvanceNoticeDays = 3 }
        );

        db.HrPolicies.Add(new HrPolicy { Id = 1, AllowHalfDayLeave = false, UpdatedOn = utc });

        db.SaveChanges();
    }
}
