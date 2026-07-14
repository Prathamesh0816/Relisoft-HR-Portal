using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpenseController : ControllerBase
{
    private readonly AppDbContext _db;
    public ExpenseController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("categories")]
    public async Task<ActionResult> GetCategories()
    {
        var list = await _db.ExpenseCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("categories")]
    public async Task<ActionResult> CreateCategory([FromBody] ExpenseCategory req)
    {
        _db.ExpenseCategories.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpGet("claims")]
    public async Task<ActionResult> GetClaims()
    {
        var empId = GetUserId();
        var list = await _db.ExpenseClaims
            .Include(c => c.Category)
            .Where(c => c.EmployeeId == empId)
            .OrderByDescending(c => c.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("claims")]
    public async Task<ActionResult> CreateClaim([FromBody] ExpenseClaim req)
    {
        req.EmployeeId = GetUserId();
        req.Status = "Pending";
        req.CreatedOn = DateTime.UtcNow;
        _db.ExpenseClaims.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpGet("claims/pending")]
    public async Task<ActionResult> GetPendingClaims()
    {
        var list = await _db.ExpenseClaims
            .Include(c => c.Employee)
            .Include(c => c.Category)
            .Where(c => c.Status == "Pending")
            .OrderByDescending(c => c.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("claims/{id}/approve")]
    public async Task<ActionResult> ApproveClaim(int id)
    {
        var claim = await _db.ExpenseClaims.FindAsync(id);
        if (claim == null) return NotFound();
        claim.Status = "Approved";
        claim.ApprovedById = GetUserId();
        claim.ApprovedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(claim);
    }

    [HttpPost("claims/{id}/reject")]
    public async Task<ActionResult> RejectClaim(int id, [FromQuery] string reason)
    {
        var claim = await _db.ExpenseClaims.FindAsync(id);
        if (claim == null) return NotFound();
        claim.Status = "Rejected";
        claim.RejectionReason = reason ?? "";
        await _db.SaveChangesAsync();
        return Ok(claim);
    }

    [HttpPost("claims/{id}/reimburse")]
    public async Task<ActionResult> ReimburseClaim(int id)
    {
        var claim = await _db.ExpenseClaims.FindAsync(id);
        if (claim == null) return NotFound();
        claim.Status = "Reimbursed";
        claim.ReimbursedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(claim);
    }
}
