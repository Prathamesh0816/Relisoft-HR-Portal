using System.Net.Mail;
using System.Net;

namespace RelisoftHR.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _config;

    public EmailService(ILogger<EmailService> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body, string? cc = null)
    {
        var smtpHost = _config["Email:SmtpHost"];
        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogInformation("[EMAIL-DEV] To: {To}, Subject: {Subject}, CC: {Cc}", to, subject, cc ?? "none");
            return;
        }

        try
        {
            using var client = new SmtpClient(smtpHost)
            {
                Port = int.Parse(_config["Email:SmtpPort"] ?? "587"),
                Credentials = new NetworkCredential(
                    _config["Email:Username"],
                    _config["Email:Password"]),
                EnableSsl = bool.Parse(_config["Email:EnableSsl"] ?? "true")
            };

            var from = _config["Email:From"] ?? "noreply@relisofttechnologies.com";
            using var msg = new MailMessage(from, to, subject, body) { IsBodyHtml = true };
            if (!string.IsNullOrEmpty(cc))
                msg.CC.Add(cc);

            await client.SendMailAsync(msg);
            _logger.LogInformation("[EMAIL-SENT] To: {To}, Subject: {Subject}", to, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EMAIL-FAILED] To: {To}, Subject: {Subject}", to, subject);
        }
    }
}