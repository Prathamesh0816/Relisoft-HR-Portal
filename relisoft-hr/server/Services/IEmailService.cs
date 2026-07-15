namespace RelisoftHR.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, string? cc = null);
}