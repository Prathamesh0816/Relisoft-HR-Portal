using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.Security.Claims;
using System.Text.Json;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly IOneDriveStorageService _oneDrive;
    private readonly ILogger<DocumentController> _logger;

    public DocumentController(AppDbContext db, IAuditLogService audit, IOneDriveStorageService oneDrive, ILogger<DocumentController> logger)
    {
        _db = db;
        _audit = audit;
        _oneDrive = oneDrive;
        _logger = logger;
    }

    private int? GetAuthenticatedEmployeeId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out var id) ? id : null;
    }

    [HttpGet("templates")]
    public async Task<ActionResult<List<DocumentTemplateDto>>> GetTemplates()
    {
        var templates = await _db.DocumentTemplates.Where(t => t.IsActive).ToListAsync();
        return Ok(templates.Select(t => new DocumentTemplateDto(t.Id, t.Name, t.DocumentType, t.Description, t.TemplateContent)));
    }

    [HttpPost("templates")]
    public async Task<ActionResult> CreateTemplate(DocumentTemplateDto req)
    {
        _db.DocumentTemplates.Add(new DocumentTemplate
        {
            Name = req.Name,
            DocumentType = req.DocumentType,
            Description = req.Description,
            TemplateContent = req.TemplateContent
        });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Template created." });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<List<EmployeeDocumentDto>>> GetEmployeeDocuments(int employeeId)
    {
        var docs = await _db.EmployeeDocuments
            .Include(d => d.VerifiedBy)
            .Where(d => d.EmployeeId == employeeId)
            .OrderByDescending(d => d.GeneratedOn)
            .ToListAsync();
        return Ok(docs.Select(d => MapDocument(d)).ToList());
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<List<EmployeeDocumentDto>>> GetExpiringDocuments([FromQuery] int? days)
    {
        var window = days ?? 60;
        var cutoff = DateTime.UtcNow.AddDays(window);
        var docs = await _db.EmployeeDocuments
            .Include(d => d.Employee)
            .Include(d => d.VerifiedBy)
            .Where(d => d.ExpiryDate != null && d.ExpiryDate <= cutoff && d.ExpiryDate >= DateTime.UtcNow)
            .OrderBy(d => d.ExpiryDate)
            .ToListAsync();
        return Ok(docs.Select(d => MapDocument(d, d.Employee?.FullName)).ToList());
    }

    [HttpPost("upload")]
    public async Task<ActionResult> UploadDocument([FromForm] UploadDocumentRequest req, IFormFile? file)
    {
        var employeeId = GetAuthenticatedEmployeeId();
        if (employeeId == null) return Unauthorized();

        // HR may upload for others; employees may upload their own onboarding/visa documents.
        var isAdmin = await IsAdminAsync();
        if (!isAdmin && employeeId.Value != req.EmployeeId)
            return Forbid();

        var employee = await _db.Employees.FindAsync(req.EmployeeId);
        if (employee == null) return NotFound(new { message = "Employee not found." });

        byte[] content = Array.Empty<byte>();
        string? mime = null;
        if (file != null && file.Length > 0)
        {
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "File too large. Maximum size is 10 MB." });

            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "application/pdf", "image/png", "image/jpeg", "image/jpg",
                "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain", "text/html", "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };
            if (!allowed.Contains(file.ContentType ?? ""))
                return BadRequest(new { message = "Unsupported file type. Allowed: PDF, PNG, JPG, DOC, DOCX, XLS, XLSX, TXT, HTML." });

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            content = ms.ToArray();
            mime = file.ContentType;
        }
        else
        {
            // No file supplied: allow metadata-only registration (e.g. for paper documents).
            content = System.Text.Encoding.UTF8.GetBytes($"[No file attached] {req.DocumentType} registered on {DateTime.UtcNow:yyyy-MM-dd}");
            mime = "text/plain";
        }

        var storedPath = await _oneDrive.UploadDocumentAsync(employee, $"{req.DocumentName}_{DateTime.UtcNow:yyyyMMdd}", content, mime ?? "application/octet-stream");

        var doc = new EmployeeDocument
        {
            EmployeeId = req.EmployeeId,
            DocumentType = req.DocumentType,
            DocumentName = req.DocumentName,
            FilePath = storedPath,
            MimeType = mime,
            ExpiryDate = req.ExpiryDate,
            Status = "Generated",
            VerificationStatus = "Pending"
        };
        _db.EmployeeDocuments.Add(doc);
        await _db.SaveChangesAsync();

        await _audit.LogAsync(employeeId.Value, employee.FullName, "DocumentUploaded", "EmployeeDocument", doc.Id,
            $"Uploaded {req.DocumentType}: {req.DocumentName}", after: new { doc.Status, storedPath });

        return Ok(new { message = "Document uploaded and stored in the employee OneDrive folder.", id = doc.Id, storedPath });
    }

    [HttpPut("{id}/verify")]
    public async Task<ActionResult> VerifyDocument(int id, VerifyDocumentRequest req)
    {
        var actorId = GetAuthenticatedEmployeeId();
        if (actorId == null || !await IsAdminAsync()) return Forbid();

        var doc = await _db.EmployeeDocuments.FindAsync(id);
        if (doc == null) return NotFound();

        doc.VerificationStatus = req.Verified ? "Verified" : "Rejected";
        doc.VerifiedOn = DateTime.UtcNow;
        doc.VerifiedById = actorId;
        doc.Status = req.Verified ? "Verified" : "Rejected";
        if (req.Verified) doc.VerifiedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _audit.LogAsync(actorId.Value, await GetActorNameAsync(actorId.Value), "DocumentVerified", "EmployeeDocument", doc.Id,
            $"{(req.Verified ? "Verified" : "Rejected")} {doc.DocumentType}: {doc.DocumentName}", after: new { doc.VerificationStatus });

        return Ok(new { message = req.Verified ? "Document verified." : "Document rejected." });
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        var doc = await _db.EmployeeDocuments.FindAsync(id);
        if (doc == null) return NotFound();
        var actorId = GetAuthenticatedEmployeeId();
        if (actorId == null) return Unauthorized();
        if (actorId.Value != doc.EmployeeId && !await IsAdminAsync()) return Forbid();

        if (string.IsNullOrWhiteSpace(doc.FilePath)) return NotFound(new { message = "No stored file for this document." });

        var fullPath = Path.IsPathRooted(doc.FilePath) ? doc.FilePath : Path.Combine(Directory.GetCurrentDirectory(), doc.FilePath);
        if (!System.IO.File.Exists(fullPath)) return NotFound(new { message = "Stored file is missing." });

        var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var mime = ext switch
        {
            ".html" or ".htm" => "text/html",
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            _ => doc.MimeType ?? "application/octet-stream"
        };
        return File(bytes, mime, $"{doc.DocumentName}{ext}");
    }

    private static string ExtensionFor(string mime) => mime switch
    {
        "application/pdf" => "pdf",
        "image/png" => "png",
        "image/jpeg" => "jpg",
        "text/html" => "html",
        "text/plain" => "txt",
        _ => "bin"
    };

    private async Task<bool> IsAdminAsync()
    {
        var id = GetAuthenticatedEmployeeId();
        if (id == null) return false;
        var role = await _db.Employees.AsNoTracking().Where(e => e.Id == id.Value).Select(e => e.Role!.Name).FirstOrDefaultAsync();
        return role is "HRL2" or "HR" or "Admin" or "SuperAdmin" or "OrganizationHead" or "Manager" or "ManagerL2";
    }

    private async Task<string> GetActorNameAsync(int id) =>
        await _db.Employees.AsNoTracking().Where(e => e.Id == id).Select(e => e.FullName).FirstOrDefaultAsync() ?? "";

    [HttpPost("generate/{employeeId}/{documentType}")]
    public async Task<ActionResult> GenerateDocument(int employeeId, string documentType)
    {
        var emp = await _db.Employees
            .Include(e => e.Role)
            .Include(e => e.SalaryStructure)
            .Include(e => e.Probation)
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        if (emp == null) return NotFound();

        var template = await _db.DocumentTemplates
            .FirstOrDefaultAsync(t => t.DocumentType == documentType && t.IsActive);

        var data = new Dictionary<string, string>
        {
            ["FullName"] = emp.FullName,
            ["Email"] = emp.Email,
            ["EmployeeCode"] = emp.EmployeeCode,
            ["Designation"] = emp.Designation,
            ["Department"] = emp.Department,
            ["JobRole"] = emp.JobRole,
            ["Location"] = emp.Location,
            ["JoinDate"] = emp.JoinDate.ToString("dd-MMM-yyyy"),
            ["EmploymentType"] = emp.EmploymentType,
            ["Role"] = emp.Role?.Label ?? emp.Role?.Name ?? "",
            ["Status"] = emp.Status,
            ["FixedPay"] = emp.SalaryStructure?.FixedPay.ToString("N2") ?? "TBD",
            ["VariablePay"] = emp.SalaryStructure?.VariablePay.ToString("N2") ?? "TBD",
            ["CTC"] = (emp.SalaryStructure != null
                ? (emp.SalaryStructure.FixedPay + emp.SalaryStructure.VariablePay).ToString("N2")
                : "TBD"),
            ["ProbationStartDate"] = emp.Probation?.StartDate.ToString("dd-MMM-yyyy") ?? "N/A",
            ["ProbationEndDate"] = emp.Probation?.CurrentEndDate?.ToString("dd-MMM-yyyy") ?? "N/A",
            ["GeneratedDate"] = DateTime.UtcNow.ToString("dd-MMM-yyyy"),
            ["CompanyName"] = "ReliSoft Technologies"
        };

        var autoFilledJson = JsonSerializer.Serialize(data);
        var name = $"{documentType}_{emp.FullName.Replace(" ", "_")}_{DateTime.UtcNow:yyyyMMdd}";

        var doc = new EmployeeDocument
        {
            EmployeeId = employeeId,
            TemplateId = template?.Id,
            DocumentType = documentType,
            DocumentName = name,
            AutoFilledData = autoFilledJson,
            Status = "Generated"
        };
        _db.EmployeeDocuments.Add(doc);
        await _db.SaveChangesAsync();

        var content = template?.TemplateContent ?? "";
        foreach (var kv in data) content = content.Replace($"{{{{{kv.Key}}}}}", kv.Value);

        var dir = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "Documents", employeeId.ToString());
        Directory.CreateDirectory(dir);
        var filePath = Path.Combine(dir, $"{name}.html");
        await System.IO.File.WriteAllTextAsync(filePath, content);
        doc.FilePath = filePath;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"{documentType} generated.", id = doc.Id, data, content });
    }

    [HttpPost("{id}/mark-sent")]
    public async Task<ActionResult> MarkSent(int id)
    {
        var doc = await _db.EmployeeDocuments.FindAsync(id);
        if (doc == null) return NotFound();
        doc.Status = "Sent";
        doc.SentOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Document marked as sent." });
    }

    [HttpGet("auto-generate/{employeeId}")]
    public async Task<ActionResult> AutoGenerateAll(int employeeId)
    {
        var emp = await _db.Employees
            .Include(e => e.Probation)
            .FirstOrDefaultAsync(e => e.Id == employeeId);
        if (emp == null) return NotFound();

        var types = new List<string>();
        if (emp.EmploymentType == "Intern")
            types.AddRange(new[] { "OfferLetter", "InternshipCompletionLetter" });
        else
        {
            types.AddRange(new[] { "OfferLetter", "JoiningLetter", "Form16" });
            if (emp.Probation?.CurrentEndDate != null && emp.Probation.CurrentEndDate.Value <= DateTime.UtcNow)
                types.Add("ProbationConfirmation");
        }

        var results = new List<object>();
        foreach (var t in types)
        {
            var exists = await _db.EmployeeDocuments.AnyAsync(d => d.EmployeeId == employeeId && d.DocumentType == t);
            if (!exists)
            {
                var result = await GenerateDocument(employeeId, t);
                results.Add(new { type = t, generated = true });
            }
            else results.Add(new { type = t, generated = false, reason = "Already exists" });
        }

        return Ok(new { message = "Auto-generation complete.", results });
    }

    private static EmployeeDocumentDto MapDocument(EmployeeDocument d, string? employeeName = null) => new(
        d.Id, d.EmployeeId, employeeName, d.DocumentType, d.DocumentName, d.Status, d.GeneratedOn, d.SentOn,
        d.AutoFilledData, d.ExpiryDate, d.VerificationStatus, d.VerifiedOn, d.VerifiedBy?.FullName, d.OneDrivePath
    );
}

public record DocumentTemplateDto(int Id, string Name, string DocumentType, string? Description, string? TemplateContent);
public record EmployeeDocumentDto(
    int Id, int EmployeeId, string? EmployeeName, string DocumentType, string DocumentName,
    string Status, DateTime GeneratedOn, DateTime? SentOn, string? AutoFilledData,
    DateTime? ExpiryDate, string VerificationStatus, DateTime? VerifiedOn, string? VerifiedByName, string? OneDrivePath
);
