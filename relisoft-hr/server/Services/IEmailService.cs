namespace RelisoftHR.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, string? cc = null);
    Task SendEmailWithAttachmentAsync(string to, string subject, string body, byte[] attachmentBytes, string attachmentFileName, string? cc = null, string? mimeType = "application/pdf");
}