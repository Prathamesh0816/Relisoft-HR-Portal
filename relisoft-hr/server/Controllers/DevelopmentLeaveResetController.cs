using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

/// <summary>
/// Development-only fixture reset. This endpoint intentionally never runs outside
/// the Development environment and requires an explicit confirmation value.
/// </summary>
[ApiController]
[Authorize]
[Route("api/development/leave")]
public class DevelopmentLeaveResetController : ControllerBase
{
    private const string ConfirmationValue = "RESET_LEAVE_DATA";
    private const decimal SickCasualAnnualAllocation = 12m;
    private readonly AppDbContext _db;
    private readonly IHostEnvironment _environment;

    public DevelopmentLeaveResetController(AppDbContext db, IHostEnvironment environment)
    {
        _db = db;
        _environment = environment;
    }

    [HttpPost("reset")]
    public async Task<ActionResult> Reset([FromQuery] string? confirmation)
    {
        if (!_environment.IsDevelopment())
            return NotFound();

        if (!string.Equals(confirmation, ConfirmationValue, StringComparison.Ordinal))
            return BadRequest(new { message = "Explicit development reset confirmation is required." });

        await using var transaction = _db.Database.IsRelational()
            ? await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable)
            : null;

        var applications = await _db.LeaveApplications.ToListAsync();
        var histories = await _db.LeaveApplicationHistories.ToListAsync();
        var compOffTransfers = await _db.CompOffTransfers.ToListAsync();
        var balances = await _db.EmployeeLeaveBalances.ToListAsync();

        _db.LeaveApplicationHistories.RemoveRange(histories);
        _db.LeaveApplications.RemoveRange(applications);
        _db.CompOffTransfers.RemoveRange(compOffTransfers);
        _db.EmployeeLeaveBalances.RemoveRange(balances);
        await _db.SaveChangesAsync();

        var employees = await _db.Employees.AsNoTracking().ToListAsync();
        var leaveTypes = await _db.LeaveTypes.AsNoTracking().Where(type => type.IsActive).ToListAsync();
        var sickCasualType = leaveTypes.SingleOrDefault(type => type.Name == "Sick/Casual Leave");
        var compOffType = leaveTypes.SingleOrDefault(type => type.IsCompOff);
        var resetBalances = new List<EmployeeLeaveBalance>();

        foreach (var employee in employees)
        {
            if (sickCasualType != null)
            {
                resetBalances.Add(new EmployeeLeaveBalance
                {
                    EmployeeId = employee.Id,
                    LeaveTypeId = sickCasualType.Id,
                    AllocatedLeaves = SickCasualAnnualAllocation,
                    UsedLeaves = 0,
                    RemainingLeaves = SickCasualAnnualAllocation
                });
            }

            if (compOffType != null)
            {
                resetBalances.Add(new EmployeeLeaveBalance
                {
                    EmployeeId = employee.Id,
                    LeaveTypeId = compOffType.Id,
                    AllocatedLeaves = 0,
                    UsedLeaves = 0,
                    RemainingLeaves = 0
                });
            }
        }

        _db.EmployeeLeaveBalances.AddRange(resetBalances);
        await _db.SaveChangesAsync();
        if (transaction != null) await transaction.CommitAsync();

        return Ok(new
        {
            message = "Development leave data reset successfully.",
            deletedLeaveApplications = applications.Count,
            deletedLeaveHistories = histories.Count,
            deletedCompOffTransfers = compOffTransfers.Count,
            resetEmployeeBalances = resetBalances.Count,
            preservedLeaveAccrualLogs = await _db.LeaveAccrualLogs.CountAsync()
        });
    }
}
