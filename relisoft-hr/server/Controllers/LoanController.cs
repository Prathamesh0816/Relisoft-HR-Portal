using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/loans")]
[Authorize]
public class LoanController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;

    public LoanController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("types")]
    public async Task<ActionResult> GetLoanTypes()
    {
        var list = await _db.LoanTypes.Where(t => t.IsActive).ToListAsync();
        return Ok(list);
    }

    [HttpPost("types")]
    public async Task<ActionResult> CreateLoanType([FromBody] LoanType req)
    {
        _db.LoanTypes.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpGet("my")]
    public async Task<ActionResult> GetMyLoans()
    {
        var empId = GetUserId();
        var list = await _db.EmployeeLoans
            .Include(l => l.LoanType)
            .Where(l => l.EmployeeId == empId)
            .OrderByDescending(l => l.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("apply")]
    public async Task<ActionResult> ApplyLoan([FromBody] EmployeeLoan req)
    {
        var loanType = await _db.LoanTypes.FindAsync(req.LoanTypeId);
        if (loanType == null) return NotFound(new { message = "Loan type not found" });
        var rate = loanType.InterestRate / 100;
        var totalInterest = req.Amount * rate * req.Installments;
        var totalAmount = req.Amount + totalInterest;
        req.EmiAmount = totalAmount / req.Installments;
        req.InterestRate = loanType.InterestRate;
        req.EmployeeId = GetUserId();
        req.OutstandingBalance = totalAmount;
        req.Status = "Pending";
        req.CreatedOn = DateTime.UtcNow;
        _db.EmployeeLoans.Add(req);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(req.EmployeeId);
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Loan Application Submitted",
                $"Your loan application for {loanType.Name} of {req.Amount:C} has been submitted.", "loan",
                "Loan Application Submitted", EmailTemplates.LoanSubmitted(emp.FullName, loanType.Name, req.Amount, ""),
                link: "/loans");
        }

        return Ok(req);
    }

    [HttpGet("pending")]
    public async Task<ActionResult> GetPendingLoans()
    {
        var list = await _db.EmployeeLoans
            .Include(l => l.Employee)
            .Include(l => l.LoanType)
            .Where(l => l.Status == "Pending")
            .OrderByDescending(l => l.CreatedOn)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> ApproveLoan(int id)
    {
        var loan = await _db.EmployeeLoans.Include(l => l.LoanType).FirstOrDefaultAsync(l => l.Id == id);
        if (loan == null) return NotFound();
        loan.Status = "Approved";
        loan.ApprovedById = GetUserId();
        loan.ApprovedOn = DateTime.UtcNow;
        loan.DisbursedOn = DateTime.UtcNow;
        var emi = loan.EmiAmount;
        for (int i = 1; i <= loan.Installments; i++)
        {
            var dueDate = DateTime.UtcNow.AddMonths(i);
            _db.LoanRepayments.Add(new LoanRepayment
            {
                LoanId = loan.Id,
                InstallmentNumber = i,
                Amount = emi,
                DueDate = dueDate,
                Status = "Pending"
            });
        }
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(loan.EmployeeId);
        if (emp != null)
        {
            var loanTypeName = loan.LoanType?.Name ?? "";
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Loan Approved",
                $"Your loan application has been approved.", "loan",
                "Loan Application Approved", EmailTemplates.LoanDecision(emp.FullName, loanTypeName, "Approved", null),
                link: "/loans");
        }

        return Ok(loan);
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult> RejectLoan(int id)
    {
        var loan = await _db.EmployeeLoans.Include(l => l.LoanType).FirstOrDefaultAsync(l => l.Id == id);
        if (loan == null) return NotFound();
        loan.Status = "Rejected";
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(loan.EmployeeId);
        if (emp != null)
        {
            var loanTypeName = loan.LoanType?.Name ?? "";
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Loan Rejected",
                $"Your loan application has been rejected.", "loan",
                "Loan Application Rejected", EmailTemplates.LoanDecision(emp.FullName, loanTypeName, "Rejected", null),
                link: "/loans");
        }

        return Ok(loan);
    }

    [HttpGet("{id}/repayments")]
    public async Task<ActionResult> GetRepayments(int id)
    {
        var list = await _db.LoanRepayments
            .Where(r => r.LoanId == id)
            .OrderBy(r => r.InstallmentNumber)
            .ToListAsync();
        return Ok(list);
    }
}
