using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using System.Text.Json;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentController : ControllerBase
{
    private readonly AppDbContext _db;

    public DocumentController(AppDbContext db) => _db = db;

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
            .Where(d => d.EmployeeId == employeeId)
            .OrderByDescending(d => d.GeneratedOn)
            .ToListAsync();
        return Ok(docs.Select(MapDocument).ToList());
    }

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
        var emp = await _db.Employees.FindAsync(employeeId);
        if (emp == null) return NotFound();

        var types = new List<string>();
        if (emp.EmploymentType == "Intern")
            types.AddRange(new[] { "OfferLetter", "InternshipCompletionLetter" });
        else
            types.AddRange(new[] { "OfferLetter", "JoiningLetter", "Form16" });

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

    private static EmployeeDocumentDto MapDocument(EmployeeDocument d) => new(
        d.Id, d.EmployeeId, d.DocumentType, d.DocumentName, d.Status, d.GeneratedOn, d.SentOn, d.AutoFilledData
    );
}

public record DocumentTemplateDto(int Id, string Name, string DocumentType, string? Description, string? TemplateContent);
public record EmployeeDocumentDto(int Id, int EmployeeId, string DocumentType, string DocumentName, string Status, DateTime GeneratedOn, DateTime? SentOn, string? AutoFilledData);
