using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/leave")]
public class LeaveController : ControllerBase
{
    private readonly AppDbContext _db;

    public LeaveController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("apply-leave")]
    public async Task<ActionResult> ApplyLeave(ApplyLeaveRequest req)
    {
        var employee = await _db.Employees.FindAsync(req.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var leaveType = await _db.LeaveTypes.FindAsync(req.LeaveTypeId);
        if (leaveType == null) return NotFound(new { message = "Leave type not found." });

        var hrPolicy = await _db.HrPolicies.FirstOrDefaultAsync();
        bool sandwichLeave = hrPolicy?.SandwichLeave ?? false;

        decimal totalDays = (req.EndDate - req.StartDate).Days + 1;

        if (!sandwichLeave)
        {
            int workingDays = 0;
            for (var d = req.StartDate; d <= req.EndDate; d = d.AddDays(1))
                if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday)
                    workingDays++;
            if (workingDays > 0) totalDays = workingDays;
        }

        if (req.IsHalfDay) totalDays = Math.Max(1, totalDays * 0.5m);

        var isMedical = totalDays > 3;

        if (leaveType.IsFloaterHoliday)
        {
            var used = await _db.LeaveApplications
                .CountAsync(l => l.EmployeeId == req.EmployeeId && l.LeaveTypeId == req.LeaveTypeId && l.Status == "Approved" && l.AppliedOn.Year == DateTime.UtcNow.Year);
            if (used >= leaveType.MaxFloaterPerYear)
                return BadRequest(new { message = $"Floater holiday limit ({leaveType.MaxFloaterPerYear}/year) reached." });
        }

        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == req.EmployeeId && lb.LeaveTypeId == req.LeaveTypeId);

        bool lossOfPay = balance != null && totalDays > balance.RemainingLeaves;
        if (balance == null) lossOfPay = true;

        var application = new LeaveApplication
        {
            EmployeeId = req.EmployeeId,
            LeaveTypeId = req.LeaveTypeId,
            FromDate = req.StartDate,
            ToDate = req.EndDate,
            IsHalfDay = req.IsHalfDay,
            TotalDays = totalDays,
            Reason = req.Reason,
            Status = "Pending",
            CanCancel = true,
            IsMedicalLeave = isMedical,
            LossOfPay = lossOfPay
        };

        _db.LeaveApplications.Add(application);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = lossOfPay
                ? "Leave applied. Note: This request will be treated as Loss of Pay due to insufficient balance."
                : "Leave applied successfully.",
            application.Id,
            lossOfPay,
            isMedicalLeave = isMedical
        });
    }

    [HttpGet("employee/{employeeId}/requests")]
    public async Task<ActionResult> GetEmployeeRequests(int employeeId)
    {
        var requests = await _db.LeaveApplications
            .Include(l => l.LeaveType)
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.AppliedOn)
            .ToListAsync();

        return Ok(requests.Select(MapRequest).ToList());
    }

    [HttpGet("reviewer/{reviewerId}/requests")]
    public async Task<ActionResult> GetReviewerRequests(int reviewerId)
    {
        var reviewer = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == reviewerId);
        if (reviewer == null) return NotFound();

        var managedEmployeeIds = await GetManagedEmployeeIds(reviewer);

        var requests = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)!.ThenInclude(e => e!.PrimaryTeam)
            .Where(l => managedEmployeeIds.Contains(l.EmployeeId) && l.Status == "Pending")
            .OrderByDescending(l => l.AppliedOn)
            .ToListAsync();

        return Ok(requests.Select(MapRequest).ToList());
    }

    [HttpPost("reviewer/decision")]
    public async Task<ActionResult> MakeDecision(ReviewerDecisionRequest req)
    {
        var application = await _db.LeaveApplications
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.Id == req.LeaveApplicationId);
        if (application == null) return NotFound(new { message = "Leave application not found." });

        var approver = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == req.ApproverId);

        if (application.IsMedicalLeave && string.IsNullOrEmpty(application.MedicalCertificatePath))
            return BadRequest(new { message = "Medical certificate required before approval." });

        var isApproved = req.Action.Equals("approve", StringComparison.OrdinalIgnoreCase);
        application.Status = isApproved ? "Approved" : "Rejected";
        application.ApproverId = req.ApproverId;
        application.ApproverName = approver?.FullName;
        application.ActionedOn = DateTime.UtcNow;
        application.CanCancel = false;

        if (isApproved)
        {
            var balance = await _db.EmployeeLeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
            if (balance != null)
            {
                balance.UsedLeaves += application.TotalDays;
                balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                balance.UpdatedOn = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = isApproved ? "Leave approved." : "Leave rejected." });
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> CancelLeave(int id, CancelLeaveRequest req)
    {
        var application = await _db.LeaveApplications.FindAsync(id);
        if (application == null || application.EmployeeId != req.EmployeeId)
            return NotFound(new { message = "Leave application not found." });

        if (!application.CanCancel)
            return BadRequest(new { message = "Cannot cancel this leave." });

        application.Status = "Cancelled";
        application.CanCancel = false;

        if (application.Status == "Approved" || application.Status == "Cancelled")
        {
            var balance = await _db.EmployeeLeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
            if (balance != null)
            {
                balance.UsedLeaves -= application.TotalDays;
                balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Leave cancelled." });
    }

    [HttpPost("comp-off")]
    public async Task<ActionResult> ApplyCompOff(CompOffRequestData req)
    {
        var compOffType = await _db.LeaveTypes.FirstOrDefaultAsync(lt => lt.IsCompOff);
        if (compOffType == null) return NotFound(new { message = "Comp off leave type not configured." });

        var daysSince = (DateTime.UtcNow - req.WorkedDate).Days;
        if (daysSince > compOffType.CompOffValidityDays)
            return BadRequest(new { message = $"Comp off must be applied within {compOffType.CompOffValidityDays} days of the worked date." });

        var application = new LeaveApplication
        {
            EmployeeId = req.EmployeeId,
            LeaveTypeId = compOffType.Id,
            FromDate = req.WorkedDate,
            ToDate = req.WorkedDate,
            TotalDays = 1,
            Reason = req.Reason,
            Status = "Pending",
            CanCancel = true
        };

        _db.LeaveApplications.Add(application);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Comp off request submitted.", application.Id });
    }

    [HttpPost("comp-off/transfer")]
    public async Task<ActionResult> TransferCompOff(CompOffTransferRequest req)
    {
        var fromEmp = await _db.Employees.FindAsync(req.FromEmployeeId);
        var toEmp = await _db.Employees.FindAsync(req.ToEmployeeId);
        if (fromEmp == null || toEmp == null)
            return NotFound(new { message = "Employee not found." });

        var compOffType = await _db.LeaveTypes.FirstOrDefaultAsync(lt => lt.IsCompOff);
        if (compOffType == null)
            return NotFound(new { message = "Comp off leave type not configured." });

        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == req.FromEmployeeId && lb.LeaveTypeId == compOffType.Id);

        if (balance == null || balance.RemainingLeaves < req.Days)
            return BadRequest(new { message = "Insufficient comp off balance." });

        if (req.Days <= 0)
            return BadRequest(new { message = "Transfer days must be positive." });

        var transfer = new CompOffTransfer
        {
            FromEmployeeId = req.FromEmployeeId,
            ToEmployeeId = req.ToEmployeeId,
            Days = req.Days,
            Reason = req.Reason,
            Status = "Approved",
            ActionedOn = DateTime.UtcNow
        };

        balance.RemainingLeaves -= req.Days;
        balance.UsedLeaves += req.Days;
        balance.UpdatedOn = DateTime.UtcNow;

        var toBalance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == req.ToEmployeeId && lb.LeaveTypeId == compOffType.Id);

        if (toBalance == null)
        {
            toBalance = new EmployeeLeaveBalance
            {
                EmployeeId = req.ToEmployeeId,
                LeaveTypeId = compOffType.Id,
                AllocatedLeaves = req.Days,
                UsedLeaves = 0,
                RemainingLeaves = req.Days
            };
            _db.EmployeeLeaveBalances.Add(toBalance);
        }
        else
        {
            toBalance.AllocatedLeaves += req.Days;
            toBalance.RemainingLeaves += req.Days;
            toBalance.UpdatedOn = DateTime.UtcNow;
        }

        _db.CompOffTransfers.Add(transfer);
        await _db.SaveChangesAsync();

        return Ok(new { message = $"{req.Days} comp off day(s) transferred to {toEmp.FullName}.", transfer.Id });
    }

    [HttpGet("comp-off/transfers/{employeeId}")]
    public async Task<ActionResult> GetCompOffTransfers(int employeeId)
    {
        var transfers = await _db.CompOffTransfers
            .Include(t => t.FromEmployee)
            .Include(t => t.ToEmployee)
            .Where(t => t.FromEmployeeId == employeeId || t.ToEmployeeId == employeeId)
            .OrderByDescending(t => t.CreatedOn)
            .ToListAsync();

        return Ok(transfers.Select(t => new CompOffTransferResponse(
            t.Id, t.FromEmployeeId, t.FromEmployee?.FullName ?? "", t.FromEmployee?.EmployeeCode ?? "",
            t.ToEmployeeId, t.ToEmployee?.FullName ?? "", t.ToEmployee?.EmployeeCode ?? "",
            t.Days, t.Reason, t.Status, t.CreatedOn, t.ActionedOn
        )).ToList());
    }

    [HttpPost("{id}/upload-medical")]
    public async Task<ActionResult> UploadMedicalCertificate(int id, IFormFile file)
    {
        var application = await _db.LeaveApplications.FindAsync(id);
        if (application == null) return NotFound();

        var dir = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "MedicalCertificates", application.EmployeeId.ToString());
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(dir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        application.MedicalCertificatePath = filePath;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Medical certificate uploaded." });
    }

    [HttpGet("balance-check-all")]
    public async Task<ActionResult> CheckAllBalances()
    {
        var employees = await _db.Employees.Include(e => e.Role).ToListAsync();
        var leaveTypes = await _db.LeaveTypes.ToListAsync();
        var result = new List<object>();

        foreach (var emp in employees)
        {
            foreach (var lt in leaveTypes)
            {
                var balance = await _db.EmployeeLeaveBalances
                    .FirstOrDefaultAsync(lb => lb.EmployeeId == emp.Id && lb.LeaveTypeId == lt.Id);
                result.Add(new
                {
                    emp.EmployeeCode,
                    emp.FullName,
                    emp.Id,
                    Role = emp.Role?.Label ?? "",
                    LeaveType = lt.Name,
                    Allocated = balance?.AllocatedLeaves ?? 0,
                    Used = balance?.UsedLeaves ?? 0,
                    Remaining = balance?.RemainingLeaves ?? 0
                });
            }
        }

        return Ok(result);
    }

    [HttpGet("balance-check/{employeeId}/{leaveTypeId}")]
    public async Task<ActionResult> CheckBalance(int employeeId, int leaveTypeId)
    {
        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == employeeId && lb.LeaveTypeId == leaveTypeId);
        var leaveType = await _db.LeaveTypes.FindAsync(leaveTypeId);

        if (leaveType?.IsFloaterHoliday == true)
        {
            var used = await _db.LeaveApplications
                .CountAsync(l => l.EmployeeId == employeeId && l.LeaveTypeId == leaveTypeId && l.Status == "Approved" && l.AppliedOn.Year == DateTime.UtcNow.Year);
            return Ok(new { remaining = leaveType.MaxFloaterPerYear - used, max = leaveType.MaxFloaterPerYear, isFloater = true });
        }

        return Ok(new
        {
            remaining = balance?.RemainingLeaves ?? 0,
            allocated = balance?.AllocatedLeaves ?? 0,
            used = balance?.UsedLeaves ?? 0,
            isFloater = false
        });
    }

    private async Task<List<int>> GetManagedEmployeeIds(Employee reviewer)
    {
        var allEmployees = await _db.Employees.Include(e => e.Role).ToListAsync();

        if (reviewer.Role?.Name == "OrganizationHead" || reviewer.Role?.Name == "HRL2")
        {
            return allEmployees.Select(e => e.Id).ToList();
        }

        var directTeam = await _db.Teams.Include(t => t.EmployeeTeams)
            .FirstOrDefaultAsync(t => t.LeadId == reviewer.Id);
        var directIds = directTeam?.EmployeeTeams.Select(et => et.EmployeeId).ToList() ?? new();

        var myProjects = await _db.Projects
            .Include(p => p.Teams)
            .Where(p => p.Teams.Any(t => t.LeadId == reviewer.Id))
            .ToListAsync();

        var projectTeamIds = myProjects.SelectMany(p => p.Teams).Select(t => t.Id).ToList();
        var projectEmployeeIds = projectTeamIds.Any()
            ? await _db.EmployeeTeams.Where(et => projectTeamIds.Contains(et.TeamId)).Select(et => et.EmployeeId).Distinct().ToListAsync()
            : new();

        var ownIds = directIds.Concat(projectEmployeeIds).Distinct().ToList();

        var delegatedFromIds = await _db.ApprovalDelegates
            .Where(d => d.DelegateId == reviewer.Id)
            .Select(d => d.ManagerId)
            .ToListAsync();

        var delegatedIds = new List<int>();
        if (delegatedFromIds.Any())
        {
            foreach (var managerId in delegatedFromIds)
            {
                var mgrTeam = await _db.Teams.Include(t => t.EmployeeTeams)
                    .FirstOrDefaultAsync(t => t.LeadId == managerId);
                if (mgrTeam != null)
                    delegatedIds.AddRange(mgrTeam.EmployeeTeams.Select(et => et.EmployeeId));

                var mgrProjects = await _db.Projects
                    .Include(p => p.Teams)
                    .Where(p => p.Teams.Any(t => t.LeadId == managerId))
                    .ToListAsync();
                var mgrTeamIds = mgrProjects.SelectMany(p => p.Teams).Select(t => t.Id).ToList();
                if (mgrTeamIds.Any())
                {
                    var mgrEmpIds = await _db.EmployeeTeams
                        .Where(et => mgrTeamIds.Contains(et.TeamId))
                        .Select(et => et.EmployeeId).Distinct().ToListAsync();
                    delegatedIds.AddRange(mgrEmpIds);
                }
            }
        }

        var employeeIds = ownIds.Concat(delegatedIds).Distinct().ToList();

        if (reviewer.Role?.Name is "Manager" or "ManagerL2")
            return employeeIds.Any() ? employeeIds : ownIds;

        if (reviewer.Role?.Name == "TeamLead")
            return directIds;

        if (delegatedIds.Any())
            return employeeIds;

        return new List<int>();
    }

    private static object MapRequest(LeaveApplication l)
    {
        return new LeaveRequestDto(
            l.Id, l.EmployeeId, l.Employee?.FullName ?? "", l.Employee?.EmployeeCode ?? "",
            l.Employee?.Role?.Name ?? "", l.LeaveType?.Name ?? "",
            l.FromDate, l.ToDate, l.TotalDays, l.IsHalfDay, l.Reason ?? "", l.Status,
            l.ApproverName, l.AppliedOn, l.ActionedOn, l.ApprovalReason, l.CanCancel,
            l.Employee?.PrimaryTeam?.Name, l.IsMedicalLeave, l.LossOfPay, l.MedicalCertificatePath
        );
    }
}
