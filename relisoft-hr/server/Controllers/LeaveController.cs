using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/leave")]
public class LeaveController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly NotificationHelper _notif;
    private readonly ILogger<LeaveController> _logger;

    public LeaveController(AppDbContext db, IEmailService emailService, NotificationHelper notif, ILogger<LeaveController> logger)
    {
        _db = db;
        _emailService = emailService;
        _notif = notif;
        _logger = logger;
    }

    [HttpPost("apply-leave")]
    public async Task<ActionResult> ApplyLeave(ApplyLeaveRequest req)
    {
        var employee = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == req.EmployeeId);
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

        if (leaveType.MaxConsecutiveDays > 0 && totalDays > leaveType.MaxConsecutiveDays)
            return BadRequest(new { message = $"This leave type allows a maximum of {leaveType.MaxConsecutiveDays} consecutive days." });

        if (leaveType.RequiresAdvanceNotice && leaveType.AdvanceNoticeDays > 0)
        {
            var minStartDate = DateTime.UtcNow.Date.AddDays(leaveType.AdvanceNoticeDays);
            if (req.StartDate.Date < minStartDate)
                return BadRequest(new { message = $"This leave type requires {leaveType.AdvanceNoticeDays} day(s) advance notice. Earliest start date: {minStartDate:yyyy-MM-dd}." });
        }

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

        var effectiveBalance = LeaveAccrualCalculator.Calculate(balance, employee, leaveType, DateTime.UtcNow);
        bool lossOfPay = balance == null || totalDays > effectiveBalance.Remaining;

        var approval = await ResolveApprovalAssignment(employee);
        if (approval == null)
            return BadRequest(new { message = "No approval route is configured for this employee. Assign a project manager to their primary team project." });

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
            ApproverId = approval.Approver.Id,
            ApproverName = approval.Approver.FullName,
            ProjectManagerId = approval.ProjectManager?.Id,
            ApprovalRoute = approval.Route,
            CanCancel = true,
            IsMedicalLeave = isMedical,
            LossOfPay = lossOfPay
        };

        _db.LeaveApplications.Add(application);
        await _db.SaveChangesAsync();

        await SendEmailLeaveSubmitted(employee, leaveType, application, approval);

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
        var employee = await _db.Employees
            .Include(e => e.Role)
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var requests = await _db.LeaveApplications
            .Include(l => l.LeaveType)
            .Include(l => l.ProjectManager)
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.AppliedOn)
            .ToListAsync();

        var unassignedRequests = requests.Where(request =>
            request.ApproverId == null &&
            request.Status is "Pending" or "CancellationRequested").ToList();
        if (unassignedRequests.Count > 0)
        {
            var approval = await ResolveApprovalAssignment(employee);
            if (approval != null)
            {
                foreach (var request in unassignedRequests)
                {
                    request.ApproverId = approval.Approver.Id;
                    request.ApproverName = approval.Approver.FullName;
                    request.ProjectManagerId = approval.ProjectManager?.Id;
                    request.ProjectManager = approval.ProjectManager;
                    request.ApprovalRoute = approval.Route;
                }

                await _db.SaveChangesAsync();
            }
        }

        return Ok(requests.Select(MapRequest).ToList());
    }

    [HttpGet("reviewer/{reviewerId}/requests")]
    public async Task<ActionResult> GetReviewerRequests(int reviewerId)
    {
        var reviewer = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == reviewerId);
        if (reviewer == null) return NotFound();

        var managedEmployeeIds = await GetManagedEmployeeIds(reviewer);
        var canReviewAll = reviewer.Role?.Name is "OrganizationHead" or "HRL2";

        var requests = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)!.ThenInclude(e => e!.PrimaryTeam)
            .Include(l => l.ProjectManager)
            .Where(l => l.Status == "Pending" &&
                (canReviewAll || l.ApproverId == reviewerId ||
                 (l.ApproverId == null && managedEmployeeIds.Contains(l.EmployeeId))))
            .OrderByDescending(l => l.AppliedOn)
            .ToListAsync();

        var cancellationRequests = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)
            .Include(l => l.ProjectManager)
            .Where(l => l.Status == "CancellationRequested" &&
                (canReviewAll || l.ApproverId == reviewerId ||
                 (l.ApproverId == null && managedEmployeeIds.Contains(l.EmployeeId))))
            .OrderByDescending(l => l.CancellationRequestedOn ?? l.AppliedOn)
            .ToListAsync();

        var recentDecisions = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)!.ThenInclude(e => e!.PrimaryTeam)
            .Include(l => l.ProjectManager)
            .Where(l => l.Status != "Pending" && l.Status != "CancellationRequested" &&
                (canReviewAll || l.ApproverId == reviewerId ||
                 (l.ApproverId == null && managedEmployeeIds.Contains(l.EmployeeId))))
            .OrderByDescending(l => l.ActionedOn ?? l.AppliedOn)
            .Take(20)
            .ToListAsync();

        return Ok(new
        {
            Reviewer = new { reviewer.Id, reviewer.FullName, Role = reviewer.Role?.Label ?? "" },
            Requests = requests.Select(MapRequest).ToList(),
            CancellationRequests = cancellationRequests.Select(MapRequest).ToList(),
            RecentDecisions = recentDecisions.Select(MapRequest).ToList()
        });
    }

    [HttpPost("reviewer/decision")]
    public async Task<ActionResult> MakeDecision(ReviewerDecisionRequest req)
    {
        var application = await _db.LeaveApplications
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.Id == req.LeaveApplicationId);
        if (application == null) return NotFound(new { message = "Leave application not found." });
        if (application.Status is not ("Pending" or "CancellationRequested"))
            return Conflict(new { message = "This leave request has already been actioned." });

        var approver = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == req.ApproverId);
        if (approver == null) return NotFound(new { message = "Approver not found." });
        if (!await CanReview(application, approver)) return Forbid();

        if (application.Status == "CancellationRequested")
        {
            var isApproved = req.Action.Equals("cancel_approve", StringComparison.OrdinalIgnoreCase);
            application.Status = isApproved ? "Cancelled" : "Approved";
            application.CancellationActionedById = req.ApproverId;
            application.CancellationActionedOn = DateTime.UtcNow;
            application.ApprovalReason = req.Reason;
            application.ActionedOn = DateTime.UtcNow;

            if (isApproved)
            {
                application.CanCancel = false;
                var balance = await _db.EmployeeLeaveBalances
                    .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                if (balance != null)
                {
                    balance.UsedLeaves -= application.TotalDays;
                    LeaveAccrualCalculator.RefreshStoredRemaining(
                        balance, application.Employee!, application.LeaveType!, DateTime.UtcNow);
                }
            }

            await _db.SaveChangesAsync();
            _ = SendEmailCancellationDecision(application, isApproved, req.Reason);

            return Ok(new { message = isApproved ? "Cancellation approved. Leave cancelled." : "Cancellation rejected. Leave remains approved." });
        }

        if (application.IsMedicalLeave && string.IsNullOrEmpty(application.MedicalCertificatePath))
            return BadRequest(new { message = "Medical certificate required before approval." });

        var isApprove = req.Action.Equals("approve", StringComparison.OrdinalIgnoreCase);
        application.Status = isApprove ? "Approved" : "Rejected";
        application.ApproverId = req.ApproverId;
        application.ApproverName = approver.FullName;
        application.ActionedOn = DateTime.UtcNow;
        application.CanCancel = false;
        application.ApprovalReason = req.Reason;

        if (isApprove)
        {
            var balance = await _db.EmployeeLeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
            if (balance != null)
            {
                balance.UsedLeaves += application.TotalDays;
                LeaveAccrualCalculator.RefreshStoredRemaining(
                    balance, application.Employee!, application.LeaveType!, DateTime.UtcNow);
            }
        }

        await _db.SaveChangesAsync();

        if (isApprove)
            _ = SendEmailLeaveDecision(application, "approved");
        else
            _ = SendEmailLeaveDecision(application, "rejected");

        return Ok(new { message = isApprove ? "Leave approved." : "Leave rejected." });
    }

    [HttpPost("reviewer/bulk-decision")]
    public async Task<ActionResult> BulkDecision(BulkDecisionRequest req)
    {
        if (req.LeaveApplicationIds == null || req.LeaveApplicationIds.Count == 0)
            return BadRequest(new { message = "At least one leave application ID is required." });

        if (req.Action != "approve" && req.Action != "reject")
            return BadRequest(new { message = "Action must be 'approve' or 'reject'." });

        var results = new List<object>();
        var approvalsProcessed = 0;
        var errors = 0;

        foreach (var leaveId in req.LeaveApplicationIds)
        {
            try
            {
                var application = await _db.LeaveApplications
                    .Include(l => l.Employee)
                    .Include(l => l.LeaveType)
                    .FirstOrDefaultAsync(l => l.Id == leaveId);
                if (application == null)
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = "Leave not found." });
                    continue;
                }
                if (application.Status != "Pending")
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = "Leave has already been actioned." });
                    continue;
                }

                var approver = await _db.Employees.FindAsync(req.ApproverId);
                if (approver == null || !await CanReview(application, approver))
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = "You are not the assigned approver." });
                    continue;
                }

                if (application.IsMedicalLeave && string.IsNullOrEmpty(application.MedicalCertificatePath) && req.Action == "approve")
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = "Medical certificate required." });
                    continue;
                }

                var isApprove = req.Action.Equals("approve", StringComparison.OrdinalIgnoreCase);
                application.Status = isApprove ? "Approved" : "Rejected";
                application.ApproverId = req.ApproverId;
                application.ApproverName = approver.FullName;
                application.ActionedOn = DateTime.UtcNow;
                application.CanCancel = false;
                application.ApprovalReason = req.Reason;

                if (isApprove)
                {
                    var balance = await _db.EmployeeLeaveBalances
                        .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                    if (balance != null)
                    {
                        balance.UsedLeaves += application.TotalDays;
                        LeaveAccrualCalculator.RefreshStoredRemaining(
                            balance, application.Employee!, application.LeaveType!, DateTime.UtcNow);
                    }
                }

                await _db.SaveChangesAsync();

                if (isApprove)
                    _ = SendEmailLeaveDecision(application, "approved");
                else
                    _ = SendEmailLeaveDecision(application, "rejected");

                approvalsProcessed++;
                results.Add(new { LeaveId = leaveId, Success = true, Message = isApprove ? "Approved." : "Rejected." });
            }
            catch (Exception ex)
            {
                errors++;
                _logger.LogError(ex, "Bulk decision failed for leave {LeaveId}", leaveId);
                results.Add(new { LeaveId = leaveId, Success = false, Message = "Error processing." });
            }
        }

        return Ok(new
        {
            Success = errors == 0,
            Message = $"Processed {results.Count} leave request(s): {approvalsProcessed} succeeded, {errors} failed.",
            Results = results
        });
    }

    [HttpPost("{id}/request-cancellation")]
    public async Task<ActionResult> RequestCancellation(int id, RequestCancellationRequest req)
    {
        var application = await _db.LeaveApplications
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (application == null || application.EmployeeId != req.EmployeeId)
            return NotFound(new { message = "Leave application not found." });

        if (application.Status != "Approved")
            return BadRequest(new { message = "Only approved leaves can be cancelled. Pending leaves can be withdrawn directly." });

        if (application.Status == "CancellationRequested")
            return BadRequest(new { message = "A cancellation request is already pending for this leave." });

        application.Status = "CancellationRequested";
        application.CancellationReason = string.IsNullOrWhiteSpace(req.Reason) ? "No reason provided" : req.Reason.Trim();
        application.CancellationRequestedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        _ = SendEmailCancellationRequested(application);

        return Ok(new { message = "Cancellation request submitted for approval." });
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult> CancelLeave(int id, CancelLeaveRequest req)
    {
        var application = await _db.LeaveApplications
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (application == null || application.EmployeeId != req.EmployeeId)
            return NotFound(new { message = "Leave application not found." });

        if (application.Status != "Pending")
            return BadRequest(new { message = $"Leave is {application.Status.ToLowerInvariant()} and cannot be withdrawn directly. Use cancellation request for approved leaves." });

        application.Status = "Cancelled";
        application.CanCancel = false;
        application.ActionedOn = DateTime.UtcNow;
        application.ApprovalReason = string.IsNullOrWhiteSpace(req.Reason) ? "Withdrawn by employee" : "Withdrawn by employee: " + req.Reason.Trim();

        await _db.SaveChangesAsync();

        return Ok(new { message = "Leave request withdrawn." });
    }

    [HttpGet("calendar")]
    public async Task<ActionResult> GetCalendar([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var fromDate = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var toDate = to ?? fromDate.AddMonths(2).AddDays(-1);

        var leaves = await _db.LeaveApplications
            .AsNoTracking()
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => l.Status == "Approved" && l.FromDate <= toDate && l.ToDate >= fromDate)
            .OrderBy(l => l.FromDate)
            .ToListAsync();

        var events = leaves.Select(l => new CalendarEvent(
            l.Id, l.EmployeeId, l.Employee?.FullName ?? "", l.Employee?.EmployeeCode ?? "",
            l.LeaveType?.Name ?? "", l.FromDate, l.ToDate, l.TotalDays
        )).ToList();

        return Ok(new { Leaves = events, FromDate = fromDate, ToDate = toDate });
    }

    [HttpPost("comp-off")]
    public async Task<ActionResult> ApplyCompOff(CompOffRequestData req)
    {
        var employee = await _db.Employees
            .Include(e => e.Role)
            .FirstOrDefaultAsync(e => e.Id == req.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var compOffType = await _db.LeaveTypes.FirstOrDefaultAsync(lt => lt.IsCompOff);
        if (compOffType == null) return NotFound(new { message = "Comp off leave type not configured." });

        var daysSince = (DateTime.UtcNow - req.WorkedDate).Days;
        if (daysSince > compOffType.CompOffValidityDays)
            return BadRequest(new { message = $"Comp off must be applied within {compOffType.CompOffValidityDays} days of the worked date." });

        var approval = await ResolveApprovalAssignment(employee);
        if (approval == null)
            return BadRequest(new { message = "No approval route is configured for this employee. Assign a project manager to their primary team project." });

        var application = new LeaveApplication
        {
            EmployeeId = req.EmployeeId,
            LeaveTypeId = compOffType.Id,
            FromDate = req.WorkedDate,
            ToDate = req.WorkedDate,
            TotalDays = 1,
            Reason = req.Reason,
            Status = "Pending",
            ApproverId = approval.Approver.Id,
            ApproverName = approval.Approver.FullName,
            ProjectManagerId = approval.ProjectManager?.Id,
            ApprovalRoute = approval.Route,
            CanCancel = true
        };

        _db.LeaveApplications.Add(application);
        await _db.SaveChangesAsync();

        await SendEmailLeaveSubmitted(employee, compOffType, application, approval);

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

        _ = SendCompOffTransferEmails(fromEmp, toEmp, req.Days, req.Reason);

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
                var effectiveBalance = LeaveAccrualCalculator.Calculate(balance, emp, lt, DateTime.UtcNow);
                result.Add(new
                {
                    emp.EmployeeCode,
                    emp.FullName,
                    emp.Id,
                    Role = emp.Role?.Label ?? "",
                    LeaveType = lt.Name,
                    Allocated = effectiveBalance.Allocated,
                    Used = effectiveBalance.Used,
                    Remaining = effectiveBalance.Remaining
                });
            }
        }

        return Ok(result);
    }

    [HttpGet("balance-check/{employeeId}/{leaveTypeId}")]
    public async Task<ActionResult> CheckBalance(int employeeId, int leaveTypeId)
    {
        var employee = await _db.Employees.FindAsync(employeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == employeeId && lb.LeaveTypeId == leaveTypeId);
        var leaveType = await _db.LeaveTypes.FindAsync(leaveTypeId);
        if (leaveType == null) return NotFound(new { message = "Leave type not found." });

        if (leaveType.IsFloaterHoliday)
        {
            var used = await _db.LeaveApplications
                .CountAsync(l => l.EmployeeId == employeeId && l.LeaveTypeId == leaveTypeId && l.Status == "Approved" && l.AppliedOn.Year == DateTime.UtcNow.Year);
            return Ok(new { remaining = leaveType.MaxFloaterPerYear - used, max = leaveType.MaxFloaterPerYear, isFloater = true });
        }

        var effectiveBalance = LeaveAccrualCalculator.Calculate(balance, employee, leaveType, DateTime.UtcNow);
        return Ok(new
        {
            remaining = effectiveBalance.Remaining,
            allocated = effectiveBalance.Allocated,
            used = effectiveBalance.Used,
            isFloater = false,
            accruesMonthly = leaveType.AccruesMonthly,
            annualEntitlement = balance?.AllocatedLeaves ?? 0
        });
    }

    private sealed record ApprovalAssignment(
        Employee Approver,
        Employee? ProjectManager,
        string Route
    );

    private async Task<ApprovalAssignment?> ResolveApprovalAssignment(Employee employee)
    {
        var primaryMembership = await _db.EmployeeProjects
            .Include(ep => ep.Project)!.ThenInclude(p => p!.Manager)
            .Include(ep => ep.Project)!.ThenInclude(p => p!.ApprovalDelegate)!.ThenInclude(d => d!.Delegate)
            .FirstOrDefaultAsync(ep => ep.EmployeeId == employee.Id && ep.IsPrimary);

        if (primaryMembership?.Project != null)
        {
            var project = primaryMembership.Project;
            Team? primaryTeam = null;
            if (employee.PrimaryTeamId.HasValue)
            {
                primaryTeam = await _db.Teams
                    .Include(t => t.Lead)
                    .FirstOrDefaultAsync(t => t.Id == employee.PrimaryTeamId && t.ProjectId == project.Id);
            }
            primaryTeam ??= await _db.Teams
                .Include(t => t.Lead)
                .FirstOrDefaultAsync(t => t.ProjectId == project.Id &&
                    t.EmployeeTeams.Any(et => et.EmployeeId == employee.Id));

            var manager = IsAvailableApprover(project.Manager, employee.Id) ? project.Manager : null;
            var selected = project.ApprovalRoute switch
            {
                ProjectApprovalRoute.TeamLead => primaryTeam?.Lead,
                ProjectApprovalRoute.Delegate => project.ApprovalDelegate?.Delegate,
                _ => project.Manager
            };

            if (IsAvailableApprover(selected, employee.Id))
                return new ApprovalAssignment(selected!, manager, project.ApprovalRoute.ToString());

            var configuredFallback = await ResolveConfiguredFallback(employee);
            if (configuredFallback != null)
                return new ApprovalAssignment(configuredFallback.Value.Approver, manager, configuredFallback.Value.Route);

            // A project owner must not become their own approver unless HR enabled self approval.
            if (selected?.Id == employee.Id)
            {
                var organizationalFallback = await ResolveOrganizationalFallback(employee);
                if (organizationalFallback != null)
                    return new ApprovalAssignment(
                        organizationalFallback,
                        organizationalFallback,
                        ProjectApprovalRoute.ProjectManager.ToString());
            }

            // Preserve a final primary-project safety net for incomplete legacy rows.
            selected = IsAvailableApprover(manager) ? manager : primaryTeam?.Lead;
            if (IsAvailableApprover(selected, employee.Id))
                return new ApprovalAssignment(selected!, manager, project.ApprovalRoute.ToString());
        }

        var fallbackApproval = await ResolveConfiguredFallback(employee);
        if (fallbackApproval != null)
            return new ApprovalAssignment(
                fallbackApproval.Value.Approver,
                null,
                fallbackApproval.Value.Route);

        var fallback = await ResolveOrganizationalFallback(employee);

        return fallback == null
            ? null
            : new ApprovalAssignment(fallback, fallback, ProjectApprovalRoute.ProjectManager.ToString());
    }

    private async Task<(Employee Approver, string Route)?> ResolveConfiguredFallback(Employee employee)
    {
        if (employee.AllowSelfApproval)
            return (employee, "SelfApproval");
        if (!employee.BackupApproverId.HasValue)
            return null;

        var backup = await _db.Employees.FirstOrDefaultAsync(candidate =>
            candidate.Id == employee.BackupApproverId &&
            candidate.Status != "Inactive" && candidate.Status != "Separated");
        return backup == null ? null : (backup, "BackupApprover");
    }

    private async Task<Employee?> ResolveOrganizationalFallback(Employee employee)
    {
        var candidates = _db.Employees.Include(candidate => candidate.Role).Where(candidate =>
            candidate.Id != employee.Id &&
            candidate.Status != "Inactive" && candidate.Status != "Separated");

        return employee.Role?.Name switch
        {
            "OrganizationHead" => await candidates.FirstOrDefaultAsync(candidate =>
                candidate.Role!.Name == "HRL2" || candidate.Role.Name == "HR"),
            "HRL2" or "HR" => await candidates.FirstOrDefaultAsync(candidate =>
                candidate.Role!.Name == "OrganizationHead"),
            "Manager" or "ManagerL2" => await candidates.FirstOrDefaultAsync(candidate =>
                candidate.Role!.Name == "HRL2" || candidate.Role.Name == "OrganizationHead"),
            _ => null
        };
    }

    private static bool IsAvailableApprover(Employee? employee, int? applicantId = null) =>
        employee != null && employee.Id != applicantId &&
        employee.Status != "Inactive" && employee.Status != "Separated";

    private async Task<bool> CanReview(LeaveApplication application, Employee reviewer)
    {
        var authenticatedId = GetAuthenticatedEmployeeId();
        if (authenticatedId != 0 && authenticatedId != reviewer.Id) return false;

        if (application.ApproverId.HasValue)
            return application.ApproverId == reviewer.Id || reviewer.Role?.Name is "OrganizationHead" or "HRL2";

        var managedIds = await GetManagedEmployeeIds(reviewer);
        return managedIds.Contains(application.EmployeeId);
    }

    private int GetAuthenticatedEmployeeId()
    {
        var claim = HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var employeeId) ? employeeId : 0;
    }

    private async Task<List<int>> GetManagedEmployeeIds(Employee reviewer)
    {
        var allEmployees = await _db.Employees.Include(e => e.Role).ToListAsync();

        if (reviewer.Role?.Name == "OrganizationHead" || reviewer.Role?.Name == "HRL2")
            return allEmployees.Select(e => e.Id).ToList();

        var directIds = await _db.Employees
            .Where(employee => employee.PrimaryTeam != null &&
                employee.PrimaryTeam.LeadId == reviewer.Id &&
                employee.EmployeeProjects.Any(membership =>
                    membership.IsPrimary &&
                    membership.ProjectId == employee.PrimaryTeam.ProjectId))
            .Select(employee => employee.Id)
            .Distinct()
            .ToListAsync();

        var managedProjectIds = await _db.Projects
            .Where(p => p.ManagerId == reviewer.Id)
            .Select(p => p.Id)
            .ToListAsync();
        var projectEmployeeIds = await _db.EmployeeProjects
            .Where(ep => ep.IsPrimary && managedProjectIds.Contains(ep.ProjectId))
            .Select(ep => ep.EmployeeId)
            .Distinct()
            .ToListAsync();

        var ownIds = directIds.Concat(projectEmployeeIds).Distinct().ToList();

        var delegatedProjectIds = await _db.Projects
            .Where(p => p.ApprovalRoute == ProjectApprovalRoute.Delegate &&
                p.ApprovalDelegate!.DelegateId == reviewer.Id)
            .Select(p => p.Id)
            .ToListAsync();
        var delegatedIds = await _db.EmployeeProjects
            .Where(ep => ep.IsPrimary && delegatedProjectIds.Contains(ep.ProjectId))
            .Select(ep => ep.EmployeeId)
            .Distinct()
            .ToListAsync();

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
            l.Employee?.PrimaryTeam?.Name, l.IsMedicalLeave, l.LossOfPay, l.MedicalCertificatePath,
            l.CancellationReason, l.CancellationRequestedOn, l.ApprovalRoute,
            l.ProjectManagerId, l.ProjectManager?.FullName
        );
    }

    private async Task SendEmailLeaveSubmitted(
        Employee employee,
        LeaveType leaveType,
        LeaveApplication app,
        ApprovalAssignment approval)
    {
        try
        {
            await _emailService.SendEmailAsync(employee.Email, "Leave Request Submitted",
                EmailTemplates.LeaveSubmitted(employee, leaveType, app.FromDate, app.ToDate, app.TotalDays, approval.Approver.FullName));
            await _notif.NotifyAsync(employee.Id, "Leave Request Submitted",
                $"Your {leaveType.Name} ({app.FromDate:dd-MMM} - {app.ToDate:dd-MMM}) has been submitted for approval.",
                "leave", link: "/apply");

            await _notif.NotifyAsync(approval.Approver.Id, "Leave Approval Required",
                $"{employee.FullName} submitted {leaveType.Name} for {app.FromDate:dd-MMM} - {app.ToDate:dd-MMM}.",
                "leave", "Leave Approval Required",
                $"<p>{employee.FullName} submitted a leave request for your approval.</p><p>{app.FromDate:dd-MMM} - {app.ToDate:dd-MMM}</p>",
                approval.Approver.Email, "/reviewer");

            if (approval.ProjectManager != null && approval.ProjectManager.Id != approval.Approver.Id)
            {
                await _notif.NotifyAsync(approval.ProjectManager.Id, "Team Leave Submitted",
                    $"{employee.FullName}'s leave was routed to {approval.Approver.FullName} ({approval.Route}).",
                    "leave", "Team Leave Submitted",
                    $"<p>{employee.FullName} submitted leave from {app.FromDate:dd-MMM} to {app.ToDate:dd-MMM}.</p><p>Approver: {approval.Approver.FullName} ({approval.Route}).</p>",
                    approval.ProjectManager.Email, "/reviewer");
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to send leave submitted email to {Email}", employee.Email); }
    }

    private async Task SendEmailLeaveDecision(LeaveApplication app, string action)
    {
        try
        {
            if (app.Employee?.Email != null)
            {
                var body = action == "approved" ? EmailTemplates.LeaveApproved(app) : EmailTemplates.LeaveRejected(app);
                await _emailService.SendEmailAsync(app.Employee.Email, $"Leave Request {action}", body);
                await _notif.NotifyAsync(app.EmployeeId, $"Leave {action}",
                    $"Your leave ({app.LeaveType?.Name}) from {app.FromDate:dd-MMM} to {app.ToDate:dd-MMM} has been {action}.",
                    "leave", link: "/my-leaves");
            }

            if (app.ProjectManagerId.HasValue && app.ProjectManagerId != app.ApproverId)
            {
                var manager = await _db.Employees.FindAsync(app.ProjectManagerId);
                if (manager != null)
                {
                    await _notif.NotifyAsync(manager.Id, $"Team Leave {action}",
                        $"{app.Employee?.FullName}'s leave was {action} by {app.ApproverName}.",
                        "leave", "Team Leave Decision",
                        $"<p>{app.Employee?.FullName}'s leave request was {action} by {app.ApproverName}.</p>",
                        manager.Email, "/reviewer");
                }
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to send leave decision email"); }
    }

    private async Task SendEmailCancellationRequested(LeaveApplication app)
    {
        try
        {
            var approver = await _db.Employees.FindAsync(app.ApproverId);
            var employee = await _db.Employees.FindAsync(app.EmployeeId);
            if (approver != null && employee != null)
            {
                await _emailService.SendEmailAsync(approver.Email, "Cancellation Request - Action Required",
                    EmailTemplates.CancellationRequested(app, approver, app.CancellationReason ?? ""));
                await _notif.NotifyAsync(approver.Id, "Cancellation Request",
                    $"{employee.FullName} has requested to cancel their leave ({app.FromDate:dd-MMM} - {app.ToDate:dd-MMM}).",
                    "leave", link: "/reviewer");

                if (app.ProjectManagerId.HasValue && app.ProjectManagerId != approver.Id)
                {
                    var manager = await _db.Employees.FindAsync(app.ProjectManagerId);
                    if (manager != null)
                    {
                        await _notif.NotifyAsync(manager.Id, "Team Leave Cancellation Requested",
                            $"{employee.FullName} requested cancellation; {approver.FullName} remains the assigned approver.",
                            "leave", "Team Leave Cancellation Requested",
                            $"<p>{employee.FullName} requested cancellation of leave from {app.FromDate:dd-MMM} to {app.ToDate:dd-MMM}.</p><p>Approver: {approver.FullName}.</p>",
                            manager.Email, "/reviewer");
                    }
                }
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to send cancellation request email"); }
    }

    private async Task SendEmailCancellationDecision(LeaveApplication app, bool approved, string? reason)
    {
        try
        {
            if (app.Employee?.Email != null)
            {
                await _emailService.SendEmailAsync(app.Employee.Email,
                    $"Cancellation {(approved ? "Approved" : "Rejected")}",
                    EmailTemplates.CancellationDecision(app, approved, reason));
                await _notif.NotifyAsync(app.EmployeeId, $"Cancellation {(approved ? "Approved" : "Rejected")}",
                    $"Your cancellation request for leave ({app.FromDate:dd-MMM} - {app.ToDate:dd-MMM}) has been {(!approved ? "rejected" : "approved")}.",
                    "leave", link: "/my-leaves");
            }
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to send cancellation decision email"); }
    }

    private async Task SendCompOffTransferEmails(Employee from, Employee to, decimal days, string? reason)
    {
        try
        {
            await _emailService.SendEmailAsync(to.Email, "Comp-Off Transfer Received",
                EmailTemplates.CompOffTransferred(from, to, days, reason));
            await _emailService.SendEmailAsync(from.Email, "Comp-Off Transfer Sent",
                EmailTemplates.CompOffTransferred(from, to, days, reason));
            await _notif.NotifyAsync(to.Id, "Comp-Off Received",
                $"{from.FullName} transferred {days} comp-off day(s) to you.",
                "leave", link: "/my-leaves");
            await _notif.NotifyAsync(from.Id, "Comp-Off Sent",
                $"You transferred {days} comp-off day(s) to {to.FullName}.",
                "leave", link: "/my-leaves");
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to send comp-off transfer emails"); }
    }
}
