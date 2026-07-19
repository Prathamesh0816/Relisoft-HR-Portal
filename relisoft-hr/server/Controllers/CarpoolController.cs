using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/carpool")]
[Authorize]
public class CarpoolController : ControllerBase
{
    private readonly AppDbContext _db;
    public CarpoolController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("routes")]
    public async Task<ActionResult> GetMyRoute()
    {
        var empId = GetUserId();
        var route = await _db.CommuteRoutes.FirstOrDefaultAsync(r => r.EmployeeId == empId && r.IsActive);
        return Ok(route);
    }

    [HttpPost("routes")]
    public async Task<ActionResult> SaveRoute([FromBody] CommuteRouteRequest req)
    {
        var empId = GetUserId();
        var existing = await _db.CommuteRoutes.FirstOrDefaultAsync(r => r.EmployeeId == empId && r.IsActive);
        CommuteRoute route;
        if (existing != null)
        {
            HttpConcurrency.RequireIfMatch(Request, _db, existing);
            route = existing;
            existing.SourceArea = req.SourceArea;
            existing.DestinationArea = req.DestinationArea;
            existing.CommuteDays = req.CommuteDays;
            existing.PreferredTime = req.PreferredTime;
            existing.IsDriver = req.IsDriver;
            existing.Capacity = req.Capacity;
        }
        else
        {
            route = new CommuteRoute
            {
                EmployeeId = empId, SourceArea = req.SourceArea, DestinationArea = req.DestinationArea,
                CommuteDays = req.CommuteDays, PreferredTime = req.PreferredTime,
                IsDriver = req.IsDriver, Capacity = req.Capacity, IsActive = true
            };
            _db.CommuteRoutes.Add(route);
        }
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, route.RowVersion);
        return Ok(new { message = "Route saved", route.RowVersion });
    }

    [HttpDelete("routes")]
    public async Task<ActionResult> DeleteRoute()
    {
        var empId = GetUserId();
        var route = await _db.CommuteRoutes.FirstOrDefaultAsync(r => r.EmployeeId == empId && r.IsActive);
        if (route == null) return NotFound();
        HttpConcurrency.RequireIfMatch(Request, _db, route);
        route.IsActive = false;
        _db.SoftDelete(route, empId);
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, route.RowVersion);
        return Ok(new { message = "Route removed" });
    }

    [HttpGet("matches")]
    public async Task<ActionResult> FindMatches()
    {
        var empId = GetUserId();
        var myRoute = await _db.CommuteRoutes.FirstOrDefaultAsync(r => r.EmployeeId == empId && r.IsActive);
        if (myRoute == null)
            return Ok(new List<object>());
        var matches = await _db.CommuteRoutes
            .Include(r => r.Employee)
            .Where(r => r.Id != myRoute.Id && r.IsActive
                && r.SourceArea == myRoute.SourceArea
                && r.DestinationArea == myRoute.DestinationArea)
            .ToListAsync();
        return Ok(matches.Select(r => new
        {
            r.Id, r.SourceArea, r.DestinationArea, r.CommuteDays,
            r.PreferredTime, r.IsDriver, r.Capacity,
            EmployeeName = r.Employee?.FullName,
            EmployeeId = r.EmployeeId
        }));
    }

    [HttpGet("groups")]
    public async Task<ActionResult> GetGroups()
    {
        var empId = GetUserId();
        var groups = await _db.CarpoolGroups
            .Include(g => g.Members).ThenInclude(m => m.Employee)
            .Where(g => g.Members.Any(m => m.EmployeeId == empId))
            .ToListAsync();
        return Ok(groups.Select(g => new
        {
            g.Id, g.Name, g.CreatedOn,
            Members = g.Members.Select(m => new
            {
                m.EmployeeId, EmployeeName = m.Employee?.FullName, m.IsDriver, m.JoinedOn
            })
        }));
    }

    [HttpPost("groups")]
    public async Task<ActionResult> CreateGroup([FromBody] CarpoolGroupRequest req)
    {
        var empId = GetUserId();
        var group = new CarpoolGroup { Name = req.Name };
        group.Members.Add(new CarpoolMember { EmployeeId = empId, IsDriver = true });
        _db.CarpoolGroups.Add(group);
        await _db.SaveChangesAsync();
        return Ok(new { group.Id, group.Name });
    }

    [HttpPost("groups/{groupId}/join")]
    public async Task<ActionResult> JoinGroup(int groupId)
    {
        var empId = GetUserId();
        var group = await _db.CarpoolGroups.Include(g => g.Members).FirstOrDefaultAsync(g => g.Id == groupId);
        if (group == null) return NotFound();
        if (group.Members.Any(m => m.EmployeeId == empId))
            return BadRequest(new { message = "Already a member" });
        group.Members.Add(new CarpoolMember { GroupId = groupId, EmployeeId = empId });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Joined" });
    }

    [HttpPost("groups/{groupId}/leave")]
    public async Task<ActionResult> LeaveGroup(int groupId)
    {
        var empId = GetUserId();
        var member = await _db.CarpoolMembers
            .FirstOrDefaultAsync(m => m.GroupId == groupId && m.EmployeeId == empId);
        if (member == null) return NotFound();
        _db.SoftDelete(member, empId);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Left" });
    }
}
