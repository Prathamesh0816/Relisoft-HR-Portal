using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public static class DemoDataSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Projects.AnyAsync())
            return;

        var utc = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(DateTime.Today);

        // 1. Projects
        var proj1 = new Project { Name = "Relisoft HR Portal", ManagerId = 2, CreatedOn = utc };
        var proj2 = new Project { Name = "Client ERP Integration", ManagerId = 2, CreatedOn = utc };
        db.Projects.AddRange(proj1, proj2);
        await db.SaveChangesAsync();

        // 2. Teams
        var team1 = new Team { Name = "Frontend", ProjectId = proj1.Id, LeadId = 3, CreatedOn = utc };
        var team2 = new Team { Name = "Backend", ProjectId = proj1.Id, LeadId = 3, CreatedOn = utc };
        var team3 = new Team { Name = "QA", ProjectId = proj1.Id, LeadId = 3, CreatedOn = utc };
        var team4 = new Team { Name = "Integration", ProjectId = proj2.Id, LeadId = 2, CreatedOn = utc };
        db.Teams.AddRange(team1, team2, team3, team4);
        await db.SaveChangesAsync();

        // 3. EmployeeTeam assignments
        db.EmployeeTeams.AddRange(
            new EmployeeTeam { EmployeeId = 1, TeamId = team2.Id },
            new EmployeeTeam { EmployeeId = 2, TeamId = team4.Id },
            new EmployeeTeam { EmployeeId = 3, TeamId = team1.Id },
            new EmployeeTeam { EmployeeId = 3, TeamId = team2.Id }
        );
        db.EmployeeProjects.AddRange(
            new EmployeeProject { EmployeeId = 1, ProjectId = proj1.Id, IsPrimary = true, AssignedOn = utc },
            new EmployeeProject { EmployeeId = 2, ProjectId = proj2.Id, IsPrimary = true, AssignedOn = utc },
            new EmployeeProject { EmployeeId = 3, ProjectId = proj1.Id, IsPrimary = true, AssignedOn = utc }
        );
        await db.SaveChangesAsync();

        // 4. Update employees with primary team
        var emp1 = await db.Employees.FindAsync(1);
        var emp2 = await db.Employees.FindAsync(2);
        var emp3 = await db.Employees.FindAsync(3);
        if (emp1 != null) emp1.PrimaryTeamId = team2.Id;
        if (emp2 != null) emp2.PrimaryTeamId = team4.Id;
        if (emp3 != null) emp3.PrimaryTeamId = team1.Id;
        await db.SaveChangesAsync();

        // 5. EmployeeLeaveBalances
        db.EmployeeLeaveBalances.AddRange(
            new EmployeeLeaveBalance { EmployeeId = 1, LeaveTypeId = 1, AllocatedLeaves = 12, UsedLeaves = 3, RemainingLeaves = 9 },
            new EmployeeLeaveBalance { EmployeeId = 1, LeaveTypeId = 2, AllocatedLeaves = 20, UsedLeaves = 5, RemainingLeaves = 15 },
            new EmployeeLeaveBalance { EmployeeId = 1, LeaveTypeId = 6, AllocatedLeaves = 5, UsedLeaves = 1, RemainingLeaves = 4 },
            new EmployeeLeaveBalance { EmployeeId = 2, LeaveTypeId = 1, AllocatedLeaves = 12, UsedLeaves = 2, RemainingLeaves = 10 },
            new EmployeeLeaveBalance { EmployeeId = 2, LeaveTypeId = 2, AllocatedLeaves = 20, UsedLeaves = 8, RemainingLeaves = 12 },
            new EmployeeLeaveBalance { EmployeeId = 3, LeaveTypeId = 1, AllocatedLeaves = 12, UsedLeaves = 1, RemainingLeaves = 11 },
            new EmployeeLeaveBalance { EmployeeId = 3, LeaveTypeId = 2, AllocatedLeaves = 20, UsedLeaves = 2, RemainingLeaves = 18 }
        );
        await db.SaveChangesAsync();

        // 6. LeaveApplications – demo applications
        db.LeaveApplications.AddRange(
            new LeaveApplication
            {
                EmployeeId = 3, LeaveTypeId = 1, FromDate = new DateTime(today.Year, 7, 20, 0, 0, 0, DateTimeKind.Utc),
                ToDate = new DateTime(today.Year, 7, 20, 0, 0, 0, DateTimeKind.Utc), TotalDays = 1, Reason = "Not feeling well",
                Status = "Pending", ApproverId = 2, ProjectManagerId = 2, ApproverName = "Rakesh Patil", AppliedOn = utc.AddDays(-2), CanCancel = true
            },
            new LeaveApplication
            {
                EmployeeId = 3, LeaveTypeId = 2, FromDate = new DateTime(today.Year, 8, 10, 0, 0, 0, DateTimeKind.Utc),
                ToDate = new DateTime(today.Year, 8, 12, 0, 0, 0, DateTimeKind.Utc), TotalDays = 3, Reason = "Family function",
                Status = "Approved", ApproverId = 2, ProjectManagerId = 2, ApproverName = "Rakesh Patil", AppliedOn = utc.AddDays(-10),
                ActionedOn = utc.AddDays(-8), ApprovalReason = "Approved", CanCancel = false
            },
            new LeaveApplication
            {
                EmployeeId = 1, LeaveTypeId = 2, FromDate = new DateTime(today.Year, 9, 5, 0, 0, 0, DateTimeKind.Utc),
                ToDate = new DateTime(today.Year, 9, 7, 0, 0, 0, DateTimeKind.Utc), TotalDays = 3, Reason = "Personal work",
                Status = "Pending", ApproverId = 2, ProjectManagerId = 2, ApproverName = "Rakesh Patil", AppliedOn = utc, CanCancel = true
            }
        );
        await db.SaveChangesAsync();

        // 7. EmployeeTickets – demo tickets
        db.EmployeeTickets.AddRange(
            new EmployeeTicket
            {
                EmployeeId = 3, Category = "HR Related", RequestType = "Document Request",
                Subject = "Request for experience letter", Description = "Need a copy of my experience letter for reference.",
                Status = "Submitted", AssignedHrId = 1, AssignedHrName = "Preeti Patil", CreatedOn = utc.AddDays(-3)
            },
            new EmployeeTicket
            {
                EmployeeId = 3, Category = "Assets Related", RequestType = "Device Issue",
                Subject = "Laptop performance issue", Description = "My laptop is running very slow during builds.",
                Status = "Submitted", AssignedHrId = 1, AssignedHrName = "Preeti Patil", CreatedOn = utc.AddDays(-1)
            },
            new EmployeeTicket
            {
                EmployeeId = 1, Category = "General", RequestType = "Facility Issue",
                Subject = "AC not working in cabin", Description = "The air conditioning in cabin B-203 is not cooling.",
                Status = "In Progress", AssignedHrId = 1, AssignedHrName = "Preeti Patil", CreatedOn = utc.AddDays(-5), UpdatedOn = utc.AddDays(-3)
            }
        );
        await db.SaveChangesAsync();

        // 8. Timeline events for tickets
        var tickets = await db.EmployeeTickets.ToListAsync();
        foreach (var t in tickets)
        {
            db.EmployeeTicketTimelineEvents.Add(
                new EmployeeTicketTimelineEvent
                {
                    TicketId = t.Id,
                    Status = t.Status,
                    Notes = t.Status == "Submitted" ? "Ticket created" : "Ticket updated to " + t.Status,
                    CreatedOn = t.CreatedOn
                }
            );
        }
        await db.SaveChangesAsync();

        // 9. Additional employees (checked individually so they survive re-seed)
        if (!await db.Employees.AnyAsync(e => e.Id == 4))
        {
            var hash = "$2a$11$1OmqZ7Lg1.9.5dC2qwF3He4EDiSghkDr94W1CrHjxUML9COevlnhy"; // "password"
            db.Employees.AddRange(
                new Employee { Id = 4, EmployeeCode = "EMP-004", FullName = "Arif Nadeem Mirza", Email = "arif.nadeem.mirza@relisofttechnologies.com", Department = "Data Operations", Designation = "Technical Manager L2", JobRole = "Technical Delivery", EmploymentType = "Full-time", Location = "Pune", JoinDate = new DateTime(2025, 6, 12), RoleId = 8, CreatedOn = utc },
                new Employee { Id = 5, EmployeeCode = "EMP-005", FullName = "Girish Patil", Email = "girish.patil@relisofttechnologies.com", Department = "Data Operations", Designation = "Technical Manager L2", JobRole = "Technical Delivery", EmploymentType = "Full-time", Location = "Bengaluru", JoinDate = new DateTime(2025, 8, 20), RoleId = 8, CreatedOn = utc },
                new Employee { Id = 6, EmployeeCode = "EMP-006", FullName = "Shreerang Joshi", Email = "shreerang.joshi@relisofttechnologies.com", Department = "Quality Engineering", Designation = "Technical Manager L1", JobRole = "Quality Lead (All Areas)", EmploymentType = "Full-time", Location = "Pune", JoinDate = new DateTime(2024, 11, 1), RoleId = 5, CreatedOn = utc },
                new Employee { Id = 7, EmployeeCode = "EMP-007", FullName = "Prathamesh Katikar", Email = "prathamesh.katikar@relisofttechnologies.com", Department = "Quality Engineering", Designation = "Quality Engineer", JobRole = "Quality Engineer (TLM / LQM)", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2026, 3, 1), RoleId = 1, CreatedOn = utc },
                new Employee { Id = 8, EmployeeCode = "EMP-008", FullName = "Super HR", Email = "hr@relisofttechnologies.com", Department = "HR", Designation = "Super HR", JobRole = "Super HR", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2024, 6, 1), RoleId = 7, CreatedOn = utc },
                new Employee { Id = 9, EmployeeCode = "EMP-009", FullName = "Unnati Gawali", Email = "unnati.gawali@relisofttechnologies.com", Department = "HR", Designation = "HR Executive", JobRole = "HR Executive", EmploymentType = "Full-time", Location = "Mumbai", JoinDate = new DateTime(2025, 9, 1), RoleId = 3, CreatedOn = utc }
            );
            await db.SaveChangesAsync();

            db.UserLogins.AddRange(
                new UserLogin { Id = 4, EmployeeId = 4, Username = "arif", PasswordHash = hash, CreatedOn = utc },
                new UserLogin { Id = 5, EmployeeId = 5, Username = "girish", PasswordHash = hash, CreatedOn = utc },
                new UserLogin { Id = 6, EmployeeId = 6, Username = "shreerang", PasswordHash = hash, CreatedOn = utc },
                new UserLogin { Id = 7, EmployeeId = 7, Username = "prathamesh", PasswordHash = hash, CreatedOn = utc },
                new UserLogin { Id = 8, EmployeeId = 8, Username = "hr", PasswordHash = hash, CreatedOn = utc },
                new UserLogin { Id = 9, EmployeeId = 9, Username = "unnati", PasswordHash = hash, CreatedOn = utc }
            );
            await db.SaveChangesAsync();
        }
    }
}
