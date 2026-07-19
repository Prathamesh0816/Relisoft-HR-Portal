using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpenseController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;

    public ExpenseController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

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
    public async Task<ActionResult> CreateCategory([FromBody] ExpenseCategoryRequest req)
    {
        var category = new ExpenseCategory
        {
            Name = req.Name, Description = req.Description,
            RequiresReceipt = req.RequiresReceipt, SortOrder = req.SortOrder, IsActive = true
        };
        _db.ExpenseCategories.Add(category);
        await _db.SaveChangesAsync();
        return Ok(category);
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
    public async Task<ActionResult> CreateClaim([FromBody] ExpenseClaimRequest req)
    {
        if (!await _db.ExpenseCategories.AnyAsync(c => c.Id == req.CategoryId && c.IsActive)) return NotFound();
        var claim = new ExpenseClaim
        {
            EmployeeId = GetUserId(), CategoryId = req.CategoryId, Title = req.Title,
            Description = req.Description, Amount = req.Amount, ExpenseDate = req.ExpenseDate,
            ReceiptUrl = req.ReceiptUrl, Status = "Pending", CreatedOn = DateTime.UtcNow
        };
        _db.ExpenseClaims.Add(claim);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(claim.EmployeeId);
        if (emp != null)
        {
            var cat = await _db.ExpenseCategories.FindAsync(req.CategoryId);
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Expense Claim Submitted",
                $"Your expense claim of {req.Amount:C} has been submitted.", "expense",
                "Expense Claim Submitted", EmailTemplates.ExpenseSubmitted(emp.FullName, cat?.Name ?? "", req.Amount, ""),
                link: "/expenses");
        }

        return Ok(claim);
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
        if (claim.Status != "Pending")
            return Conflict(new { message = "Only pending claims can be approved" });
        claim.Status = "Approved";
        claim.ApprovedById = GetUserId();
        claim.ApprovedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(claim.EmployeeId);
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Expense Claim Approved",
                $"Your expense claim has been approved.", "expense",
                "Expense Claim Approved", EmailTemplates.ExpenseDecision(emp.FullName, "Approved", null),
                link: "/expenses");
        }

        return Ok(claim);
    }

    [HttpPost("claims/{id}/reject")]
    public async Task<ActionResult> RejectClaim(int id, [FromQuery] string reason)
    {
        var claim = await _db.ExpenseClaims.FindAsync(id);
        if (claim == null) return NotFound();
        if (claim.Status != "Pending")
            return Conflict(new { message = "Only pending claims can be rejected" });
        claim.Status = "Rejected";
        claim.RejectionReason = reason ?? "";
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(claim.EmployeeId);
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Expense Claim Rejected",
                $"Your expense claim has been rejected.", "expense",
                "Expense Claim Rejected", EmailTemplates.ExpenseDecision(emp.FullName, "Rejected", reason),
                link: "/expenses");
        }

        return Ok(claim);
    }

    [HttpPost("claims/{id}/reimburse")]
    public async Task<ActionResult> ReimburseClaim(int id)
    {
        var claim = await _db.ExpenseClaims.FindAsync(id);
        if (claim == null) return NotFound();
        if (claim.Status != "Approved")
            return Conflict(new { message = "Only approved claims can be reimbursed" });
        claim.Status = "Reimbursed";
        claim.ReimbursedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(claim);
    }
}
