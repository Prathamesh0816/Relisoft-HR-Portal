using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailService _email;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext db, IConfiguration config, IEmailService email, ILogger<AuthController> logger)
    {
        _db = db;
        _config = config;
        _email = email;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await ResolveUserAsync(request.Username, includeRole: true);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        var emp = user.Employee!;
        var token = GenerateToken(emp);
        var views = GetViewsForUser(emp.Role!.Name, user.Username);

        return Ok(new LoginResponse(
            emp.Id, emp.FullName, user.Username, emp.Role.Name, emp.Role.Label,
            views, token
        ));
    }

    [HttpGet("demo-users")]
    public ActionResult<List<DemoUserDto>> GetDemoUsers()
    {
        return Ok(new List<DemoUserDto>
        {
            new("preeti", "HRL2"),
            new("rakesh", "OrganizationHead"),
            new("aradhana", "Employee")
        });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            return BadRequest(new { message = "Username is required." });

        var user = await ResolveUserAsync(request.Username);

        // Always return the same message to avoid leaking which usernames exist.
        var generic = new { message = "If that username exists, a password reset link has been sent." };

        if (user?.Employee == null) return Ok(generic);

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var expires = DateTime.UtcNow.AddMinutes(30);

        // Invalidate previous unused tokens.
        var previous = _db.PasswordResetTokens.Where(t => t.EmployeeId == user.EmployeeId && t.UsedOn == null);
        await previous.ExecuteUpdateAsync(s => s.SetProperty(t => t.ExpiresOn, DateTime.UtcNow.AddMinutes(-5)));

        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            EmployeeId = user.EmployeeId,
            Token = token,
            ExpiresOn = expires,
            RequestedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        });
        await _db.SaveChangesAsync();

        var body = EmailTemplates.PasswordReset(user.Employee.FullName, token, expires);
        var smtpConfigured = !string.IsNullOrWhiteSpace(_config["Email:SmtpHost"]);
        if (smtpConfigured)
        {
            await _email.SendEmailAsync(user.Employee.Email, "Reset your ReliSoft HR password", body);
            return Ok(generic);
        }

        // No SMTP configured: return the token so the flow is testable.
        _logger.LogInformation("[PASSWORD-RESET-DEV] {Username} -> token {Token}", request.Username, token);
        return Ok(new { message = "SMTP not configured — development reset token issued.", devToken = token, expires });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Token and new password are required." });
        if (request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        var tokenEntry = await _db.PasswordResetTokens
            .Include(t => t.Employee)
            .FirstOrDefaultAsync(t => t.Token == request.Token);

        if (tokenEntry == null || tokenEntry.UsedOn != null || tokenEntry.ExpiresOn < DateTime.UtcNow)
            return BadRequest(new { message = "This reset link is invalid or has expired. Request a new one." });

        var userLogin = await _db.UserLogins.FirstOrDefaultAsync(u => u.EmployeeId == tokenEntry.EmployeeId);
        if (userLogin == null) return NotFound(new { message = "User not found." });

        userLogin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 11);
        tokenEntry.UsedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully. You can now sign in." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var employeeIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (employeeIdClaim == null || !int.TryParse(employeeIdClaim, out var employeeId))
            return Unauthorized(new { message = "Invalid token." });

        var userLogin = await _db.UserLogins.FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
        if (userLogin == null)
            return NotFound(new { message = "User not found." });

        if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, userLogin.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        userLogin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 11);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    private const string AllowedEmailDomain = "@relisofttechnologies.com";

    private async Task<UserLogin?> ResolveUserAsync(string? identifier, bool includeRole = false)
    {
        var input = identifier?.Trim() ?? "";
        if (input.Length == 0) return null;

        var query = _db.UserLogins.AsQueryable();
        query = includeRole
            ? query.Include(u => u.Employee).ThenInclude(e => e!.Role)
            : query.Include(u => u.Employee);

        if (input.Contains('@'))
        {
            if (!input.EndsWith(AllowedEmailDomain, StringComparison.OrdinalIgnoreCase))
                return null;
            var email = input.ToLowerInvariant();
            return await query.FirstOrDefaultAsync(u => u.IsActive && u.Employee != null && u.Employee.Email.ToLower() == email);
        }

        var name = input.ToLowerInvariant();
        return await query.FirstOrDefaultAsync(u => u.IsActive && u.Username.ToLower() == name);
    }

    private string GenerateToken(Models.Employee employee)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "ReliSoft-HR-SecretKey-2026-Must-Be-32-Chars!"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, employee.Id.ToString()),
            new Claim(ClaimTypes.Name, employee.FullName),
            new Claim(ClaimTypes.Role, employee.Role?.Name ?? "Employee")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "RelisoftHR",
            audience: _config["Jwt:Audience"] ?? "RelisoftHR",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string[] GetViewsForUser(string role, string username)
    {
        // Phase 1 — Core HR: login / employee registration, leaves, tickets, onboarding & offboarding
        var phase1 = new[]
        {
            "register", "hrHome", "hrControl", "apply", "onboarding",
            "tickets", "balances", "review", "leaveReports", "overview",
            "calendar", "candidateForm", "hrOnboard", "offboard",
            "directory", "projects", "payroll", "reviews", "settings"
        };

        // Employee self-service — every employee gets the full self-service suite
        var employeeViews = new[]
        {
            "profile", "teams", "employeeDashboard", "attendance", "timesheets", "mood", "skills", "training",
            "loans", "benefits", "mentorship", "carpool", "bookings", "knowledge",
            "announcements", "surveys", "expenses", "notifications", "recruitment"
        };

        // Manager / HR admin views
        var managerViews = new[]
        {
            "assets", "visitors", "contractors", "internalMobility", "compliance", "governance",
            "dataUpload", "workforce", "resilience", "readiness", "spof", "succession",
            "skillGaps", "knowledgeConc", "whatIf", "resilienceReport", "resilienceChat"
        };

        var views = role switch
        {
            "HRL2" or "HR" => phase1
                .Append("lifecycle").Append("docsSalary").Append("analytics").Append("orgchart")
                .Append("recognition").Append("rewards")
                .Concat(employeeViews).Concat(managerViews)
                .ToArray(),
            "OrganizationHead" or "ManagerL2" or "Manager" => new[] { "overview", "review", "leaveReports", "directory", "apply", "onboarding", "tickets", "calendar", "payroll", "reviews", "settings", "lifecycle", "docsSalary", "analytics", "orgchart", "recognition", "rewards" }
                .Concat(employeeViews).Concat(managerViews)
                .ToArray(),
            "TeamLead" => new[] { "review", "leaveReports", "apply", "onboarding", "tickets", "directory", "calendar", "payroll", "reviews", "settings", "recognition", "rewards" }
                .Concat(employeeViews)
                .ToArray(),
            _ => new[] { "apply", "onboarding", "tickets", "directory", "calendar", "candidateForm", "payroll", "reviews", "settings", "recognition", "rewards" }
                .Concat(employeeViews)
                .ToArray()
        };

        // Aradhana is the employee-side demo reviewer. Keep her Employee role and
        // grant only the review capability; the leave API still limits results to
        // employees assigned to her through teams, reporting lines, or delegation.
        return username.Equals("aradhana", StringComparison.OrdinalIgnoreCase)
            ? views.Append("review").Distinct().ToArray()
            : views;
    }
}
