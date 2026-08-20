using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/onboarding-v2")]
public class OnboardingV2Controller : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JoinerAnnouncementService _joinerService;
    private readonly NotificationHelper _notif;

    public OnboardingV2Controller(AppDbContext db, JoinerAnnouncementService joinerService, NotificationHelper notif)
    {
        _db = db;
        _joinerService = joinerService;
        _notif = notif;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null && int.TryParse(claim, out var id) ? id : 0;
    }

    [HttpGet("checklist")]
    public async Task<ActionResult<List<OnboardingChecklistDto>>> GetChecklist()
    {
        var items = await _db.OnboardingChecklistItems
            .Where(ci => ci.IsActive)
            .OrderBy(ci => ci.SortOrder)
            .ToListAsync();
        return Ok(items.Select(ci => new OnboardingChecklistDto(ci.Id, ci.Name, ci.Description, ci.IsMandatory)).ToList());
    }

    [HttpGet("candidates")]
    public async Task<ActionResult<List<EmployeeOnboardingDto>>> GetCandidates()
    {
        var onboardings = await _db.EmployeeOnboardings
            .Include(o => o.Employee).ThenInclude(e => e!.Role)
            .Include(o => o.Steps).ThenInclude(s => s.ChecklistItem)
            .OrderByDescending(o => o.CreatedOn)
            .ToListAsync();
        return Ok(onboardings.Select(MapOnboarding).ToList());
    }

    [HttpGet("candidate/{employeeId}")]
    public async Task<ActionResult<EmployeeOnboardingDto>> GetCandidate(int employeeId)
    {
        var onboarding = await _db.EmployeeOnboardings
            .Include(o => o.Employee).ThenInclude(e => e!.Role)
            .Include(o => o.Steps).ThenInclude(s => s.ChecklistItem)
            .FirstOrDefaultAsync(o => o.EmployeeId == employeeId);
        if (onboarding == null) return NotFound();
        return Ok(MapOnboarding(onboarding));
    }

    [HttpPost("candidate")]
    public async Task<ActionResult> SubmitCandidateForm(CandidateOnboardingRequest req)
    {
        var employee = new Employee
        {
            EmployeeCode = $"CAND-{DateTime.UtcNow:yyyyMMddHHmmss}",
            FullName = req.FullName,
            Email = req.Email,
            Department = req.Department ?? "",
            Designation = req.Designation ?? "",
            JobRole = req.JobRole ?? "",
            EmploymentType = "Full-time",
            Status = "Onboarding",
            Location = req.Location ?? "",
            JoinDate = req.JoinDate,
            RoleId = 1
        };
        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        var onboarding = new EmployeeOnboarding
        {
            EmployeeId = employee.Id,
            Status = "Pending",
            TotalSteps = await _db.OnboardingChecklistItems.CountAsync(ci => ci.IsActive)
        };
        _db.EmployeeOnboardings.Add(onboarding);
        await _db.SaveChangesAsync();

        var items = await _db.OnboardingChecklistItems.Where(ci => ci.IsActive).OrderBy(ci => ci.SortOrder).ToListAsync();
        foreach (var item in items)
        {
            _db.EmployeeOnboardingSteps.Add(new EmployeeOnboardingStep
            {
                OnboardingId = onboarding.Id,
                ChecklistItemId = item.Id,
                Status = "Pending"
            });
        }
        await _db.SaveChangesAsync();

        if (!string.IsNullOrEmpty(req.PanNumber) || !string.IsNullOrEmpty(req.AadhaarNumber))
        {
            var profile = new EmployeeOnboardingProfile
            {
                EmployeeId = employee.Id,
                PanNumber = req.PanNumber,
                AadhaarNumber = req.AadhaarNumber,
                HasPriorExperience = req.HasPriorExperience
            };
            _db.EmployeeOnboardingProfiles.Add(profile);
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Candidate form submitted. Awaiting HR review.", employeeId = employee.Id, onboardingId = onboarding.Id });
    }

    [HttpPost("candidate/{employeeId}/approve")]
    public async Task<ActionResult> ApproveOnboarding(int employeeId)
    {
        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp == null) return NotFound();

        var onboarding = await _db.EmployeeOnboardings
            .Include(o => o.Steps)
            .FirstOrDefaultAsync(o => o.EmployeeId == employeeId);
        if (onboarding == null) return NotFound();

        onboarding.Status = "InProgress";
        emp.Status = "Onboarding";
        emp.EmployeeCode = $"EMP-{DateTime.UtcNow:yyyyMMdd}-{employeeId:D4}";
        await _db.SaveChangesAsync();

        return Ok(new { message = "Onboarding approved. Proceeding with steps.", onboardingId = onboarding.Id });
    }

    [HttpPost("candidate/{employeeId}/assign-assets")]
    public async Task<ActionResult> AssignAssets(int employeeId, [FromBody] AssignAssetsRequest req)
    {
        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp == null) return NotFound();

        var assets = await _db.Assets.Where(a => req.AssetIds.Contains(a.Id)).ToListAsync();
        var assigned = new List<string>();
        foreach (var asset in assets)
        {
            if (asset.Status != "Available") continue;
            _db.EmployeeAssets.Add(new EmployeeAsset
            {
                EmployeeId = employeeId,
                AssetId = asset.Id,
                AssignedOn = DateTime.UtcNow
            });
            asset.Status = "Assigned";
            assigned.Add(asset.Name);
        }
        await _db.SaveChangesAsync();

        if (assigned.Count > 0)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Assets Assigned",
                $"Assets assigned during onboarding: {string.Join(", ", assigned)}.", "asset",
                "Assets Assigned",
                EmailTemplates.AssetAssigned(emp.FullName, string.Join(", ", assigned), ""),
                link: "/my-assets");
        }

        return Ok(new { message = $"{assigned.Count} asset(s) assigned.", assigned });
    }

    [HttpPost("step/{stepId}/complete")]
    public async Task<ActionResult> CompleteStep(int stepId, [FromBody] CompleteStepRequest req)
    {
        var step = await _db.EmployeeOnboardingSteps
            .Include(s => s.Onboarding)
            .FirstOrDefaultAsync(s => s.Id == stepId);
        if (step == null) return NotFound();

        step.Status = "Completed";
        step.CompletedOn = DateTime.UtcNow;

        var onboarding = step.Onboarding!;
        onboarding.CompletedSteps = onboarding.Steps.Count(s => s.Id != step.Id ? s.Status == "Completed" : true) + 1;

        if (req?.TriggerEvent == "ReliSoftId")
            onboarding.ReliSoftIdCreatedOn = DateTime.UtcNow;
        else if (req?.TriggerEvent == "ClientId")
            onboarding.ClientIdCreatedOn = DateTime.UtcNow;
        else if (req?.TriggerEvent == "VirtualIdCard")
            onboarding.VirtualIdCardIssuedOn = DateTime.UtcNow;
        else if (req?.TriggerEvent == "GatePass")
            onboarding.GatePassIssuedOn = DateTime.UtcNow;

        if (onboarding.CompletedSteps >= onboarding.TotalSteps)
        {
            onboarding.Status = "Completed";
            onboarding.CompletedOn = DateTime.UtcNow;
            var emp = await _db.Employees.FindAsync(onboarding.EmployeeId);
            if (emp != null)
            {
                emp.Status = "Active";
                await _joinerService.AnnounceJoinerAsync(emp, GetUserId());
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Step completed.", onboardingId = onboarding.Id, completed = onboarding.CompletedSteps >= onboarding.TotalSteps });
    }

    [HttpPost("one-click-onboard/{employeeId}")]
    public async Task<ActionResult> OneClickOnboard(int employeeId)
    {
        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp == null) return NotFound();

        var onboarding = await _db.EmployeeOnboardings
            .Include(o => o.Steps)
            .FirstOrDefaultAsync(o => o.EmployeeId == employeeId);
        if (onboarding == null) return NotFound();

        onboarding.Status = "Completed";
        onboarding.CompletedSteps = onboarding.TotalSteps;
        onboarding.CompletedOn = DateTime.UtcNow;
        onboarding.ReliSoftIdCreatedOn = DateTime.UtcNow;
        onboarding.ClientIdCreatedOn = DateTime.UtcNow;
        onboarding.VirtualIdCardIssuedOn = DateTime.UtcNow;
        onboarding.GatePassIssuedOn = DateTime.UtcNow;

        foreach (var step in onboarding.Steps)
        {
            step.Status = "Completed";
            step.CompletedOn = DateTime.UtcNow;
        }

        emp.Status = "Active";
        emp.EmployeeCode = $"EMP-{DateTime.UtcNow:yyyyMMdd}-{employeeId:D4}";

        if (string.IsNullOrEmpty(emp.Email) && !string.IsNullOrEmpty(emp.FullName))
        {
            var email = emp.FullName.ToLower().Replace(" ", ".") + "@relisofttechnologies.com";
            emp.Email = email;
        }

        await _db.SaveChangesAsync();

        await _joinerService.AnnounceJoinerAsync(emp, GetUserId());

        var loginExists = await _db.UserLogins.AnyAsync(ul => ul.EmployeeId == employeeId);
        if (!loginExists)
        {
            var username = emp.Email.Split('@')[0];
            _db.UserLogins.Add(new UserLogin
            {
                EmployeeId = employeeId,
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password")
            });
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "One-click onboard complete. Employee is now active.", employeeId });
    }

    [HttpPost("bulk-onboard")]
    public async Task<ActionResult> BulkOnboard(List<CandidateOnboardingRequest> candidates)
    {
        var results = new List<object>();
        foreach (var c in candidates)
        {
            var emp = new Employee
            {
                EmployeeCode = $"CAND-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
                FullName = c.FullName,
                Email = c.Email,
                Department = c.Department ?? "",
                Designation = c.Designation ?? "",
                JobRole = c.JobRole ?? "",
                EmploymentType = "Full-time",
                Status = "Onboarding",
                Location = c.Location ?? "",
                JoinDate = c.JoinDate,
                RoleId = 1
            };
            _db.Employees.Add(emp);
            await _db.SaveChangesAsync();

            var onboarding = new EmployeeOnboarding
            {
                EmployeeId = emp.Id,
                Status = "Pending",
                TotalSteps = await _db.OnboardingChecklistItems.CountAsync(ci => ci.IsActive)
            };
            _db.EmployeeOnboardings.Add(onboarding);
            await _db.SaveChangesAsync();

            var items = await _db.OnboardingChecklistItems.Where(ci => ci.IsActive).OrderBy(ci => ci.SortOrder).ToListAsync();
            foreach (var item in items)
            {
                _db.EmployeeOnboardingSteps.Add(new EmployeeOnboardingStep
                {
                    OnboardingId = onboarding.Id,
                    ChecklistItemId = item.Id,
                    Status = "Pending"
                });
            }
            await _db.SaveChangesAsync();

            results.Add(new { employeeId = emp.Id, name = emp.FullName, email = emp.Email });
        }

        return Ok(new { message = $"{candidates.Count} candidates onboarded.", results });
    }

    [HttpPost("one-click-offboard/{employeeId}")]
    public async Task<ActionResult> OneClickOffboard(int employeeId, [FromBody] StartOffboardingRequest? req)
    {
        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp == null) return NotFound();
        if (emp.Status == "Separated") return BadRequest(new { message = "Employee already separated." });

        var offboarding = new EmployeeOffboarding
        {
            EmployeeId = employeeId,
            Status = "InProgress",
            ResignationDate = req?.ResignationDate ?? DateTime.UtcNow,
            LastWorkingDay = DateTime.UtcNow.AddDays(30),
            Remarks = req?.Remarks
        };
        _db.EmployeeOffboardings.Add(offboarding);

        emp.Status = "Offboarding";
        emp.UpdatedOn = DateTime.UtcNow;

        var userLogin = await _db.UserLogins.FirstOrDefaultAsync(ul => ul.EmployeeId == employeeId);
        if (userLogin != null) userLogin.IsActive = false;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Offboarding initiated. Employee status set to Offboarding.", offboardingId = offboarding.Id });
    }

    [HttpPost("offboard-complete/{offboardingId}")]
    public async Task<ActionResult> CompleteOffboarding(int offboardingId)
    {
        var offboarding = await _db.EmployeeOffboardings
            .FirstOrDefaultAsync(o => o.Id == offboardingId);
        if (offboarding == null) return NotFound();

        // Return all outstanding assets to the pool as part of the handover.
        var outstanding = await _db.EmployeeAssets
            .Include(ea => ea.Asset)
            .Where(ea => ea.EmployeeId == offboarding.EmployeeId && ea.ReturnedOn == null)
            .ToListAsync();
        foreach (var ea in outstanding)
        {
            ea.ReturnedOn = DateTime.UtcNow;
            ea.Status = "Returned";
            if (ea.Asset != null) ea.Asset.Status = "Available";
        }

        offboarding.Status = "Completed";
        offboarding.CompletedOn = DateTime.UtcNow;
        offboarding.AssetsReturnedOn = DateTime.UtcNow;
        offboarding.IdDeactivatedOn = DateTime.UtcNow;
        offboarding.EmailDeactivatedOn = DateTime.UtcNow;
        offboarding.GatePassReturnedOn = DateTime.UtcNow;

        var emp = await _db.Employees.FindAsync(offboarding.EmployeeId);
        if (emp != null)
        {
            emp.Status = "Separated";
            emp.UpdatedOn = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Offboarding completed. Employee separated and outstanding assets returned.", returnedAssets = outstanding.Count });
    }

    [HttpGet("offboardings")]
    public async Task<ActionResult<List<EmployeeOffboardingDto>>> GetOffboardings()
    {
        var offboardings = await _db.EmployeeOffboardings
            .Include(o => o.Employee).ThenInclude(e => e!.Role)
            .OrderByDescending(o => o.CreatedOn)
            .ToListAsync();
        return Ok(offboardings.Select(o => new EmployeeOffboardingDto(
            o.Id, o.EmployeeId, o.Employee?.FullName ?? "", o.Employee?.EmployeeCode ?? "",
            o.Status, o.ResignationDate, o.LastWorkingDay, o.AssetsReturnedOn,
            o.IdDeactivatedOn, o.EmailDeactivatedOn, o.GatePassReturnedOn,
            o.Remarks, o.CreatedOn, o.CompletedOn
        )).ToList());
    }

    [HttpPost("bulk-offboard")]
    public async Task<ActionResult> BulkOffboard(List<StartOffboardingRequest> requests)
    {
        var results = new List<object>();
        foreach (var req in requests)
        {
            var emp = await _db.Employees.FindAsync(req.EmployeeId);
            if (emp == null || emp.Status == "Separated") continue;

            var offboarding = new EmployeeOffboarding
            {
                EmployeeId = req.EmployeeId,
                Status = "InProgress",
                ResignationDate = req.ResignationDate,
                LastWorkingDay = req.ResignationDate.AddDays(30),
                Remarks = req.Remarks
            };
            _db.EmployeeOffboardings.Add(offboarding);
            emp.Status = "Offboarding";
            results.Add(new { employeeId = req.EmployeeId, name = emp.FullName });
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = $"{results.Count} employees sent to offboarding.", results });
    }

    private static EmployeeOnboardingDto MapOnboarding(EmployeeOnboarding o)
    {
        return new EmployeeOnboardingDto(
            o.Id, o.EmployeeId, o.Employee?.FullName ?? "", o.Employee?.EmployeeCode ?? "",
            o.Status, o.CompletedSteps, o.TotalSteps,
            o.Steps.Select(s => new OnboardingStepDto(
                s.Id, s.ChecklistItemId, s.ChecklistItem?.Name ?? "", s.Status, s.CompletedOn, s.Notes
            )).ToList(),
            o.ReliSoftIdCreatedOn, o.ClientIdCreatedOn, o.VirtualIdCardIssuedOn, o.GatePassIssuedOn,
            o.CreatedOn, o.CompletedOn
        );
    }
}

public record CompleteStepRequest(string? TriggerEvent);

public record AssignAssetsRequest(List<int> AssetIds);
