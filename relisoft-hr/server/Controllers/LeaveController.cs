using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.Security.Claims;

namespace RelisoftHR.Controllers;

[ApiController]
[Authorize]
[Route("api/leave")]
public class LeaveController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    private readonly NotificationHelper _notif;
    private readonly ILogger<LeaveController> _logger;
    private readonly ILeaveBalanceService _leaveBalanceService;
    private readonly LeaveCarryForwardService _carryForwardService;

    public LeaveController(AppDbContext db, IEmailService emailService, NotificationHelper notif, ILogger<LeaveController> logger, ILeaveBalanceService leaveBalanceService, LeaveCarryForwardService carryForwardService)
    {
        _db = db;
        _emailService = emailService;
        _notif = notif;
        _logger = logger;
        _leaveBalanceService = leaveBalanceService;
        _carryForwardService = carryForwardService;
    }

    [HttpPost("apply-leave")]
    public async Task<ActionResult> ApplyLeave(ApplyLeaveRequest req)
    {
        var employee = await _db.Employees.FindAsync(req.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        var leaveType = await _db.LeaveTypes.FindAsync(req.LeaveTypeId);
        if (leaveType == null) return NotFound(new { message = "Leave type not found." });

        if (req.StartDate.Date > req.EndDate.Date)
            return BadRequest(new { message = "The leave start date must be on or before the end date." });

        decimal totalDays;
        try
        {
            totalDays = LeaveDurationCalculator.CalculateInclusive(req.StartDate, req.EndDate, req.IsHalfDay);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }

        if (leaveType.MaxConsecutiveDays > 0 && totalDays > leaveType.MaxConsecutiveDays)
        {
            if (leaveType.Name == "Sick/Casual Leave")
            {
                if (!req.IsMedicalLeave)
                {
                    return BadRequest(new { message = "Medical certificate is required for Sick/Casual Leave exceeding 3 days." });
                }
            }
            else
            {
                return BadRequest(new { message = $"This leave type allows a maximum of {leaveType.MaxConsecutiveDays} consecutive days." });
            }
        }

        if (leaveType.RequiresAdvanceNotice && leaveType.AdvanceNoticeDays > 0)
        {
            var minStartDate = DateTime.UtcNow.Date.AddDays(leaveType.AdvanceNoticeDays);
            if (req.StartDate.Date < minStartDate)
                return BadRequest(new { message = $"This leave type requires {leaveType.AdvanceNoticeDays} day(s) advance notice. Earliest start date: {minStartDate:yyyy-MM-dd}." });
        }

        var isMedical = (leaveType.Name == "Sick/Casual Leave" && totalDays > 3) || req.IsMedicalLeave;

        if (leaveType.IsCompOff)
        {
            await ExpireCompOffCredits();
            if (totalDays > 1)
                return BadRequest(new { message = "Comp off leave can only be applied for 1 day at a time." });

            var adjacentLeave = await _db.LeaveApplications.AnyAsync(l =>
                l.EmployeeId == req.EmployeeId &&
                l.LeaveTypeId == req.LeaveTypeId &&
                !l.IsCompOffCredit &&
                l.Status != "Cancelled" && l.Status != "Rejected" &&
                l.FromDate <= req.StartDate.AddDays(1) && l.ToDate >= req.StartDate.AddDays(-1));
            if (adjacentLeave)
                return BadRequest(new { message = "Consecutive Comp Off leave requests are not allowed." });

            var oldestCredit = await _db.LeaveApplications
                .Where(l => l.EmployeeId == req.EmployeeId &&
                            l.LeaveTypeId == req.LeaveTypeId &&
                            l.IsCompOffCredit &&
                            !l.IsCompOffConsumed &&
                            l.Status == "Approved" &&
                            l.ExpiresOn != null && l.ExpiresOn > DateTime.UtcNow)
                .OrderBy(l => l.WorkedDate)
                .FirstOrDefaultAsync();

            if (oldestCredit == null)
                return BadRequest(new { message = "No available, unexpired Comp Off credit. Please earn Comp Off first." });

            oldestCredit.IsCompOffConsumed = true;
            oldestCredit.ConsumedOn = DateTime.UtcNow;

            var compOffApp = new LeaveApplication
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
                IsMedicalLeave = false,
                LossOfPay = false
            };

            _db.LeaveApplications.Add(compOffApp);
            await _db.SaveChangesAsync();

            oldestCredit.ConsumedByLeaveApplicationId = compOffApp.Id;
            await _db.SaveChangesAsync();

            var compOffApprover = await GetApprover(employee);
            _ = SendEmailLeaveSubmitted(employee, leaveType, compOffApp, compOffApprover?.FullName ?? "Manager");

            return Ok(new
            {
                message = "Comp off leave applied successfully.",
                compOffApp.Id,
                lossOfPay = false,
                isMedicalLeave = false
            });
        }

        if (leaveType.IsFloaterHoliday)
        {
            if (req.StartDate.Date != req.EndDate.Date)
                return BadRequest(new { message = "A floater holiday request must be for one date only." });
            if (req.IsHalfDay)
                return BadRequest(new { message = "Floater holidays must be requested as a full day." });

            var reserved = await _db.LeaveApplications.CountAsync(l =>
                l.EmployeeId == req.EmployeeId &&
                l.LeaveTypeId == req.LeaveTypeId &&
                l.FromDate.Year == req.StartDate.Year &&
                (l.Status == "Pending" || l.Status == "Approved" || l.Status == "CancellationRequested"));
            if (reserved >= leaveType.MaxFloaterPerYear)
                return BadRequest(new { message = $"Floater holiday limit ({leaveType.MaxFloaterPerYear}/year) reached." });
        }

        var duplicateExists = await _db.LeaveApplications.AnyAsync(l =>
            l.EmployeeId == req.EmployeeId &&
            l.LeaveTypeId == req.LeaveTypeId &&
            l.FromDate == req.StartDate &&
            l.ToDate == req.EndDate &&
            l.IsHalfDay == req.IsHalfDay &&
            (l.Status == "Pending" || l.Status == "Approved" || l.Status == "CancellationRequested"));
        if (duplicateExists)
            return BadRequest(new { message = "An active leave request already exists for the same leave type and dates." });

        var validation = leaveType.IsFloaterHoliday
            ? new LeaveBalanceValidation(0, totalDays, 0, 0, true, string.Empty, req.StartDate.Date)
            : await _leaveBalanceService.ValidateLeaveBalanceAsync(req.EmployeeId, req.LeaveTypeId, req.StartDate, totalDays);
        if (!validation.HasSufficientBalance && !req.ConfirmLossOfPay)
            return Conflict(validation);
        var lossOfPay = validation.LopDays > 0;

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
            LossOfPay = lossOfPay,
            LopDays = validation.LopDays,
            PaidLeaveDays = validation.PaidLeaveDays
        };

        _db.LeaveApplications.Add(application);
        AddHistory(application, "Leave Applied", req.EmployeeId, req.Reason);
        await _db.SaveChangesAsync();

        var approver = await GetApprover(employee);
        _ = SendEmailLeaveSubmitted(employee, leaveType, application, approver?.FullName ?? "Manager");

        return Ok(new
        {
            message = lossOfPay
                ? "Leave applied. Note: This request will be treated as Loss of Pay due to insufficient balance."
                : "Leave applied successfully.",
            application.Id,
            lossOfPay,
            lopDays = validation.LopDays,
            isMedicalLeave = isMedical
        });
    }

    [HttpGet("employee/{employeeId}/requests")]
    public async Task<ActionResult> GetEmployeeRequests(int employeeId)
    {
        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return Unauthorized(new { message = "Invalid token." });
        if (authenticatedEmployeeId != employeeId) return Forbid();

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
        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return Unauthorized(new { message = "Invalid token." });
        if (authenticatedEmployeeId != reviewerId) return Forbid();

        var reviewer = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == reviewerId);
        if (reviewer == null) return NotFound();

        var managedEmployeeIds = await GetManagedEmployeeIds(reviewer);

        var requests = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)!.ThenInclude(e => e!.PrimaryTeam)
            .Where(l => managedEmployeeIds.Contains(l.EmployeeId) && l.Status == "Pending")
            .OrderByDescending(l => l.AppliedOn)
            .ToListAsync();

        var cancellationRequests = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)
            .Where(l => managedEmployeeIds.Contains(l.EmployeeId) && l.Status == "CancellationRequested")
            .OrderByDescending(l => l.CancellationRequestedOn ?? l.AppliedOn)
            .ToListAsync();

        var recentDecisions = await _db.LeaveApplications
            .Include(l => l.LeaveType).Include(l => l.Employee)!.ThenInclude(e => e!.PrimaryTeam)
            .Where(l => managedEmployeeIds.Contains(l.EmployeeId) && l.Status != "Pending" && l.Status != "CancellationRequested")
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
        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return Unauthorized(new { message = "Invalid token." });
        if (authenticatedEmployeeId != req.ApproverId) return Forbid();

        var application = await _db.LeaveApplications
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.Id == req.LeaveApplicationId);
        if (application == null) return NotFound(new { message = "Leave application not found." });

        var approver = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == req.ApproverId);
        if (approver == null) return NotFound(new { message = "Approver not found." });

        var managedEmployeeIds = await GetManagedEmployeeIds(approver);
        if (!managedEmployeeIds.Contains(application.EmployeeId))
            return Forbid();

        if (application.Status == "CancellationRequested")
        {
            await using var transaction = _db.Database.IsRelational()
                ? await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable)
                : null;

            await _db.Entry(application).ReloadAsync();
            if (application.Status != "CancellationRequested")
                return Conflict(new { message = "This cancellation request has already been actioned." });

            var isApproved = req.Action.Equals("cancel_approve", StringComparison.OrdinalIgnoreCase);
            application.Status = isApproved ? "Cancelled" : "Approved";
            application.CancellationActionedById = req.ApproverId;
            application.CancellationActionedOn = DateTime.UtcNow;
            application.ApprovalReason = req.Reason;
            application.ActionedOn = DateTime.UtcNow;

            if (isApproved && application.CancellationBalanceRestoredOn == null)
            {
                application.CanCancel = false;
                if (application.IsCompOffCredit)
                {
                    var balance = await _db.EmployeeLeaveBalances
                        .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                    if (balance != null)
                    {
                        balance.AllocatedLeaves = Math.Max(0, balance.AllocatedLeaves - application.TotalDays);
                        balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                        balance.UpdatedOn = DateTime.UtcNow;
                    }
                }
                else if (application.LeaveType?.IsCompOff == true)
                {
                    var reservedCredit = await _db.LeaveApplications
                        .FirstOrDefaultAsync(l => l.ConsumedByLeaveApplicationId == application.Id);
                    if (reservedCredit != null)
                    {
                        reservedCredit.IsCompOffConsumed = false;
                        reservedCredit.ConsumedOn = null;
                        reservedCredit.ConsumedByLeaveApplicationId = null;
                    }

                    var balance = await _db.EmployeeLeaveBalances
                        .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                    if (balance != null)
                    {
                        balance.UsedLeaves = Math.Max(0, balance.UsedLeaves - (application.PaidLeaveDays ?? application.TotalDays));
                        balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                        balance.UpdatedOn = DateTime.UtcNow;
                    }
                }
                else if (application.LeaveType?.IsFloaterHoliday != true && !await _leaveBalanceService.IsPlannedLeaveAsync(application.LeaveTypeId))
                {
                    var balance = await _db.EmployeeLeaveBalances
                        .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                    if (balance != null)
                    {
                        balance.UsedLeaves = Math.Max(0, balance.UsedLeaves - (application.PaidLeaveDays ?? application.TotalDays));
                        balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                        balance.UpdatedOn = DateTime.UtcNow;
                    }
                }
                application.CancellationBalanceRestoredOn = DateTime.UtcNow;
            }

            AddHistory(application, isApproved ? "Cancellation Approved" : "Cancellation Rejected", req.ApproverId, req.Reason);
            await _db.SaveChangesAsync();
            if (transaction != null) await transaction.CommitAsync();
            _ = SendEmailCancellationDecision(application, isApproved, req.Reason);

            return Ok(new { message = isApproved ? "Cancellation approved. Leave cancelled." : "Cancellation rejected. Leave remains approved." });
        }

        if (application.IsMedicalLeave && string.IsNullOrEmpty(application.MedicalCertificatePath))
            return BadRequest(new { message = "Medical certificate required before approval." });

        if (application.Status != "Pending")
            return BadRequest(new { message = $"This leave request is already {application.Status.ToLowerInvariant()}." });

        var isApprove = req.Action.Equals("approve", StringComparison.OrdinalIgnoreCase);

        if (isApprove)
        {
            if (application.LeaveType?.IsFloaterHoliday == true)
            {
                var approved = await _db.LeaveApplications.CountAsync(l =>
                    l.Id != application.Id &&
                    l.EmployeeId == application.EmployeeId &&
                    l.LeaveTypeId == application.LeaveTypeId &&
                    l.FromDate.Year == application.FromDate.Year &&
                    l.Status == "Approved");
                if (approved >= application.LeaveType.MaxFloaterPerYear)
                    return BadRequest(new { message = $"Floater holiday limit ({application.LeaveType.MaxFloaterPerYear}/year) reached." });
            }
            else if (application.IsCompOffCredit)
            {
                var balance = await _db.EmployeeLeaveBalances
                    .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                if (balance == null)
                {
                    balance = new EmployeeLeaveBalance
                    {
                        EmployeeId = application.EmployeeId,
                        LeaveTypeId = application.LeaveTypeId,
                        AllocatedLeaves = 1,
                        UsedLeaves = 0,
                        RemainingLeaves = 1
                    };
                    _db.EmployeeLeaveBalances.Add(balance);
                }
                else
                {
                    balance.AllocatedLeaves += 1;
                    balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                    balance.UpdatedOn = DateTime.UtcNow;
                }
            }
            else if (application.LeaveType?.IsCompOff == true)
            {
                var balance = await _db.EmployeeLeaveBalances
                    .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                if (balance != null)
                {
                    balance.UsedLeaves += application.PaidLeaveDays ?? application.TotalDays;
                    balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                    balance.UpdatedOn = DateTime.UtcNow;
                }
            }
            else
            {
                // Calculate before the status becomes Approved so a Planned Leave
                // request cannot consume its own provisional paid value in the snapshot.
                await ApplyApprovedLeaveBalanceAsync(application);
            }
        }
        else if (!isApprove && application.LeaveType?.IsCompOff == true && !application.IsCompOffCredit)
        {
            var reservedCredit = await _db.LeaveApplications
                .FirstOrDefaultAsync(l => l.ConsumedByLeaveApplicationId == application.Id);
            if (reservedCredit != null)
            {
                reservedCredit.IsCompOffConsumed = false;
                reservedCredit.ConsumedOn = null;
                reservedCredit.ConsumedByLeaveApplicationId = null;
            }
        }

        application.Status = isApprove ? "Approved" : "Rejected";
        application.ApproverId = req.ApproverId;
        application.ApproverName = approver.FullName;
        application.ActionedOn = DateTime.UtcNow;
        application.CanCancel = false;
        application.ApprovalReason = req.Reason;
        AddHistory(application, isApprove ? "Leave Approved" : "Leave Rejected", req.ApproverId, req.Reason);

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

        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return Unauthorized(new { message = "Invalid token." });
        if (authenticatedEmployeeId != req.ApproverId) return Forbid();

        var approver = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == req.ApproverId);
        if (approver == null) return NotFound(new { message = "Approver not found." });

        var managedEmployeeIds = await GetManagedEmployeeIds(approver);

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

                if (!managedEmployeeIds.Contains(application.EmployeeId))
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = "Not authorized to manage this leave." });
                    continue;
                }

                if (application.IsMedicalLeave && string.IsNullOrEmpty(application.MedicalCertificatePath) && req.Action == "approve")
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = "Medical certificate required." });
                    continue;
                }

                var isApprove = req.Action.Equals("approve", StringComparison.OrdinalIgnoreCase);

                if (application.Status != "Pending")
                {
                    errors++;
                    results.Add(new { LeaveId = leaveId, Success = false, Message = $"Leave is already {application.Status.ToLowerInvariant()}." });
                    continue;
                }

                if (isApprove)
                {
                    if (application.LeaveType?.IsFloaterHoliday == true)
                    {
                        var approved = await _db.LeaveApplications.CountAsync(l =>
                            l.Id != application.Id &&
                            l.EmployeeId == application.EmployeeId &&
                            l.LeaveTypeId == application.LeaveTypeId &&
                            l.FromDate.Year == application.FromDate.Year &&
                            l.Status == "Approved");
                        if (approved >= application.LeaveType.MaxFloaterPerYear)
                        {
                            errors++;
                            results.Add(new { LeaveId = leaveId, Success = false, Message = "Floater holiday limit reached." });
                            continue;
                        }
                    }
                    else if (application.IsCompOffCredit)
                    {
                        var balance = await _db.EmployeeLeaveBalances
                            .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                        if (balance == null)
                        {
                            balance = new EmployeeLeaveBalance
                            {
                                EmployeeId = application.EmployeeId,
                                LeaveTypeId = application.LeaveTypeId,
                                AllocatedLeaves = 1,
                                UsedLeaves = 0,
                                RemainingLeaves = 1
                            };
                            _db.EmployeeLeaveBalances.Add(balance);
                        }
                        else
                        {
                            balance.AllocatedLeaves += 1;
                            balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                            balance.UpdatedOn = DateTime.UtcNow;
                        }
                    }
                    else if (application.LeaveType?.IsCompOff == true)
                    {
                        var balance = await _db.EmployeeLeaveBalances
                            .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
                        if (balance != null)
                        {
                            balance.UsedLeaves += application.PaidLeaveDays ?? application.TotalDays;
                            balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                            balance.UpdatedOn = DateTime.UtcNow;
                        }
                    }
                    else
                    {
                        // Keep the request pending while its paid/LOP split is
                        // calculated so Planned Leave does not include itself.
                        await ApplyApprovedLeaveBalanceAsync(application);
                    }
                }
                else if (!isApprove && application.LeaveType?.IsCompOff == true && !application.IsCompOffCredit)
                {
                    var reservedCredit = await _db.LeaveApplications
                        .FirstOrDefaultAsync(l => l.ConsumedByLeaveApplicationId == application.Id);
                    if (reservedCredit != null)
                    {
                        reservedCredit.IsCompOffConsumed = false;
                        reservedCredit.ConsumedOn = null;
                        reservedCredit.ConsumedByLeaveApplicationId = null;
                    }
                }

                application.Status = isApprove ? "Approved" : "Rejected";
                application.ApproverId = req.ApproverId;
                application.ApproverName = approver.FullName;
                application.ActionedOn = DateTime.UtcNow;
                application.CanCancel = false;
                application.ApprovalReason = req.Reason;
                AddHistory(application, isApprove ? "Leave Approved" : "Leave Rejected", req.ApproverId, req.Reason);

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
        AddHistory(application, "Cancellation Requested", req.EmployeeId, application.CancellationReason);
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

        if (application.Status == "CancellationRequested")
        {
            application.Status = "Approved";
            application.CancellationActionedById = req.EmployeeId;
            application.CancellationActionedOn = DateTime.UtcNow;
            application.ApprovalReason = string.IsNullOrWhiteSpace(req.Reason) ? "Cancellation request withdrawn by employee" : "Cancellation request withdrawn: " + req.Reason.Trim();
            AddHistory(application, "Cancellation Withdrawn", req.EmployeeId, req.Reason);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Cancellation request withdrawn. Leave remains approved." });
        }

        if (application.Status != "Pending")
            return BadRequest(new { message = $"Leave is {application.Status.ToLowerInvariant()} and cannot be withdrawn directly. Use cancellation request for approved leaves." });

        application.Status = "Cancelled";
        application.CanCancel = false;
        application.ActionedOn = DateTime.UtcNow;
        application.ApprovalReason = string.IsNullOrWhiteSpace(req.Reason) ? "Withdrawn by employee" : "Withdrawn by employee: " + req.Reason.Trim();
        AddHistory(application, "Leave Withdrawn", req.EmployeeId, req.Reason);

        if (application.LeaveType?.IsCompOff == true && !application.IsCompOffCredit)
        {
            var reservedCredit = await _db.LeaveApplications
                .FirstOrDefaultAsync(l => l.ConsumedByLeaveApplicationId == application.Id);
            if (reservedCredit != null)
            {
                reservedCredit.IsCompOffConsumed = false;
                reservedCredit.ConsumedOn = null;
                reservedCredit.ConsumedByLeaveApplicationId = null;
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Leave request withdrawn." });
    }

    [HttpGet("calendar")]
    public async Task<ActionResult> GetCalendar([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var authenticatedEmployeeId = GetAuthenticatedEmployeeId();
        if (authenticatedEmployeeId == null) return Unauthorized(new { message = "Invalid token." });

        var viewer = await _db.Employees
            .AsNoTracking()
            .Include(e => e.Role)
            .FirstOrDefaultAsync(e => e.Id == authenticatedEmployeeId);
        if (viewer == null) return Unauthorized(new { message = "Employee account not found." });

        var fromDate = from ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var toDate = to ?? fromDate.AddMonths(2).AddDays(-1);

        var query = _db.LeaveApplications
            .AsNoTracking()
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => l.Status == "Approved" && l.FromDate <= toDate && l.ToDate >= fromDate);

        if (viewer.Role?.Name == "Employee")
            query = query.Where(l => l.EmployeeId == authenticatedEmployeeId.Value);

        var leaves = await query
            .OrderBy(l => l.FromDate)
            .ToListAsync();

        var events = leaves
            .GroupBy(l => new { l.EmployeeId, l.LeaveTypeId, l.FromDate, l.ToDate, l.TotalDays, l.IsHalfDay })
            .Select(group => group.OrderBy(l => l.AppliedOn).ThenBy(l => l.Id).First())
            .Select(l => new CalendarEvent(
                l.Id, l.EmployeeId, l.Employee?.FullName ?? "", l.Employee?.EmployeeCode ?? "",
                l.LeaveType?.Name ?? "", l.FromDate, l.ToDate, l.TotalDays
            )).ToList();

        return Ok(new { Leaves = events, FromDate = fromDate, ToDate = toDate });
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
            CanCancel = true,
            IsCompOffCredit = true,
            WorkedDate = req.WorkedDate,
            ExpiresOn = req.WorkedDate.AddDays(compOffType.CompOffValidityDays),
            IsCompOffConsumed = false
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

        if (req.FromEmployeeId == req.ToEmployeeId)
            return BadRequest(new { message = "Cannot transfer Comp Off to yourself." });

        var compOffType = await _db.LeaveTypes.FirstOrDefaultAsync(lt => lt.IsCompOff);
        if (compOffType == null)
            return NotFound(new { message = "Comp off leave type not configured." });

        var credit = await _db.LeaveApplications.FirstOrDefaultAsync(l =>
            l.Id == req.CompOffCreditLeaveApplicationId &&
            l.EmployeeId == req.FromEmployeeId &&
            l.IsCompOffCredit &&
            !l.IsCompOffConsumed &&
            l.Status == "Approved" &&
            l.ExpiresOn != null && l.ExpiresOn > DateTime.UtcNow);

        if (credit == null)
            return BadRequest(new { message = "Invalid or unavailable Comp Off credit." });

        credit.EmployeeId = req.ToEmployeeId;

        var transfer = new CompOffTransfer
        {
            FromEmployeeId = req.FromEmployeeId,
            ToEmployeeId = req.ToEmployeeId,
            CompOffCreditLeaveApplicationId = credit.Id,
            WorkedDate = credit.WorkedDate!.Value,
            ExpiresOn = credit.ExpiresOn!.Value,
            Reason = req.Reason,
            Status = "Approved",
            ActionedOn = DateTime.UtcNow
        };

        var fromBalance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == req.FromEmployeeId && lb.LeaveTypeId == compOffType.Id);
        if (fromBalance != null)
        {
            fromBalance.UsedLeaves += 1;
            fromBalance.RemainingLeaves = fromBalance.AllocatedLeaves - fromBalance.UsedLeaves;
            fromBalance.UpdatedOn = DateTime.UtcNow;
        }

        var toBalance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == req.ToEmployeeId && lb.LeaveTypeId == compOffType.Id);
        if (toBalance == null)
        {
            toBalance = new EmployeeLeaveBalance
            {
                EmployeeId = req.ToEmployeeId,
                LeaveTypeId = compOffType.Id,
                AllocatedLeaves = 1,
                UsedLeaves = 0,
                RemainingLeaves = 1
            };
            _db.EmployeeLeaveBalances.Add(toBalance);
        }
        else
        {
            toBalance.AllocatedLeaves += 1;
            toBalance.RemainingLeaves = toBalance.AllocatedLeaves - toBalance.UsedLeaves;
            toBalance.UpdatedOn = DateTime.UtcNow;
        }

        _db.CompOffTransfers.Add(transfer);
        await _db.SaveChangesAsync();

        _ = SendCompOffTransferEmails(fromEmp, toEmp, 1, req.Reason);

        return Ok(new { message = $"Comp off transferred to {toEmp.FullName}.", transfer.Id });
    }

    [HttpGet("comp-off/transfers/{employeeId}")]
    public async Task<ActionResult> GetCompOffTransfers(int employeeId)
    {
        var transfers = await _db.CompOffTransfers
            .Include(t => t.FromEmployee)
            .Include(t => t.ToEmployee)
            .Include(t => t.CompOffCredit)
            .Where(t => t.FromEmployeeId == employeeId || t.ToEmployeeId == employeeId)
            .OrderByDescending(t => t.CreatedOn)
            .ToListAsync();

        return Ok(transfers.Select(t => new CompOffTransferResponse(
            t.Id, t.FromEmployeeId, t.FromEmployee?.FullName ?? "", t.FromEmployee?.EmployeeCode ?? "",
            t.ToEmployeeId, t.ToEmployee?.FullName ?? "", t.ToEmployee?.EmployeeCode ?? "",
            t.WorkedDate, t.ExpiresOn, t.Reason, t.Status, t.CreatedOn, t.ActionedOn
        )).ToList());
    }

    [HttpGet("comp-off/available-credits/{employeeId}")]
    public async Task<ActionResult> GetAvailableCompOffCredits(int employeeId)
    {
        var compOffType = await _db.LeaveTypes.FirstOrDefaultAsync(lt => lt.IsCompOff);
        if (compOffType == null)
            return Ok(new List<object>());

        var credits = await _db.LeaveApplications
            .Where(l => l.EmployeeId == employeeId &&
                        l.LeaveTypeId == compOffType.Id &&
                        l.IsCompOffCredit &&
                        !l.IsCompOffConsumed &&
                        l.Status == "Approved" &&
                        l.ExpiresOn != null && l.ExpiresOn > DateTime.UtcNow)
            .OrderBy(l => l.WorkedDate)
            .Select(l => new
            {
                l.Id,
                l.WorkedDate,
                l.ExpiresOn,
                l.AppliedOn
            })
            .ToListAsync();

        return Ok(credits);
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
        application.IsMedicalLeave = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Medical certificate uploaded." });
    }

    [HttpGet("{id}/download-medical")]
    public async Task<ActionResult> DownloadMedicalCertificate(int id)
    {
        var application = await _db.LeaveApplications.FindAsync(id);
        if (application == null || string.IsNullOrEmpty(application.MedicalCertificatePath))
            return NotFound(new { message = "Medical certificate not found." });

        var path = application.MedicalCertificatePath;
        if (!System.IO.File.Exists(path)) return NotFound(new { message = "File not found on server." });

        var contentType = "application/octet-stream";
        var ext = Path.GetExtension(path).ToLowerInvariant();
        if (ext == ".pdf") contentType = "application/pdf";
        else if (ext == ".jpg" || ext == ".jpeg") contentType = "image/jpeg";
        else if (ext == ".png") contentType = "image/png";

        return PhysicalFile(path, contentType, Path.GetFileName(path));
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
                var balance = await _leaveBalanceService.GetBalanceAsync(emp.Id, lt.Id);
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
    public async Task<ActionResult> CheckBalance(int employeeId, int leaveTypeId, [FromQuery] int? year = null)
    {
        var leaveType = await _db.LeaveTypes.FindAsync(leaveTypeId);

        if (leaveType?.IsFloaterHoliday == true)
        {
            var leaveYear = year ?? DateTime.UtcNow.Year;
            var used = await _db.LeaveApplications
                .CountAsync(l => l.EmployeeId == employeeId && l.LeaveTypeId == leaveTypeId && l.Status == "Approved" && l.FromDate.Year == leaveYear);
            return Ok(new { remaining = leaveType.MaxFloaterPerYear - used, max = leaveType.MaxFloaterPerYear, isFloater = true });
        }

        var balance = await _leaveBalanceService.GetBalanceAsync(employeeId, leaveTypeId);
        return Ok(new
        {
            remaining = balance?.RemainingLeaves ?? 0,
            allocated = balance?.AllocatedLeaves ?? 0,
            used = balance?.UsedLeaves ?? 0,
            carryForward = balance?.CarryForwardDays ?? 0,
            financialYear = balance?.FinancialYear ?? "",
            isFloater = false
        });
    }

    private async Task<Employee?> GetApprover(Employee employee)
    {
        // NEW: route to the employee's direct manager first
        var empWithManager = await _db.Employees.Include(e => e.ReportingManager).FirstOrDefaultAsync(e => e.Id == employee.Id);
        if (empWithManager?.ReportingManager != null)
            return empWithManager.ReportingManager;

        var empWithRole = await _db.Employees.Include(e => e.Role).FirstOrDefaultAsync(e => e.Id == employee.Id);
        if (empWithRole?.Role?.Name == "OrganizationHead" || empWithRole?.Role?.Name is "HRL2" or "HR")
            return await _db.Employees.FirstOrDefaultAsync(e => e.RoleId == 6);

        if (empWithRole?.Role?.Name is "Manager" or "ManagerL2")
            return await _db.Employees.FirstOrDefaultAsync(e => e.RoleId == 7 || e.RoleId == 6);

        var primaryTeam = employee.PrimaryTeamId.HasValue
            ? await _db.Teams.Include(t => t.Lead).FirstOrDefaultAsync(t => t.Id == employee.PrimaryTeamId.Value)
            : null;
        if (primaryTeam?.Lead != null) return primaryTeam.Lead;

        var team = await _db.Teams.Include(t => t.Lead).FirstOrDefaultAsync(t => t.EmployeeTeams.Any(et => et.EmployeeId == employee.Id));
        if (team?.Lead != null) return team.Lead;

        var project = await _db.Projects.Include(p => p.Teams).ThenInclude(t => t.Lead)
            .FirstOrDefaultAsync(p => p.Teams.Any(t => t.EmployeeTeams.Any(et => et.EmployeeId == employee.Id)));
        return project?.Teams.FirstOrDefault()?.Lead;
    }

    private async Task<List<int>> GetManagedEmployeeIds(Employee reviewer)
    {
        var allEmployees = await _db.Employees.Include(e => e.Role).ToListAsync();

        if (reviewer.Role?.Name == "OrganizationHead" || reviewer.Role?.Name == "HRL2")
            return allEmployees.Select(e => e.Id).ToList();

        var directTeams = await _db.Teams.Include(t => t.EmployeeTeams)
            .Where(t => t.LeadId == reviewer.Id)
            .ToListAsync();
        var directIds = directTeams.SelectMany(t => t.EmployeeTeams).Select(et => et.EmployeeId).Distinct().ToList();
        var directTeamIds = directTeams.Select(t => t.Id).ToList();
        var primaryTeamEmployeeIds = directTeamIds.Any()
            ? await _db.Employees
                .Where(e => e.PrimaryTeamId.HasValue && directTeamIds.Contains(e.PrimaryTeamId.Value))
                .Select(e => e.Id)
                .ToListAsync()
            : new();
        var directlyAssignedIds = directIds.Concat(primaryTeamEmployeeIds).Distinct().ToList();

        var myProjects = await _db.Projects
            .Include(p => p.Teams)
            .Where(p => p.Teams.Any(t => t.LeadId == reviewer.Id))
            .ToListAsync();

        var projectTeamIds = myProjects.SelectMany(p => p.Teams).Select(t => t.Id).ToList();
        var projectEmployeeIds = projectTeamIds.Any()
            ? await _db.EmployeeTeams.Where(et => projectTeamIds.Contains(et.TeamId)).Select(et => et.EmployeeId).Distinct().ToListAsync()
            : new();

        // NEW: direct reports via ManagerCode -> EmployeeCode
        var directReportIds = await _db.Employees
            .Where(e => e.ManagerCode == reviewer.EmployeeCode)
            .Select(e => e.Id)
            .ToListAsync();

        var ownIds = directlyAssignedIds
            .Concat(projectEmployeeIds)
            .Concat(directReportIds)
            .Distinct()
            .ToList();

        var delegatedFromIds = await _db.ApprovalDelegates
            .Where(d => d.DelegateId == reviewer.Id)
            .Select(d => d.ManagerId)
            .ToListAsync();

        var delegatedIds = new List<int>();
        if (delegatedFromIds.Any())
        {
            foreach (var managerId in delegatedFromIds)
            {
                var mgrTeams = await _db.Teams.Include(t => t.EmployeeTeams)
                    .Where(t => t.LeadId == managerId)
                    .ToListAsync();
                foreach (var mgrTeam in mgrTeams)
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

                // NEW: delegating manager's direct reports via ManagerCode
                var mgrEmployee = await _db.Employees.FindAsync(managerId);
                if (mgrEmployee != null)
                {
                    var mgrDirectReportIds = await _db.Employees
                        .Where(e => e.ManagerCode == mgrEmployee.EmployeeCode)
                        .Select(e => e.Id)
                        .ToListAsync();
                    delegatedIds.AddRange(mgrDirectReportIds);
                }
            }
        }

        var employeeIds = ownIds.Concat(delegatedIds).Distinct().ToList();

        if (reviewer.Role?.Name is "Manager" or "ManagerL2")
            return employeeIds.Any() ? employeeIds : ownIds;

        if (reviewer.Role?.Name == "TeamLead")
            return directlyAssignedIds;

        if (delegatedIds.Any())
            return employeeIds;

        // Reviewer access is assignment based, not role-only. An Employee can
        // be a valid approver when they lead another employee's primary team.
        return ownIds;
    }

    private int? GetAuthenticatedEmployeeId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var employeeId) ? employeeId : null;
    }

    private async Task ExpireCompOffCredits()
    {
        var now = DateTime.UtcNow;
        var expiredCredits = await _db.LeaveApplications
            .Where(l => l.IsCompOffCredit &&
                        !l.IsCompOffConsumed &&
                        l.Status == "Approved" &&
                        l.ExpiresOn != null && l.ExpiresOn <= now)
            .ToListAsync();

        foreach (var credit in expiredCredits)
        {
            var balance = await _db.EmployeeLeaveBalances
                .FirstOrDefaultAsync(lb => lb.EmployeeId == credit.EmployeeId && lb.LeaveTypeId == credit.LeaveTypeId);
            if (balance != null && balance.AllocatedLeaves > 0)
            {
                balance.AllocatedLeaves -= 1;
                balance.RemainingLeaves = balance.AllocatedLeaves - balance.UsedLeaves;
                balance.UpdatedOn = now;
            }
        }

        if (expiredCredits.Any())
            await _db.SaveChangesAsync();
    }

    private static object MapRequest(LeaveApplication l)
    {
        return new LeaveRequestDto(
            l.Id, l.EmployeeId, l.Employee?.FullName ?? "", l.Employee?.EmployeeCode ?? "",
            l.Employee?.Role?.Name ?? "", l.LeaveType?.Name ?? "",
            l.FromDate, l.ToDate, l.TotalDays, l.IsHalfDay, l.Reason ?? "", l.Status,
            l.ApproverName, l.AppliedOn, l.ActionedOn, l.ApprovalReason, l.CanCancel,
            l.Employee?.PrimaryTeam?.Name, l.IsMedicalLeave, l.LossOfPay, l.MedicalCertificatePath,
            l.CancellationReason, l.CancellationRequestedOn,
            l.IsCompOffCredit, l.WorkedDate, l.ExpiresOn, l.IsCompOffConsumed
        );
    }

    private void AddHistory(LeaveApplication application, string eventType, int? actorEmployeeId, string? notes)
    {
        _db.LeaveApplicationHistories.Add(new LeaveApplicationHistory
        {
            LeaveApplication = application,
            EventType = eventType,
            ActorEmployeeId = actorEmployeeId,
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim(),
            OccurredOn = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Applies an approved application's calculated paid duration exactly once to
    /// stored balances. Planned Leave remains snapshot-derived in
    /// <see cref="LeaveBalanceService"/>.
    /// </summary>
    private async Task ApplyApprovedLeaveBalanceAsync(LeaveApplication application)
    {
        var validation = await _leaveBalanceService.ValidateLeaveBalanceAsync(
            application.EmployeeId, application.LeaveTypeId, application.FromDate, application.TotalDays);
        application.PaidLeaveDays = validation.PaidLeaveDays;
        application.LopDays = validation.LopDays;
        application.LossOfPay = validation.LopDays > 0;

        if (await _leaveBalanceService.IsPlannedLeaveAsync(application.LeaveTypeId))
            return;

        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == application.EmployeeId && lb.LeaveTypeId == application.LeaveTypeId);
        if (balance == null) return;

        balance.UsedLeaves += application.PaidLeaveDays ?? application.TotalDays;
        balance.RemainingLeaves = Math.Max(0, balance.AllocatedLeaves - balance.UsedLeaves);
        balance.UpdatedOn = DateTime.UtcNow;
    }

    private async Task SendEmailLeaveSubmitted(Employee employee, LeaveType leaveType, LeaveApplication app, string approverName)
    {
        try
        {
            await _emailService.SendEmailAsync(employee.Email, "Leave Request Submitted",
                EmailTemplates.LeaveSubmitted(employee, leaveType, app.FromDate, app.ToDate, app.TotalDays, approverName));
            await _notif.NotifyAsync(employee.Id, "Leave Request Submitted",
                $"Your {leaveType.Name} ({app.FromDate:dd-MMM} - {app.ToDate:dd-MMM}) has been submitted for approval.",
                "leave", link: "/apply");
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

    [HttpGet("holidays")]
    public async Task<ActionResult<List<HolidayDto>>> GetHolidays([FromQuery] int? year)
    {
        var y = year ?? DateTime.UtcNow.Year;
        var holidays = await _db.Holidays
            .AsNoTracking()
            .Where(h => h.Date.Year == y)
            .OrderBy(h => h.Date)
            .ToListAsync();

        return Ok(holidays.Select(h => new HolidayDto(
            h.Id, h.Name,
            h.Date.ToString("yyyy-MM-dd"),
            h.Date.DayOfWeek.ToString(),
            h.Type
        )).ToList());
    }

    [HttpGet("carry-forward/preview")]
    public async Task<ActionResult> CarryForwardPreview([FromQuery] string? fromFY)
    {
        var fy = fromFY;
        if (string.IsNullOrEmpty(fy))
        {
            var currentFY = _carryForwardService.GetFinancialYear(DateTime.UtcNow);
            fy = _carryForwardService.GetPreviousFinancialYear(currentFY);
        }

        var result = await _carryForwardService.PreviewAsync(fy);
        return Ok(result);
    }

    [HttpPost("carry-forward/process")]
    public async Task<ActionResult> CarryForwardProcess(CarryForwardProcessRequest req)
    {
        var result = await _carryForwardService.ProcessAsync(
            req.FromFinancialYear, "Manual", req.ProcessedById);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(result);
    }

    [HttpGet("carry-forward/history")]
    public async Task<ActionResult> CarryForwardHistory([FromQuery] string? fy)
    {
        var query = _db.LeaveCarryForwardLogs
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(fy))
            query = query.Where(l => l.FromFinancialYear == fy || l.ToFinancialYear == fy);

        var logs = await query.OrderByDescending(l => l.ProcessedOn).Take(200).ToListAsync();

        return Ok(logs.Select(l => new CarryForwardLogDto(
            l.Id, l.EmployeeId, l.Employee?.FullName ?? "", l.Employee?.EmployeeCode ?? "",
            l.LeaveType?.Name ?? "", l.FromFinancialYear, l.ToFinancialYear,
            l.PreviousYearRemaining, l.CarryForwardPct,
            l.CarryForwardDays, l.LapsedDays,
            l.TriggerType, l.ProcessedById, l.ProcessedOn
        )).ToList());
    }
}
