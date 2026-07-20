using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await _db.UserLogins
            .Include(u => u.Employee).ThenInclude(e => e!.Role)
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        var emp = user.Employee!;
        var token = GenerateToken(emp);
        var isProjectDelegate = await _db.Projects.AnyAsync(project =>
            project.ApprovalRoute == Models.ProjectApprovalRoute.Delegate &&
            project.ApprovalDelegate != null &&
            project.ApprovalDelegate.DelegateId == emp.Id);
        var views = GetViewsForRole(emp.Role!.Name, isProjectDelegate);

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

    private string GenerateToken(Models.Employee employee)
    {
        var jwtKey = _config["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
        {
            throw new InvalidOperationException("Jwt:Key must be configured and at least 32 bytes long.");
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));
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

    private static string[] GetViewsForRole(string role, bool isProjectDelegate = false)
    {
        var common = new[] { "moodtracker", "skillsbragboard", "carpool", "bookings", "mentorship", "rewards", "expenses", "timesheets", "training", "loans", "shifts", "visitors", "surveys", "benefits", "notifications", "internalMobility", "compliance", "contractors", "resilienceDashboard", "workforceEmployees", "whatIfSimulator", "spofAnalysis", "skillGapAnalysis", "successionPlanning", "knowledgeConcentration", "workforceReadiness", "resilienceReport", "dataUpload", "resilienceAiChat", "governancePanel" };
        var views = role switch
        {
            "HRL2" or "HR" => new[] { "hrHome", "hrControl", "apply", "onboarding", "tickets",
                               "register", "projects", "balances", "directory", "review", "overview",
                               "calendar", "orgchart", "candidateForm", "hrOnboard", "offboard", "assets", "lifecycle", "hrdocs",
                               "dashboard", "analytics", "attendance", "announcements", "knowledgebase" }
                               .Concat(common).ToArray(),
            "OrganizationHead" or "ManagerL2" or "Manager" => new[] { "overview", "review", "projects", "directory", "apply", "onboarding",
                                                                  "tickets", "calendar", "orgchart", "dashboard", "attendance", "announcements", "knowledgebase" }
                                                                  .Concat(common).ToArray(),
            "TeamLead" => new[] { "review", "apply", "onboarding", "tickets", "directory", "calendar", "dashboard", "attendance", "announcements", "knowledgebase" }
                           .Concat(common).ToArray(),
            _ => new[] { "apply", "onboarding", "tickets", "directory", "calendar", "candidateForm", "dashboard", "attendance", "knowledgebase" }
                  .Concat(common).ToArray()
        };
        return isProjectDelegate && !views.Contains("review")
            ? views.Prepend("review").ToArray()
            : views;
    }
}
