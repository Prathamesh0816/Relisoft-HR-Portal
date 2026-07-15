using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(AppDbContext db, ILogger<NotificationService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task CreateNotificationAsync(int employeeId, string title, string message, string category, string? link = null)
    {
        try
        {
            _db.Notifications.Add(new Notification
            {
                EmployeeId = employeeId,
                Title = title,
                Message = message,
                Category = category,
                Link = link ?? "",
                IsRead = false,
                CreatedOn = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create notification for employee {EmployeeId}", employeeId);
        }
    }
}