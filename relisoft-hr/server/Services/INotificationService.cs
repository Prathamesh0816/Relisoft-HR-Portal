namespace RelisoftHR.Services;

public interface INotificationService
{
    Task CreateNotificationAsync(int employeeId, string title, string message, string category, string? link = null);
}