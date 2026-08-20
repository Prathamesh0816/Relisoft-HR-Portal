using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public class JoinerAnnouncementService
{
    private readonly AppDbContext _db;

    public JoinerAnnouncementService(AppDbContext db) => _db = db;

    public async Task AnnounceJoinerAsync(Employee employee, int actorId)
    {
        var existing = await _db.Announcements.AnyAsync(a => a.EmployeeId == employee.Id && a.Category == "Joining");
        if (existing) return;

        var teamName = await _db.Employees
            .Where(e => e.Id == employee.Id)
            .Select(e => e.PrimaryTeam != null ? e.PrimaryTeam.Name : "")
            .FirstOrDefaultAsync();
        if (string.IsNullOrEmpty(teamName)) teamName = "the company";

        var title = $"New joiner: {employee.FullName}";
        var content = $"{employee.FullName} ({employee.Designation}) joined the {teamName} team. Please join us in welcoming {employee.FullName.Split(' ')[0]}!";

        _db.Announcements.Add(new Announcement
        {
            Title = title,
            Content = content,
            Category = "Joining",
            Priority = "High",
            CreatedById = actorId,
            CreatedOn = DateTime.UtcNow,
            EmployeeId = employee.Id
        });

        var recipients = await _db.Employees
            .Where(e => e.Id != employee.Id && e.Status == "Active")
            .Select(e => e.Id)
            .ToListAsync();
        foreach (var recipientId in recipients)
        {
            _db.Notifications.Add(new Notification
            {
                EmployeeId = recipientId,
                Title = title,
                Message = content,
                Category = "Joining",
                Link = "announcements",
                CreatedOn = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
    }
}
