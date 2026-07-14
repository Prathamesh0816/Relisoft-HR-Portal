using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/rewards")]
[Authorize]
public class RewardsController : ControllerBase
{
    private readonly AppDbContext _db;
    public RewardsController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("my-points")]
    public async Task<ActionResult> GetMyPoints()
    {
        var empId = GetUserId();
        var account = await _db.RewardPointsAccounts
            .FirstOrDefaultAsync(a => a.EmployeeId == empId);
        return Ok(account ?? new RewardPointsAccount { EmployeeId = empId, Balance = 0 });
    }

    [HttpGet("catalog")]
    public async Task<ActionResult> GetCatalog()
    {
        var items = await _db.RewardCatalogItems
            .Where(i => i.IsActive && i.Quantity > 0)
            .OrderBy(i => i.PointsCost)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("catalog")]
    public async Task<ActionResult> AddCatalogItem([FromBody] RewardCatalogItem req)
    {
        _db.RewardCatalogItems.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPut("catalog/{id}")]
    public async Task<ActionResult> UpdateCatalogItem(int id, [FromBody] RewardCatalogItem req)
    {
        var item = await _db.RewardCatalogItems.FindAsync(id);
        if (item == null) return NotFound();
        item.Name = req.Name;
        item.Description = req.Description;
        item.PointsCost = req.PointsCost;
        item.ImageUrl = req.ImageUrl;
        item.Category = req.Category;
        item.Quantity = req.Quantity;
        item.IsActive = req.IsActive;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [HttpPost("redeem/{itemId}")]
    public async Task<ActionResult> RedeemItem(int itemId, [FromBody] RewardRedemption? req)
    {
        var empId = GetUserId();
        var item = await _db.RewardCatalogItems.FindAsync(itemId);
        if (item == null || !item.IsActive || item.Quantity <= 0)
            return BadRequest(new { message = "Item not available" });
        var account = await _db.RewardPointsAccounts
            .FirstOrDefaultAsync(a => a.EmployeeId == empId);
        if (account == null || account.Balance < item.PointsCost)
            return BadRequest(new { message = "Insufficient points" });
        account.Balance -= item.PointsCost;
        account.LastUpdated = DateTime.UtcNow;
        item.Quantity--;
        var redemption = new RewardRedemption
        {
            EmployeeId = empId,
            ItemId = itemId,
            PointsCost = item.PointsCost,
            Notes = req?.Notes ?? ""
        };
        _db.RewardRedemptions.Add(redemption);
        _db.RewardTransactions.Add(new RewardTransaction
        {
            EmployeeId = empId,
            Points = -item.PointsCost,
            Type = "Redeemed",
            Reference = $"Redeemed: {item.Name}"
        });
        await _db.SaveChangesAsync();
        return Ok(new { redemption.Id, message = $"Redeemed {item.Name} for {item.PointsCost} points" });
    }

    [HttpGet("my-redemptions")]
    public async Task<ActionResult> GetMyRedemptions()
    {
        var empId = GetUserId();
        var redemptions = await _db.RewardRedemptions
            .Include(r => r.Item)
            .Where(r => r.EmployeeId == empId)
            .OrderByDescending(r => r.CreatedOn)
            .ToListAsync();
        return Ok(redemptions.Select(r => new
        {
            r.Id, r.PointsCost, r.Status, r.Notes, r.CreatedOn, r.FulfilledOn,
            ItemName = r.Item?.Name
        }));
    }

    [HttpGet("transactions")]
    public async Task<ActionResult> GetMyTransactions()
    {
        var empId = GetUserId();
        var txns = await _db.RewardTransactions
            .Where(t => t.EmployeeId == empId)
            .OrderByDescending(t => t.CreatedOn)
            .ToListAsync();
        return Ok(txns);
    }

    [HttpGet("all-redemptions")]
    public async Task<ActionResult> GetAllRedemptions()
    {
        var redemptions = await _db.RewardRedemptions
            .Include(r => r.Employee)
            .Include(r => r.Item)
            .OrderByDescending(r => r.CreatedOn)
            .ToListAsync();
        return Ok(redemptions.Select(r => new
        {
            r.Id, r.PointsCost, r.Status, r.Notes, r.CreatedOn, r.FulfilledOn,
            EmployeeName = r.Employee?.FullName,
            ItemName = r.Item?.Name
        }));
    }

    [HttpPost("redemptions/{id}/fulfill")]
    public async Task<ActionResult> FulfillRedemption(int id)
    {
        var redemption = await _db.RewardRedemptions.FindAsync(id);
        if (redemption == null) return NotFound();
        redemption.Status = "Fulfilled";
        redemption.FulfilledOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Fulfilled" });
    }

    [HttpPost("redemptions/{id}/reject")]
    public async Task<ActionResult> RejectRedemption(int id)
    {
        var redemption = await _db.RewardRedemptions.FindAsync(id);
        if (redemption == null) return NotFound();
        var account = await _db.RewardPointsAccounts
            .FirstOrDefaultAsync(a => a.EmployeeId == redemption.EmployeeId);
        if (account != null)
        {
            account.Balance += redemption.PointsCost;
            account.LastUpdated = DateTime.UtcNow;
        }
        var item = await _db.RewardCatalogItems.FindAsync(redemption.ItemId);
        if (item != null) item.Quantity++;
        redemption.Status = "Rejected";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Rejected, points refunded" });
    }
}
