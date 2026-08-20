using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.Security.Claims;

namespace RelisoftHR.Controllers;

[ApiController]
[Authorize]
[Route("api/recognition")]
public class RecognitionController : ControllerBase
{
    private static readonly string[] AdminRoles = { "HRL2", "HR", "Admin", "SuperAdmin" };
    private static readonly string[] LeaderRoles = { "HRL2", "HR", "Admin", "SuperAdmin", "Manager", "ManagerL2", "OrganizationHead" };

    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;

    public RecognitionController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    // ────── Kudos ──────

    [HttpGet("kudos")]
    public async Task<ActionResult> GetKudos([FromQuery] int? receivedBy, [FromQuery] int? givenBy)
    {
        var query = _db.Kudos.AsNoTracking()
            .Include(k => k.Giver)
            .Include(k => k.Receiver)
            .AsQueryable();
        if (receivedBy.HasValue) query = query.Where(k => k.ReceiverEmployeeId == receivedBy.Value);
        if (givenBy.HasValue) query = query.Where(k => k.GiverEmployeeId == givenBy.Value);
        var list = await query.OrderByDescending(k => k.CreatedOn).ToListAsync();
        return Ok(list.Select(MapKudos).ToList());
    }

    [HttpPost("kudos")]
    public async Task<ActionResult> GiveKudos([FromBody] KudosRequest req)
    {
        var giverId = GetUserId();
        if (giverId == 0) return Unauthorized();
        if (req.ReceiverEmployeeId <= 0 || req.ReceiverEmployeeId == giverId)
            return BadRequest(new { message = "You cannot send kudos to yourself." });
        if (string.IsNullOrWhiteSpace(req.Category))
            return BadRequest(new { message = "A recognition category is required." });

        var receiver = await _db.Employees.FindAsync(req.ReceiverEmployeeId);
        if (receiver == null) return NotFound(new { message = "Employee not found." });

        var points = req.Points > 0 ? Math.Min(req.Points, 50) : 10;

        _db.Kudos.Add(new Kudos
        {
            GiverEmployeeId = giverId,
            ReceiverEmployeeId = req.ReceiverEmployeeId,
            Category = req.Category.Trim(),
            Message = req.Message?.Trim() ?? "",
            Points = points
        });
        await _db.SaveChangesAsync();

        await AwardPointsAsync(receiver, points, "Earned", $"Kudos from {await GetEmployeeNameAsync(giverId)}: {req.Category}", "/rewards");

        var giver = await _db.Employees.FindAsync(giverId);
        return Ok(new { message = $"Kudos sent to {receiver.FullName} (+{points} points)" });
    }

    // ────── Awards ──────

    [HttpGet("awards")]
    public async Task<ActionResult> GetAwards()
    {
        var awards = await _db.RecognitionAwards
            .Include(a => a.Recipients).ThenInclude(r => r.Employee)
            .Include(a => a.Recipients).ThenInclude(r => r.AwardedBy)
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedOn)
            .ToListAsync();
        return Ok(awards.Select(MapAward).ToList());
    }

    [HttpGet("awards/{id}")]
    public async Task<ActionResult> GetAward(int id)
    {
        var award = await _db.RecognitionAwards
            .Include(a => a.Recipients).ThenInclude(r => r.Employee)
            .Include(a => a.Recipients).ThenInclude(r => r.AwardedBy)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);
        if (award == null) return NotFound();
        return Ok(MapAward(award));
    }

    [HttpPost("awards")]
    public async Task<ActionResult> CreateAward([FromBody] RecognitionAwardRequest req)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Award title is required." });
        if (string.IsNullOrWhiteSpace(req.Scope)) return BadRequest(new { message = "Scope is required (Monthly, Quarterly, Annual, FunFriday)." });

        var award = new RecognitionAward
        {
            Title = req.Title.Trim(),
            Description = req.Description?.Trim() ?? "",
            Category = string.IsNullOrWhiteSpace(req.Category) ? "Individual" : req.Category.Trim(),
            Scope = req.Scope.Trim(),
            PeriodLabel = req.PeriodLabel?.Trim() ?? "",
            ImageUrl = req.ImageUrl?.Trim() ?? "",
            AwardPoints = req.AwardPoints > 0 ? req.AwardPoints : 100,
            CreatedByEmployeeId = GetUserId()
        };
        _db.RecognitionAwards.Add(award);
        await _db.SaveChangesAsync();
        return Ok(new { award.Id, message = "Award created." });
    }

    [HttpPost("awards/{id}/recipients")]
    public async Task<ActionResult> AwardRecipients(int id, [FromBody] AwardRecipientsRequest req)
    {
        if (!await HasRoleAsync(LeaderRoles)) return Forbid();
        var award = await _db.RecognitionAwards.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        if (award == null) return NotFound();
        if (req.Recipients == null || req.Recipients.Count == 0)
            return BadRequest(new { message = "Provide at least one recipient." });

        var awardedById = GetUserId();
        var awardedBy = await _db.Employees.FindAsync(awardedById);
        var added = new List<string>();
        foreach (var r in req.Recipients)
        {
            if (r.EmployeeId <= 0) continue;
            var employee = await _db.Employees.FindAsync(r.EmployeeId);
            if (employee == null) continue;
            var type = string.IsNullOrWhiteSpace(r.RecognitionType) ? award.Category : r.RecognitionType.Trim();
            _db.RecognitionAwardRecipients.Add(new RecognitionAwardRecipient
            {
                AwardId = award.Id,
                EmployeeId = r.EmployeeId,
                TeamName = string.IsNullOrWhiteSpace(r.TeamName) ? null : r.TeamName.Trim(),
                RecognitionType = type,
                Reason = r.Reason?.Trim() ?? "",
                AwardedByEmployeeId = awardedById
            });
            await AwardPointsAsync(employee, award.AwardPoints, "Earned", $"Award: {award.Title}", "/recognition");
            added.Add(employee.FullName);
        }
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Awarded {award.Title} to {added.Count} recipient(s)." });
    }

    // ────── Fun Friday ──────

    [HttpGet("fun-friday")]
    public async Task<ActionResult> GetFunFriday()
    {
        var list = await _db.FunFridayCelebrations
            .Include(f => f.CreatedBy)
            .AsNoTracking()
            .OrderByDescending(f => f.CelebrationDate)
            .ToListAsync();
        return Ok(list.Select(f => new
        {
            f.Id, f.Title, f.Description, f.ImageUrl, f.CelebrationDate, f.CreatedOn,
            CreatedByName = f.CreatedBy?.FullName
        }).ToList());
    }

    [HttpPost("fun-friday")]
    public async Task<ActionResult> CreateFunFriday([FromBody] FunFridayRequest req)
    {
        if (!await HasRoleAsync(AdminRoles)) return Forbid();
        if (string.IsNullOrWhiteSpace(req.Title)) return BadRequest(new { message = "Title is required." });

        var celebration = new FunFridayCelebration
        {
            Title = req.Title.Trim(),
            Description = req.Description?.Trim() ?? "",
            ImageUrl = req.ImageUrl?.Trim() ?? "",
            CelebrationDate = req.CelebrationDate ?? DateTime.UtcNow,
            CreatedByEmployeeId = GetUserId()
        };
        _db.FunFridayCelebrations.Add(celebration);
        await _db.SaveChangesAsync();
        return Ok(new { celebration.Id, message = "Fun Friday celebration created." });
    }

    // ────── Leaderboard ──────

    [HttpGet("leaderboard")]
    public async Task<ActionResult> GetLeaderboard()
    {
        var accounts = await _db.RewardPointsAccounts.AsNoTracking().ToListAsync();
        var kudosCounts = await _db.Kudos.AsNoTracking()
            .GroupBy(k => k.ReceiverEmployeeId)
            .Select(g => new { EmployeeId = g.Key, Count = g.Count(), Sum = g.Sum(k => k.Points) })
            .ToListAsync();
        var employeeIds = accounts.Select(a => a.EmployeeId)
            .Concat(kudosCounts.Select(k => k.EmployeeId)).Distinct().ToList();
        var employees = await _db.Employees.AsNoTracking()
            .Where(e => employeeIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id);

        var rows = employeeIds.Select(id =>
        {
            var account = accounts.FirstOrDefault(a => a.EmployeeId == id);
            var kudos = kudosCounts.FirstOrDefault(k => k.EmployeeId == id);
            return new
            {
                EmployeeId = id,
                EmployeeName = employees.TryGetValue(id, out var e) ? e.FullName : "Unknown",
                Designation = employees.TryGetValue(id, out var ee) ? ee.Designation : "",
                Balance = account?.Balance ?? 0,
                LifetimeEarned = account?.LifetimeEarned ?? kudos?.Sum ?? 0,
                KudosReceived = kudos?.Count ?? 0
            };
        })
        .OrderByDescending(r => r.LifetimeEarned)
        .Take(20)
        .ToList();

        return Ok(rows);
    }

    // ────── Helpers ──────

    private static object MapKudos(Kudos k) => new
    {
        k.Id, k.Category, k.Message, k.Points, k.CreatedOn,
        GiverId = k.GiverEmployeeId,
        GiverName = k.Giver?.FullName,
        ReceiverId = k.ReceiverEmployeeId,
        ReceiverName = k.Receiver?.FullName
    };

    private static object MapAward(RecognitionAward a) => new
    {
        a.Id, a.Title, a.Description, a.Category, a.Scope, a.PeriodLabel, a.ImageUrl, a.AwardPoints, a.CreatedOn,
        CreatedByName = a.CreatedBy?.FullName,
        Recipients = a.Recipients.Select(r => new
        {
            r.Id, r.EmployeeId, EmployeeName = r.Employee?.FullName,
            r.TeamName, r.RecognitionType, r.Reason, r.AwardedOn,
            AwardedByName = r.AwardedBy?.FullName
        }).ToList()
    };

    private async Task AwardPointsAsync(Employee employee, int points, string type, string reference, string link)
    {
        if (points <= 0) return;
        var account = await _db.RewardPointsAccounts
            .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        if (account == null)
        {
            account = new RewardPointsAccount { EmployeeId = employee.Id, Balance = points, LifetimeEarned = points };
            _db.RewardPointsAccounts.Add(account);
        }
        else
        {
            account.Balance += points;
            account.LifetimeEarned += points;
        }
        account.LastUpdated = DateTime.UtcNow;
        _db.RewardTransactions.Add(new RewardTransaction
        {
            EmployeeId = employee.Id,
            Points = points,
            Type = type,
            Reference = reference
        });
        await _db.SaveChangesAsync();

        await _notif.NotifyEmployeeAsync(employee.Id, employee, "Recognition Awarded",
            reference, "recognition",
            "Recognition Awarded", EmailTemplates.RewardsEarned(employee.FullName, points, reference),
            link: link);
    }

    private async Task<string> GetEmployeeNameAsync(int employeeId) =>
        await _db.Employees.AsNoTracking()
            .Where(e => e.Id == employeeId)
            .Select(e => e.FullName)
            .FirstOrDefaultAsync() ?? "A colleague";

    private async Task<bool> HasRoleAsync(string[] roles)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(claim, out var employeeId)) return false;
        var employee = await _db.Employees.Include(e => e.Role).AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        return employee?.Role?.Name is string role && roles.Contains(role);
    }

    public class KudosRequest
    {
        public int ReceiverEmployeeId { get; set; }
        public string Category { get; set; } = "";
        public string? Message { get; set; }
        public int Points { get; set; } = 10;
    }

    public class RecognitionAwardRequest
    {
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string? Category { get; set; }
        public string Scope { get; set; } = "";
        public string? PeriodLabel { get; set; }
        public string? ImageUrl { get; set; }
        public int AwardPoints { get; set; } = 100;
    }

    public class AwardRecipientsRequest
    {
        public List<AwardRecipientRequest> Recipients { get; set; } = new();
    }

    public class AwardRecipientRequest
    {
        public int EmployeeId { get; set; }
        public string? TeamName { get; set; }
        public string? RecognitionType { get; set; }
        public string? Reason { get; set; }
    }

    public class FunFridayRequest
    {
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime? CelebrationDate { get; set; }
    }
}