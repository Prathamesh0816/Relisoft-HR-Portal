using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
 
namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/contractors")]
[Authorize]
public class ContractorController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;
    public ContractorController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet]
    public async Task<ActionResult> GetContractors()
    {
        var list = await _db.Contractors.Where(c => c.IsActive).ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult> CreateContractor([FromBody] Contractor req)
    {
        _db.Contractors.Add(req);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(GetUserId());
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Contractor Onboarded",
                $"Contractor {req.CompanyName} has been onboarded.", "contractor",
                "Contractor Onboarded", EmailTemplates.ContractorOnboarded(emp.FullName, req.ContactPerson ?? "N/A", req.CompanyName),
                link: "/contractors");
        }

        return Ok(req);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateContractor(int id, [FromBody] Contractor req)
    {
        var c = await _db.Contractors.FindAsync(id);
        if (c == null) return NotFound();
        c.CompanyName = req.CompanyName;
        c.ContactPerson = req.ContactPerson;
        c.Email = req.Email;
        c.Phone = req.Phone;
        c.Services = req.Services;
        c.ContractStart = req.ContractStart;
        c.ContractEnd = req.ContractEnd;
        c.Status = req.Status;
        await _db.SaveChangesAsync();
        return Ok(c);
    }

    [HttpGet("{id}/employees")]
    public async Task<ActionResult> GetEmployees(int id)
    {
        var list = await _db.ContractorEmployees
            .Where(e => e.ContractorId == id)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("{id}/employees")]
    public async Task<ActionResult> AddEmployee(int id, [FromBody] ContractorEmployee req)
    {
        req.ContractorId = id;
        _db.ContractorEmployees.Add(req);
        await _db.SaveChangesAsync();
        return Ok(req);
    }

    [HttpPut("employees/{employeeId}")]
    public async Task<ActionResult> UpdateEmployee(int employeeId, [FromBody] ContractorEmployee req)
    {
        var e = await _db.ContractorEmployees.FindAsync(employeeId);
        if (e == null) return NotFound();
        e.FullName = req.FullName;
        e.Email = req.Email;
        e.Phone = req.Phone;
        e.Designation = req.Designation;
        e.StartDate = req.StartDate;
        e.EndDate = req.EndDate;
        await _db.SaveChangesAsync();
        return Ok(e);
    }

    [HttpPost("employees/{employeeId}/deactivate")]
    public async Task<ActionResult> DeactivateEmployee(int employeeId)
    {
        var e = await _db.ContractorEmployees.FindAsync(employeeId);
        if (e == null) return NotFound();
        e.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Deactivated" });
    }
}
