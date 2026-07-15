using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
 
namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/onboarding")]
public class OnboardingController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly NotificationHelper _notif;

    public OnboardingController(AppDbContext db, NotificationHelper notif)
    {
        _db = db;
        _notif = notif;
    }

    [HttpGet("{employeeId}")]
    public async Task<ActionResult<OnboardingProfileResponse>> GetProfile(int employeeId)
    {
        var profile = await _db.EmployeeOnboardingProfiles
            .Include(p => p.Experiences)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId);

        if (profile == null)
        {
            return Ok(new OnboardingProfileResponse(null, new List<OnboardingDocumentDto>()));
        }

        return Ok(new OnboardingProfileResponse(
            new EmployeeOnboardingProfileDto(
                profile.Id, profile.PanNumber, profile.AadhaarNumber,
                profile.HasPriorExperience,
                profile.Experiences.Select(e => new OnboardingExperienceDto(
                    e.Id, e.CompanyName, e.JobTitle, e.YearsOfExperience,
                    e.RelievingEmailForwarded
                )).ToList()
            ),
            profile.Documents.Select(d => new OnboardingDocumentDto(
                d.Id, d.DocumentType, d.OriginalFileName,
                d.ExperienceId, d.ExperienceCompanyName
            )).ToList()
        ));
    }

    [HttpPost]
    public async Task<ActionResult> SaveProfile(
        [FromForm] int employeeId,
        [FromForm] string panNumber,
        [FromForm] string aadhaarNumber,
        [FromForm] bool hasPriorExperience)
    {
        var profile = await _db.EmployeeOnboardingProfiles
            .Include(p => p.Experiences)
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId);

        if (profile == null)
        {
            profile = new EmployeeOnboardingProfile { EmployeeId = employeeId };
            _db.EmployeeOnboardingProfiles.Add(profile);
        }

        profile.PanNumber = panNumber;
        profile.AadhaarNumber = aadhaarNumber;
        profile.HasPriorExperience = hasPriorExperience;
        profile.UpdatedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var onboardingDir = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "OnboardingFiles", employeeId.ToString());
        Directory.CreateDirectory(onboardingDir);

        var experienceForms = HttpContext.Request.Form.Files
            .Where(f => f.Name.StartsWith("experiences[") && f.Name.EndsWith("].experienceLetter"))
            .ToList();

        var salarySlips = HttpContext.Request.Form.Files
            .Where(f => f.Name == "salarySlips")
            .ToList();

        var additionalDocs = HttpContext.Request.Form.Files
            .Where(f => f.Name == "additionalDocuments")
            .ToList();

        var experienceIndices = HttpContext.Request.Form.Keys
            .Where(k => k.EndsWith("].id"))
            .Select(k => int.Parse(k.Split('[', ']')[1]))
            .Distinct()
            .ToList();

        foreach (var idx in experienceIndices)
        {
            var expIdStr = HttpContext.Request.Form[$"experiences[{idx}].id"].FirstOrDefault() ?? "";
            var companyName = HttpContext.Request.Form[$"experiences[{idx}].companyName"].FirstOrDefault() ?? "";
            var jobTitle = HttpContext.Request.Form[$"experiences[{idx}].jobTitle"].FirstOrDefault() ?? "";
            var yearsStr = HttpContext.Request.Form[$"experiences[{idx}].yearsOfExperience"].FirstOrDefault() ?? "";
            var relievingEmailForwarded = HttpContext.Request.Form[$"experiences[{idx}].relievingEmailForwarded"].FirstOrDefault() == "true";

            var experience = profile.Experiences.FirstOrDefault(e => e.Id.ToString() == expIdStr && !string.IsNullOrEmpty(expIdStr));
            if (experience == null)
            {
                experience = new EmployeeOnboardingExperience { OnboardingProfileId = profile.Id };
                profile.Experiences.Add(experience);
            }

            experience.CompanyName = companyName;
            experience.JobTitle = jobTitle;
            experience.YearsOfExperience = decimal.TryParse(yearsStr, out var years) ? years : null;
            experience.RelievingEmailForwarded = relievingEmailForwarded;

            var expLetterFile = experienceForms.FirstOrDefault(f =>
                f.Name == $"experiences[{idx}].experienceLetter");
            if (expLetterFile != null && expLetterFile.Length > 0)
            {
                var fileName = $"exp_{idx}_{expLetterFile.FileName}";
                var filePath = Path.Combine(onboardingDir, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                    await expLetterFile.CopyToAsync(stream);

                _db.EmployeeOnboardingDocuments.Add(new EmployeeOnboardingDocument
                {
                    OnboardingProfileId = profile.Id,
                    ExperienceId = experience.Id,
                    DocumentType = "Experience Letter",
                    OriginalFileName = expLetterFile.FileName,
                    StoredFilePath = filePath,
                    ExperienceCompanyName = companyName
                });
            }
        }

        foreach (var slip in salarySlips)
        {
            var fileName = $"salary_{Guid.NewGuid()}_{slip.FileName}";
            var filePath = Path.Combine(onboardingDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
                await slip.CopyToAsync(stream);

            _db.EmployeeOnboardingDocuments.Add(new EmployeeOnboardingDocument
            {
                OnboardingProfileId = profile.Id,
                DocumentType = "Salary Slip",
                OriginalFileName = slip.FileName,
                StoredFilePath = filePath
            });
        }

        foreach (var doc in additionalDocs)
        {
            var fileName = $"additional_{Guid.NewGuid()}_{doc.FileName}";
            var filePath = Path.Combine(onboardingDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
                await doc.CopyToAsync(stream);

            _db.EmployeeOnboardingDocuments.Add(new EmployeeOnboardingDocument
            {
                OnboardingProfileId = profile.Id,
                DocumentType = "Additional Document",
                OriginalFileName = doc.FileName,
                StoredFilePath = filePath
            });
        }

        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp != null)
        {
            await _notif.NotifyEmployeeAsync(emp.Id, emp, "Profile Saved",
                "Your onboarding profile has been saved successfully.", "onboarding",
                "Profile Saved", EmailTemplates.OnboardingStepCompleted(emp.FullName, "Profile Saved", "Employee"),
                link: "/onboarding");
        }

        return Ok(new { message = "Onboarding profile saved." });
    }

    [HttpGet("documents/{id}")]
    public async Task<ActionResult> GetDocument(int id)
    {
        var doc = await _db.EmployeeOnboardingDocuments.FindAsync(id);
        if (doc == null || !System.IO.File.Exists(doc.StoredFilePath))
            return NotFound();

        return PhysicalFile(doc.StoredFilePath, "application/octet-stream", doc.OriginalFileName);
    }
}
