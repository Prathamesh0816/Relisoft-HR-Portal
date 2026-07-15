using Microsoft.AspNetCore.Mvc;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Services;

public class NotificationHelper
{
    private readonly IEmailService _email;
    private readonly INotificationService _notif;
    private readonly AppDbContext _db;
    private readonly ILogger<NotificationHelper> _logger;

    public NotificationHelper(IEmailService email, INotificationService notif, AppDbContext db, ILogger<NotificationHelper> logger)
    {
        _email = email;
        _notif = notif;
        _db = db;
        _logger = logger;
    }

    public async Task NotifyAsync(int employeeId, string title, string message, string category,
        string? emailSubject = null, string? emailBody = null, string? emailTo = null, string? link = null)
    {
        await _notif.CreateNotificationAsync(employeeId, title, message, category, link);

        if (!string.IsNullOrEmpty(emailSubject) && !string.IsNullOrEmpty(emailBody))
        {
            var to = emailTo ?? _db.Employees.Where(e => e.Id == employeeId).Select(e => e.Email).FirstOrDefault();
            if (to != null)
                await _email.SendEmailAsync(to, emailSubject, emailBody);
        }
    }

    public async Task NotifyEmployeeAsync(int employeeId, Employee employee, string title, string message,
        string category, string? emailSubject = null, string? emailBody = null, string? link = null)
    {
        await _notif.CreateNotificationAsync(employeeId, title, message, category, link);
        if (!string.IsNullOrEmpty(emailSubject) && !string.IsNullOrEmpty(emailBody) && !string.IsNullOrEmpty(employee.Email))
            await _email.SendEmailAsync(employee.Email, emailSubject, emailBody);
    }

    public async Task NotifyEmployeesAsync(IEnumerable<(int id, string email, string name)> recipients,
        string title, string message, string category, Func<(int id, string email, string name), string>? emailSubjectFn = null,
        Func<(int id, string email, string name), string>? emailBodyFn = null)
    {
        foreach (var r in recipients)
        {
            await _notif.CreateNotificationAsync(r.id, title, message, category);
            if (emailSubjectFn != null && emailBodyFn != null && !string.IsNullOrEmpty(r.email))
                await _email.SendEmailAsync(r.email, emailSubjectFn(r), emailBodyFn(r));
        }
    }
}