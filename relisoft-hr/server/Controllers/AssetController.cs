using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/assets")]
public class AssetController : ControllerBase
{
    private readonly AppDbContext _db;

    public AssetController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<AssetDto>>> GetAssets()
    {
        var assets = await _db.Assets.OrderBy(a => a.Name).ToListAsync();
        return Ok(assets.Select(a => new AssetDto(a.Id, a.Name, a.AssetTag, a.Category, a.SerialNumber, a.Status)).ToList());
    }

    [HttpPost]
    public async Task<ActionResult> CreateAsset(AssetDto req)
    {
        var asset = new Asset
        {
            Name = req.Name,
            AssetTag = req.AssetTag,
            Category = req.Category,
            SerialNumber = req.SerialNumber,
            Status = req.Status
        };
        _db.Assets.Add(asset);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Asset created.", id = asset.Id });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateAsset(int id, AssetDto req)
    {
        var asset = await _db.Assets.FindAsync(id);
        if (asset == null) return NotFound();
        asset.Name = req.Name;
        asset.AssetTag = req.AssetTag;
        asset.Category = req.Category;
        asset.SerialNumber = req.SerialNumber;
        asset.Status = req.Status;
        asset.UpdatedOn = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Asset updated." });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<List<EmployeeAssetDto>>> GetEmployeeAssets(int employeeId)
    {
        var assets = await _db.EmployeeAssets
            .Include(ea => ea.Asset)
            .Include(ea => ea.Employee)
            .Where(ea => ea.EmployeeId == employeeId)
            .ToListAsync();
        return Ok(assets.Select(MapEmployeeAsset).ToList());
    }

    [HttpPost("assign")]
    public async Task<ActionResult> AssignAsset(int employeeId, int assetId)
    {
        var emp = await _db.Employees.FindAsync(employeeId);
        var asset = await _db.Assets.FindAsync(assetId);
        if (emp == null || asset == null) return NotFound();
        if (asset.Status != "Available") return BadRequest(new { message = "Asset not available." });

        _db.EmployeeAssets.Add(new EmployeeAsset
        {
            EmployeeId = employeeId,
            AssetId = assetId,
            AssignedOn = DateTime.UtcNow
        });
        asset.Status = "Assigned";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Asset assigned." });
    }

    [HttpPost("return/{id}")]
    public async Task<ActionResult> ReturnAsset(int id)
    {
        var empAsset = await _db.EmployeeAssets.Include(ea => ea.Asset).FirstOrDefaultAsync(ea => ea.Id == id);
        if (empAsset == null) return NotFound();
        empAsset.ReturnedOn = DateTime.UtcNow;
        empAsset.Status = "Returned";
        if (empAsset.Asset != null) empAsset.Asset.Status = "Available";
        await _db.SaveChangesAsync();
        return Ok(new { message = "Asset returned." });
    }

    [HttpGet("all-assignments")]
    public async Task<ActionResult<List<EmployeeAssetDto>>> GetAllAssignments()
    {
        var assets = await _db.EmployeeAssets
            .Include(ea => ea.Asset)
            .Include(ea => ea.Employee)
            .OrderByDescending(ea => ea.AssignedOn)
            .ToListAsync();
        return Ok(assets.Select(MapEmployeeAsset).ToList());
    }

    private static EmployeeAssetDto MapEmployeeAsset(EmployeeAsset ea) => new(
        ea.Id, ea.EmployeeId, ea.Employee?.FullName ?? "", ea.AssetId,
        ea.Asset?.Name ?? "", ea.Asset?.AssetTag ?? "", ea.Asset?.Category ?? "",
        ea.AssignedOn, ea.ReturnedOn, ea.Status
    );
}
