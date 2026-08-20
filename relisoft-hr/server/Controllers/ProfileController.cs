using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;

    public ProfileController(AppDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public static readonly string[] EditableFields =
    {
        "FullName", "PhoneNumber", "PersonalEmail", "DateOfBirth", "BloodGroup",
        "MaritalStatus", "Address", "EmergencyContactName", "EmergencyContactPhone",
        "EmergencyContactRelation", "ProfileImageUrl"
    };

    private static readonly string[] HrRoles = { "HRL2", "HR", "Admin", "SuperAdmin" };
    private static readonly string[] ManagerRoles = { "Manager", "ManagerL2", "OrganizationHead" };

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : 0;
    }

    private bool IsHr() => User.IsInRole("HRL2") || User.IsInRole("HR") || User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
    private bool IsManager() => ManagerRoles.Any(r => User.IsInRole(r));

    private static object MapProfile(Employee e) => new
    {
        e.Id, e.EmployeeCode, e.FullName, e.Email, e.Department, e.Designation,
        e.JobRole, e.EmploymentType, e.Status, e.Location, e.JoinDate,
        e.PhoneNumber, e.PersonalEmail, e.DateOfBirth, e.BloodGroup, e.MaritalStatus,
        e.Address, e.EmergencyContactName, e.EmergencyContactPhone, e.EmergencyContactRelation,
        e.ProfileImageUrl, e.UanNumber, e.PanNumber, e.ManagerCode, e.PrimaryTeamId,
        Team = e.PrimaryTeam?.Name,
        Role = e.Role?.Name
    };

    [HttpGet("me")]
    public async Task<ActionResult> GetMyProfile()
    {
        var emp = await _db.Employees
            .Include(e => e.Role)
            .Include(e => e.PrimaryTeam)
            .FirstOrDefaultAsync(e => e.Id == GetUserId());
        if (emp == null) return NotFound(new { message = "Employee not found." });
        return Ok(MapProfile(emp));
    }

    [HttpGet("{employeeId}")]
    public async Task<ActionResult> GetProfile(int employeeId)
    {
        if (employeeId != GetUserId() && !IsHr() && !IsManager())
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You are not allowed to view this profile." });

        var emp = await _db.Employees
            .Include(e => e.Role)
            .Include(e => e.PrimaryTeam)
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        if (emp == null) return NotFound(new { message = "Employee not found." });
        return Ok(MapProfile(emp));
    }

    // Employee self-service: any change is routed through HR approval.
    [HttpPut("me")]
    public async Task<ActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest req)
    {
        var emp = await _db.Employees.FindAsync(GetUserId());
        if (emp == null) return NotFound(new { message = "Employee not found." });

        var changes = new List<EmployeeProfileChangeRequest>();
        foreach (var field in EditableFields)
        {
            if (!req.TryGet(field, out var newValue)) continue;
            var oldValue = GetField(emp, field);
            if (Normalize(newValue) == Normalize(oldValue)) continue;

            changes.Add(new EmployeeProfileChangeRequest
            {
                EmployeeId = emp.Id,
                Field = field,
                OldValue = oldValue,
                NewValue = string.IsNullOrWhiteSpace(newValue) ? null : newValue.Trim(),
                Status = "Pending",
                RequestedById = emp.Id,
                RequestedOn = DateTime.UtcNow
            });
        }

        if (changes.Count == 0)
            return Ok(new { message = "No changes detected.", requests = new List<object>() });

        _db.EmployeeProfileChangeRequests.AddRange(changes);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"{changes.Count} change request(s) submitted for HR approval.",
            requests = changes.Select(c => new { c.Id, c.Field, c.OldValue, c.NewValue, c.Status })
        });
    }

    // HR / manager direct update. HR edits are applied immediately.
    [HttpPost("{employeeId}")]
    public async Task<ActionResult> UpdateProfile(int employeeId, [FromBody] UpdateProfileRequest req)
    {
        if (!IsHr())
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only HR can update employee profiles." });

        var emp = await _db.Employees
            .Include(e => e.PrimaryTeam)
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        if (emp == null) return NotFound(new { message = "Employee not found." });

        var applied = new List<string>();
        foreach (var field in EditableFields)
        {
            if (!req.TryGet(field, out var newValue)) continue;
            var oldValue = GetField(emp, field);
            if (Normalize(newValue) == Normalize(oldValue)) continue;
            SetField(emp, field, newValue);
            applied.Add(field);
        }

        if (applied.Count > 0)
        {
            emp.UpdatedOn = DateTime.UtcNow;
            _db.EmployeeProfileChangeRequests.Add(new EmployeeProfileChangeRequest
            {
                EmployeeId = emp.Id,
                Field = string.Join(",", applied),
                OldValue = "HR direct update",
                NewValue = string.Join(",", applied),
                Status = "Approved",
                RequestedById = GetUserId(),
                RequestedOn = DateTime.UtcNow,
                ReviewedById = GetUserId(),
                ReviewedOn = DateTime.UtcNow,
                ReviewComments = "Applied directly by HR."
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = applied.Count > 0 ? $"Updated: {string.Join(", ", applied)}" : "No changes detected." });
    }

    [HttpGet("requests")]
    public async Task<ActionResult> GetRequests([FromQuery] string? status, [FromQuery] int? employeeId)
    {
        if (!IsHr() && !IsManager())
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only HR can view profile change requests." });

        var query = _db.EmployeeProfileChangeRequests
            .Include(r => r.Employee)
            .Include(r => r.RequestedBy)
            .Include(r => r.ReviewedBy)
            .AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(r => r.Status == status);
        if (employeeId.HasValue) query = query.Where(r => r.EmployeeId == employeeId.Value);

        var list = await query.OrderByDescending(r => r.RequestedOn).ToListAsync();
        return Ok(list.Select(r => new
        {
            r.Id, r.EmployeeId, EmployeeName = r.Employee?.FullName,
            r.Field, r.OldValue, r.NewValue, r.Status,
            RequestedByName = r.RequestedBy?.FullName, r.RequestedOn,
            ReviewedByName = r.ReviewedBy?.FullName, r.ReviewedOn, r.ReviewComments
        }));
    }

    [HttpGet("requests/mine")]
    public async Task<ActionResult> GetMyRequests()
    {
        var empId = GetUserId();
        var list = await _db.EmployeeProfileChangeRequests
            .Include(r => r.ReviewedBy)
            .Where(r => r.EmployeeId == empId)
            .OrderByDescending(r => r.RequestedOn)
            .ToListAsync();
        return Ok(list.Select(r => new
        {
            r.Id, r.Field, r.OldValue, r.NewValue, r.Status,
            r.RequestedOn, ReviewedByName = r.ReviewedBy?.FullName, r.ReviewedOn, r.ReviewComments
        }));
    }

    [HttpPost("requests/{id}/review")]
    public async Task<ActionResult> ReviewRequest(int id, [FromBody] ReviewProfileRequest req)
    {
        if (!IsHr())
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Only HR can approve profile changes." });

        var request = await _db.EmployeeProfileChangeRequests.FindAsync(id);
        if (request == null) return NotFound(new { message = "Request not found." });
        if (request.Status != "Pending")
            return BadRequest(new { message = "This request has already been reviewed." });

        request.ReviewedById = GetUserId();
        request.ReviewedOn = DateTime.UtcNow;
        request.ReviewComments = req.Comments;

        if (req.Action == "approve")
        {
            var emp = await _db.Employees.FindAsync(request.EmployeeId);
            if (emp == null) return NotFound(new { message = "Employee not found." });
            SetField(emp, request.Field, request.NewValue);
            emp.UpdatedOn = DateTime.UtcNow;
            request.Status = "Approved";
            await _db.SaveChangesAsync();
            await _audit.LogAsync(GetUserId(), emp.FullName, "ProfileFieldApproved", "Employee", emp.Id,
                $"Approved {request.Field} change for {emp.FullName}.", before: new { request.OldValue }, after: new { request.NewValue });
            return Ok(new { message = $"Approved. {request.Field} updated for {emp.FullName}." });
        }

        request.Status = "Rejected";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Change request rejected." });
    }

    private static void SetField(Employee emp, string field, string? value)
    {
        var trimmed = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        switch (field)
        {
            case "FullName": emp.FullName = trimmed ?? emp.FullName; break;
            case "PhoneNumber": emp.PhoneNumber = trimmed; break;
            case "PersonalEmail": emp.PersonalEmail = trimmed; break;
            case "DateOfBirth":
                emp.DateOfBirth = DateTime.TryParse(trimmed, out var dob) ? dob : emp.DateOfBirth;
                break;
            case "BloodGroup": emp.BloodGroup = trimmed; break;
            case "MaritalStatus": emp.MaritalStatus = trimmed; break;
            case "Address": emp.Address = trimmed; break;
            case "EmergencyContactName": emp.EmergencyContactName = trimmed; break;
            case "EmergencyContactPhone": emp.EmergencyContactPhone = trimmed; break;
            case "EmergencyContactRelation": emp.EmergencyContactRelation = trimmed; break;
            case "ProfileImageUrl": emp.ProfileImageUrl = trimmed; break;
        }
    }

    private static string? GetField(Employee emp, string field) => field switch
    {
        "FullName" => emp.FullName,
        "PhoneNumber" => emp.PhoneNumber,
        "PersonalEmail" => emp.PersonalEmail,
        "DateOfBirth" => emp.DateOfBirth?.ToString("yyyy-MM-dd"),
        "BloodGroup" => emp.BloodGroup,
        "MaritalStatus" => emp.MaritalStatus,
        "Address" => emp.Address,
        "EmergencyContactName" => emp.EmergencyContactName,
        "EmergencyContactPhone" => emp.EmergencyContactPhone,
        "EmergencyContactRelation" => emp.EmergencyContactRelation,
        "ProfileImageUrl" => emp.ProfileImageUrl,
        _ => null
    };

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PersonalEmail { get; set; }
    public string? DateOfBirth { get; set; }
    public string? BloodGroup { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }
    public string? ProfileImageUrl { get; set; }

    public bool TryGet(string field, out string? value)
    {
        value = null;
        switch (field)
        {
            case "FullName": value = FullName; return true;
            case "PhoneNumber": value = PhoneNumber; return true;
            case "PersonalEmail": value = PersonalEmail; return true;
            case "DateOfBirth": value = DateOfBirth; return true;
            case "BloodGroup": value = BloodGroup; return true;
            case "MaritalStatus": value = MaritalStatus; return true;
            case "Address": value = Address; return true;
            case "EmergencyContactName": value = EmergencyContactName; return true;
            case "EmergencyContactPhone": value = EmergencyContactPhone; return true;
            case "EmergencyContactRelation": value = EmergencyContactRelation; return true;
            case "ProfileImageUrl": value = ProfileImageUrl; return true;
        }
        return false;
    }
}

public class ReviewProfileRequest
{
    public string Action { get; set; } = ""; // approve | reject
    public string? Comments { get; set; }
}
