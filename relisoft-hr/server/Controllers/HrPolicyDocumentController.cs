using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/hr-policy-docs")]
[Authorize]
public class HrPolicyDocumentController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<HrPolicyDocumentController> _logger;

    public HrPolicyDocumentController(AppDbContext db, IWebHostEnvironment env, ILogger<HrPolicyDocumentController> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    private bool IsHrOrAdmin()
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        return role is "HR" or "HRL2" or "Admin" or "SuperAdmin";
    }

    [HttpGet]
    public async Task<ActionResult> GetDocuments([FromQuery] string? category, [FromQuery] string? search)
    {
        try
        {
            var query = _db.HrPolicyDocuments.Where(d => d.IsActive).AsQueryable();

            if (!string.IsNullOrEmpty(category))
                query = query.Where(d => d.Category == category);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(d => d.Title.Contains(search) || (d.Description != null && d.Description.Contains(search)) || (d.Tags != null && d.Tags.Contains(search)));

            var docs = await query
                .OrderByDescending(d => d.UploadedOn)
                .Select(d => new HrPolicyDocumentDto(
                    d.Id, d.Title, d.Category, d.Description, d.FileName, d.FileSize, d.MimeType,
                    d.UploadedById, d.UploadedBy != null ? d.UploadedBy.FullName : null,
                    d.UploadedOn, d.EffectiveDate, d.ExpiryDate, d.IsActive, d.Version, d.Tags))
                .ToListAsync();

            return Ok(docs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching HR policy documents");
            return StatusCode(500, new { message = "Error fetching documents." });
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _db.HrPolicyDocuments
            .Where(d => d.IsActive)
            .Select(d => d.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetDocument(int id)
    {
        var doc = await _db.HrPolicyDocuments
            .Include(d => d.UploadedBy)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doc == null) return NotFound();

        return Ok(new HrPolicyDocumentDto(
            doc.Id, doc.Title, doc.Category, doc.Description, doc.FileName, doc.FileSize, doc.MimeType,
            doc.UploadedById, doc.UploadedBy?.FullName, doc.UploadedOn,
            doc.EffectiveDate, doc.ExpiryDate, doc.IsActive, doc.Version, doc.Tags));
    }

    [HttpPost]
    [Authorize(Policy = "MinHR")]
    public async Task<ActionResult> UploadDocument([FromForm] CreateHrPolicyDocumentDto req, IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Please select a file to upload." });

            var uploadsDir = Path.Combine(_env.ContentRootPath, "App_Data", "HrPolicies");
            Directory.CreateDirectory(uploadsDir);

            var uniqueName = $"{Guid.NewGuid():N}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, uniqueName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var doc = new HrPolicyDocument
            {
                Title = req.Title,
                Category = req.Category,
                Description = req.Description,
                FileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                MimeType = file.ContentType,
                UploadedById = GetUserId(),
                UploadedOn = DateTime.UtcNow,
                EffectiveDate = req.EffectiveDate,
                ExpiryDate = req.ExpiryDate,
                Version = req.Version,
                Tags = req.Tags
            };

            _db.HrPolicyDocuments.Add(doc);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Document uploaded successfully.", id = doc.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading HR policy document");
            return StatusCode(500, new { message = "Error uploading document." });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "MinHR")]
    public async Task<ActionResult> UpdateDocument(int id, [FromBody] UpdateHrPolicyDocumentDto req)
    {
        var doc = await _db.HrPolicyDocuments.FindAsync(id);
        if (doc == null) return NotFound();

        if (req.Title != null) doc.Title = req.Title;
        if (req.Category != null) doc.Category = req.Category;
        if (req.Description != null) doc.Description = req.Description;
        if (req.EffectiveDate.HasValue) doc.EffectiveDate = req.EffectiveDate;
        if (req.ExpiryDate.HasValue) doc.ExpiryDate = req.ExpiryDate;
        if (req.IsActive.HasValue) doc.IsActive = req.IsActive.Value;
        if (req.Version != null) doc.Version = req.Version;
        if (req.Tags != null) doc.Tags = req.Tags;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Document updated." });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "MinHR")]
    public async Task<ActionResult> DeleteDocument(int id)
    {
        var doc = await _db.HrPolicyDocuments.FindAsync(id);
        if (doc == null) return NotFound();

        doc.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Document deleted." });
    }

    [HttpGet("{id}/download")]
    public async Task<ActionResult> DownloadDocument(int id)
    {
        var doc = await _db.HrPolicyDocuments.FindAsync(id);
        if (doc == null) return NotFound();

        if (!System.IO.File.Exists(doc.FilePath))
            return NotFound(new { message = "File not found on server." });

        var bytes = await System.IO.File.ReadAllBytesAsync(doc.FilePath);
        return File(bytes, doc.MimeType ?? "application/octet-stream", doc.FileName);
    }
}
