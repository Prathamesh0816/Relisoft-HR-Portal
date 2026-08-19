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
[Route("api/hr-v2")]
public class Phase2FeaturesController : ControllerBase
{
    private static readonly string[] AdminRoles = { "HRL2", "HR", "Admin", "SuperAdmin", "Manager", "ManagerL2", "OrganizationHead" };

    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly IEmailService _email;
    private readonly NotificationHelper _notif;

    public Phase2FeaturesController(AppDbContext db, IAuditLogService audit, IEmailService email, NotificationHelper notif)
    {
        _db = db;
        _audit = audit;
        _email = email;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : 0;
    }

    private async Task<string?> GetUserNameAsync(int? id)
    {
        if (id == null) return null;
        return await _db.Employees.AsNoTracking().Where(e => e.Id == id).Select(e => e.FullName).FirstOrDefaultAsync();
    }

    private async Task<bool> IsAdminAsync()
    {
        var employeeId = GetUserId();
        if (employeeId == 0) return false;
        var role = await _db.Employees.AsNoTracking().Where(e => e.Id == employeeId).Select(e => e.Role!.Name).FirstOrDefaultAsync();
        return role is string r && AdminRoles.Contains(r);
    }

    // ────── Leave Encashment ──────

    [HttpGet("encashments")]
    public async Task<ActionResult> GetEncashments([FromQuery] int? employeeId)
    {
        var query = _db.LeaveEncashments
            .Include(e => e.Employee)
            .Include(e => e.LeaveType)
            .Include(e => e.ApprovedBy)
            .AsQueryable();
        if (employeeId.HasValue) query = query.Where(e => e.EmployeeId == employeeId.Value);
        var list = await query.OrderByDescending(e => e.CreatedOn).ToListAsync();
        return Ok(list.Select(e => new
        {
            e.Id, e.EmployeeId, EmployeeName = e.Employee?.FullName,
            e.LeaveTypeId, LeaveTypeName = e.LeaveType?.Name,
            e.DaysRequested, e.RatePerDay, e.Amount, e.Reason, e.Status,
            e.ApprovedOn, ApprovedByName = e.ApprovedBy?.FullName, e.PaidOn, e.CreatedOn
        }));
    }

    [HttpPost("encashments")]
    public async Task<ActionResult> RequestEncashment(EncashmentRequest req)
    {
        var empId = GetUserId();
        var employee = await _db.Employees.FindAsync(empId);
        if (employee == null) return Unauthorized();

        var leaveType = await _db.LeaveTypes.FindAsync(req.LeaveTypeId);
        if (leaveType == null) return BadRequest(new { message = "Leave type not found." });
        if (leaveType.IsCompOff || leaveType.IsFloaterHoliday)
            return BadRequest(new { message = "Comp-off and floater holidays cannot be encashed." });

        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(b => b.EmployeeId == empId && b.LeaveTypeId == req.LeaveTypeId);
        var available = balance?.RemainingLeaves ?? 0;
        if (req.DaysRequested <= 0 || req.DaysRequested > available)
            return BadRequest(new { message = $"You have {available} day(s) available for this leave type." });

        var ratePerDay = req.RatePerDay > 0 ? req.RatePerDay : await DefaultRatePerDayAsync(employee);
        _db.LeaveEncashments.Add(new LeaveEncashment
        {
            EmployeeId = empId,
            LeaveTypeId = req.LeaveTypeId,
            DaysRequested = req.DaysRequested,
            RatePerDay = ratePerDay,
            Amount = Math.Round(req.DaysRequested * ratePerDay, 2),
            Reason = req.Reason
        });
        await _db.SaveChangesAsync();

        await _audit.LogAsync(empId, employee.FullName, "EncashmentRequested", "LeaveEncashment", null,
            $"Requested encashment of {req.DaysRequested} day(s) of {leaveType.Name}.");

        await _notif.NotifyAsync(empId, "Encashment Requested",
            $"Your encashment request for {req.DaysRequested} day(s) of {leaveType.Name} has been submitted.", "leave",
            link: "/apply");
        return Ok(new { message = "Encashment request submitted." });
    }

    [HttpPut("encashments/{id}/approve")]
    public async Task<ActionResult> ApproveEncashment(int id, int? approvedBy)
    {
        if (!await IsAdminAsync()) return Forbid();
        var enc = await _db.LeaveEncashments.FindAsync(id);
        if (enc == null) return NotFound();
        if (enc.Status != "Pending") return BadRequest(new { message = "Only pending requests can be approved." });

        enc.Status = "Approved";
        enc.ApprovedOn = DateTime.UtcNow;
        enc.ApprovedById = approvedBy ?? GetUserId();

        var balance = await _db.EmployeeLeaveBalances
            .FirstOrDefaultAsync(b => b.EmployeeId == enc.EmployeeId && b.LeaveTypeId == enc.LeaveTypeId);
        if (balance != null)
        {
            balance.RemainingLeaves -= enc.DaysRequested;
            balance.UsedLeaves += enc.DaysRequested;
            balance.UpdatedOn = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();

        await _audit.LogAsync(enc.ApprovedById, await GetUserNameAsync(enc.ApprovedById), "EncashmentApproved", "LeaveEncashment", enc.Id,
            $"Approved {enc.DaysRequested} day(s) encashment for employee {enc.EmployeeId}.", before: new { enc.Status });

        var emp = await _db.Employees.FindAsync(enc.EmployeeId);
        if (emp != null)
            await _notif.NotifyAsync(emp.Id, "Encashment Approved",
                $"Your encashment of {enc.DaysRequested} day(s) has been approved.", "leave", link: "/apply");
        return Ok(new { message = "Encashment approved and balance adjusted." });
    }

    [HttpPut("encashments/{id}/reject")]
    public async Task<ActionResult> RejectEncashment(int id)
    {
        if (!await IsAdminAsync()) return Forbid();
        var enc = await _db.LeaveEncashments.FindAsync(id);
        if (enc == null) return NotFound();
        if (enc.Status != "Pending") return BadRequest(new { message = "Only pending requests can be rejected." });

        enc.Status = "Rejected";
        await _db.SaveChangesAsync();
        var emp = await _db.Employees.FindAsync(enc.EmployeeId);
        if (emp != null)
            await _notif.NotifyAsync(emp.Id, "Encashment Rejected",
                $"Your encashment of {enc.DaysRequested} day(s) was rejected.", "leave", link: "/apply");
        return Ok(new { message = "Encashment rejected." });
    }

    [HttpPut("encashments/{id}/pay")]
    public async Task<ActionResult> MarkEncashmentPaid(int id)
    {
        if (!await IsAdminAsync()) return Forbid();
        var enc = await _db.LeaveEncashments.FindAsync(id);
        if (enc == null) return NotFound();
        if (enc.Status != "Approved") return BadRequest(new { message = "Only approved requests can be marked paid." });

        enc.Status = "Paid";
        enc.PaidOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync(GetUserId(), await GetUserNameAsync(GetUserId()), "EncashmentPaid", "LeaveEncashment", enc.Id,
            $"Paid ₹{enc.Amount:N2} for {enc.DaysRequested} day(s) encashment.");
        return Ok(new { message = "Encashment marked as paid." });
    }

    private async Task<decimal> DefaultRatePerDayAsync(Employee employee)
    {
        var structure = await _db.SalaryStructures.AsNoTracking()
            .FirstOrDefaultAsync(s => s.EmployeeId == employee.Id);
        if (structure == null) return 0;
        var monthly = (structure.FixedPay + structure.VariablePay) / 12m;
        return Math.Round(monthly / 26m, 2);
    }

    // ────── Audit Log ──────

    [HttpGet("audit-log")]
    public async Task<ActionResult> GetAuditLog([FromQuery] string? entityType, [FromQuery] int? limit)
    {
        if (!await IsAdminAsync()) return Forbid();
        var query = _db.AuditLogEntries.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(entityType)) query = query.Where(a => a.EntityType == entityType);
        var list = await query.OrderByDescending(a => a.CreatedOn).Take(limit ?? 200).ToListAsync();
        return Ok(list.Select(a => new
        {
            a.Id, a.ActorEmployeeId, a.ActorName, a.Action, a.EntityType, a.EntityId,
            a.Details, a.BeforeJson, a.AfterJson, a.CreatedOn
        }));
    }

    // ────── Attendance Regularization ──────

    [HttpGet("attendance-regularizations")]
    public async Task<ActionResult> GetRegularizations([FromQuery] int? employeeId, [FromQuery] string? status)
    {
        var query = _db.AttendanceRegularizations
            .Include(r => r.Employee)
            .Include(r => r.AttendanceRecord)
            .Include(r => r.ApprovedBy)
            .AsQueryable();
        if (employeeId.HasValue) query = query.Where(r => r.EmployeeId == employeeId.Value);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(r => r.Status == status);
        var list = await query.OrderByDescending(r => r.CreatedOn).ToListAsync();
        return Ok(list.Select(r => new
        {
            r.Id, r.EmployeeId, EmployeeName = r.Employee?.FullName,
            r.AttendanceRecordId, AttendanceDate = r.AttendanceRecord?.Date,
            r.RequestType, r.Reason, r.Status, r.ApprovedOn, ApprovedByName = r.ApprovedBy?.FullName, r.CreatedOn
        }));
    }

    [HttpPost("attendance-regularizations")]
    public async Task<ActionResult> RequestRegularization(RegularizationRequest req)
    {
        var empId = GetUserId();
        var record = await _db.AttendanceRecords
            .FirstOrDefaultAsync(a => a.Id == req.AttendanceRecordId && a.EmployeeId == empId);
        if (record == null)
            return BadRequest(new { message = "Attendance record not found for this employee." });

        _db.AttendanceRegularizations.Add(new AttendanceRegularization
        {
            EmployeeId = empId,
            AttendanceRecordId = req.AttendanceRecordId,
            RequestType = req.RequestType,
            Reason = req.Reason
        });
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(empId);
        await _audit.LogAsync(empId, emp?.FullName, "RegularizationRequested", "AttendanceRegularization", record.Id,
            $"Requested {req.RequestType} regularization for {record.Date:yyyy-MM-dd}.");
        return Ok(new { message = "Regularization request submitted." });
    }

    [HttpPut("attendance-regularizations/{id}/review")]
    public async Task<ActionResult> ReviewRegularization(int id, ReviewRegularizationRequest req)
    {
        if (!await IsAdminAsync()) return Forbid();
        var r = await _db.AttendanceRegularizations.FindAsync(id);
        if (r == null) return NotFound();

        if (req.Approve)
        {
            r.Status = "Approved";
            r.ApprovedOn = DateTime.UtcNow;
            r.ApprovedById = GetUserId();
            var record = await _db.AttendanceRecords.FindAsync(r.AttendanceRecordId);
            if (record != null) record.Status = r.RequestType == "MissedPunch" ? "Present" : "Present";
        }
        else r.Status = "Rejected";

        await _db.SaveChangesAsync();
        await _audit.LogAsync(GetUserId(), await GetUserNameAsync(GetUserId()), "RegularizationReviewed", "AttendanceRegularization", r.Id,
            $"{(req.Approve ? "Approved" : "Rejected")} {r.RequestType} regularization for attendance #{r.AttendanceRecordId}.");
        return Ok(new { message = r.Status == "Approved" ? "Regularization approved." : "Regularization rejected." });
    }

    // ────── Virtual ID Card & Gate Pass ──────

    [HttpGet("id-card/{employeeId}")]
    public async Task<ActionResult> GetVirtualIdCard(int employeeId)
    {
        var employee = await _db.Employees
            .Include(e => e.Role)
            .Include(e => e.Probation)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        if (employee == null) return NotFound();

        var actingId = employee.Probation != null && employee.Probation.Status == "Probation" ? "PROBATION" : employee.EmployeeCode;
        var html = BuildIdCardHtml(employee, actingId);
        return Content(html, "text/html", System.Text.Encoding.UTF8);
    }

    [HttpGet("gate-pass/{visitorId}")]
    public async Task<ActionResult> GetGatePass(int visitorId)
    {
        var visitor = await _db.Visitors.FindAsync(visitorId);
        if (visitor == null) return NotFound();
        var host = await _db.Employees.AsNoTracking()
            .Where(e => e.Id == visitor.HostEmployeeId).Select(e => e.FullName).FirstOrDefaultAsync();
        var html = BuildGatePassHtml(visitor, host ?? visitor.VisitingEmployee);
        return Content(html, "text/html", System.Text.Encoding.UTF8);
    }

    private string BuildIdCardHtml(Employee e, string actingId)
    {
        var img = string.IsNullOrWhiteSpace(e.ProfileImageUrl)
            ? $"<div class='avatar'>{string.Concat(e.FullName.Split(' ').Take(2).Select(p => p[0]))}</div>"
            : $"<img src='{e.ProfileImageUrl}' alt='{e.FullName}'/>";
        return $@"<!DOCTYPE html><html><head><meta charset='utf-8'><title>Virtual ID Card</title>
<style>
body{{font-family:'Segoe UI',Arial,sans-serif;background:#e2e8f0;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}}
.card{{width:85mm;height:54mm;background:linear-gradient(135deg,#001428 0%,#0b3550 60%,#f5a623 60.5%,#f5a623 100%);border-radius:12px;color:#fff;display:flex;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.25)}}
.left{{width:55%;padding:14px 12px;display:flex;flex-direction:column;justify-content:space-between}}
.right{{width:45%;padding:14px 12px;background:rgba(255,255,255,.12);backdrop-filter:blur(2px)}}
.avatar{{width:56px;height:56px;border-radius:50%;background:#f5a623;color:#001428;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}}
img{{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #f5a623}}
.logo{{font-weight:800;font-size:14px;letter-spacing:.5px}}
.sub{{font-size:9px;opacity:.7}}
h2{{margin:6px 0 2px;font-size:15px}}
.role{{font-size:10px;color:#f5a623;font-weight:700}}
.meta{{font-size:9px;opacity:.85;margin-top:4px;line-height:1.5}}
.badge{{display:inline-block;background:#f5a623;color:#001428;font-weight:800;font-size:10px;padding:2px 8px;border-radius:4px;margin-top:6px}}
@media print{{body{{background:#fff}} .card{{box-shadow:none}}}}
</style></head><body><div class='card'>
<div class='left'>
  <div class='logo'>RELI SOFT<span class='sub'>TECHNOLOGIES</span></div>
  <div>
    <h2>{e.FullName}</h2>
    <div class='role'>{e.Designation}</div>
    <div class='meta'>Dept: {e.Department}<br/>Location: {e.Location}</div>
  </div>
  <span class='badge'>{actingId}</span>
</div>
<div class='right' style='display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center'>
  {img}
  <div class='meta'><b>{e.EmployeeCode}</b><br/>{e.EmploymentType}<br/>DOJ: {e.JoinDate:dd-MMM-yyyy}</div>
  <div style='font-size:7px;opacity:.6'>VALID ONLY WITH GOVERNMENT ID</div>
</div>
</div><script>window.print();</script></body></html>";
    }

    private string BuildGatePassHtml(Visitor v, string hostName)
    {
        var statusColor = v.Status switch { "CheckedIn" => "#16a34a", "CheckedOut" => "#64748b", _ => "#f5a623" };
        var passCode = $"GP-{v.Id:D4}-{v.ExpectedDate:yyyyMMdd}";
        return $@"<!DOCTYPE html><html><head><meta charset='utf-8'><title>Visitor Gate Pass</title>
<style>
body{{font-family:'Segoe UI',Arial,sans-serif;background:#e2e8f0;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}}
.pass{{width:210mm;max-width:720px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.2)}}
.top{{background:#001428;color:#fff;padding:20px 28px;display:flex;justify-content:space-between;align-items:center}}
.top h1{{margin:0;font-size:22px}}
.pass-no{{background:{statusColor};color:#fff;font-weight:800;padding:6px 14px;border-radius:6px;font-size:13px}}
.body{{padding:28px;display:flex;gap:24px}}
.info{{flex:1}}
.row{{display:flex;border-bottom:1px solid #eee;padding:10px 0}}
.row b{{width:180px;color:#64748b}}
.foot{{background:#f8fafc;padding:14px 28px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0}}
.qr{{width:120px;height:120px;background:#f1f5f9;border:1px dashed #cbd5e1;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;text-align:center}}
@media print{{body{{background:#fff}} .pass{{box-shadow:none}}}}
</style></head><body><div class='pass'>
<div class='top'><h1>RELI SOFT TECHNOLOGIES</h1><span class='pass-no'>{passCode}</span></div>
<div class='body'>
  <div class='info'>
    <h2>{v.FullName}</h2>
    <p style='color:#64748b;margin:2px 0'>{v.Company}</p>
    <div class='row'><b>Purpose</b>{v.Purpose}</div>
    <div class='row'><b>Host</b>{hostName}</div>
    <div class='row'><b>Date</b>{v.ExpectedDate:dd-MMM-yyyy}</div>
    <div class='row'><b>Time</b>{v.ExpectedTime}</div>
    <div class='row'><b>Status</b>{v.Status}</div>
  </div>
  <div class='qr'>VALID<br/>{passCode}<br/>GATE PASS</div>
</div>
<div class='foot'>This is a temporary visitor gate pass. Please present a government ID at the security desk. | Valid only for {v.ExpectedDate:dd-MMM-yyyy}.</div>
</div><script>window.print();</script></body></html>";
    }
}