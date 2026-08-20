using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Services;
using System.Security.Claims;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private static readonly string[] AdminRoles = { "HRL2", "HR", "Admin", "SuperAdmin" };

    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Seeds the full demo dataset (idempotent) so every screen and endpoint
    /// has data and no route returns a record-not-found 404.
    /// </summary>
    [HttpPost("seed-demo")]
    public async Task<ActionResult> SeedDemo()
    {
        var employeeId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(employeeId, out var id))
            return Unauthorized(new { message = "Invalid token." });

        var employee = await _db.Employees.Include(e => e.Role).AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);
        if (employee?.Role?.Name is not string role || !AdminRoles.Contains(role))
            return Forbid();

        var report = await DemoSeedService.SeedAsync(_db);

        return Ok(new
        {
            message = "Demo data seeded successfully.",
            seeded = report
        });
    }
}