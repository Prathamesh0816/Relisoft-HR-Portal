using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.DTOs;
using RelisoftHR.Models;
using RelisoftHR.Services;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/skills")]
[Authorize]
public class SkillsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SkillsController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet]
    public async Task<ActionResult> GetMySkills()
    {
        var empId = GetUserId();
        var skills = await _db.EmployeeSkills
            .Where(s => s.EmployeeId == empId)
            .OrderByDescending(s => s.EndorsementCount)
            .ToListAsync();
        return Ok(skills);
    }

    [HttpPost]
    public async Task<ActionResult> AddSkill([FromBody] EmployeeSkillRequest req)
    {
        var empId = GetUserId();
        var existing = await _db.EmployeeSkills
            .FirstOrDefaultAsync(s => s.EmployeeId == empId && s.SkillName == req.SkillName);
        if (existing != null)
            return BadRequest(new { message = "Skill already exists" });
        var skill = new EmployeeSkill
        {
            EmployeeId = empId,
            SkillName = req.SkillName,
            Category = req.Category
        };
        _db.EmployeeSkills.Add(skill);
        await _db.SaveChangesAsync();
        return Ok(skill);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> RemoveSkill(int id)
    {
        var skill = await _db.EmployeeSkills.FindAsync(id);
        if (skill == null) return NotFound();
        var employeeId = GetUserId();
        if (skill.EmployeeId != employeeId) return Forbid();
        HttpConcurrency.RequireIfMatch(Request, _db, skill);
        _db.SoftDelete(skill, employeeId);
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, skill.RowVersion);
        return Ok(new { message = "Removed" });
    }

    [HttpGet("directory")]
    public async Task<ActionResult> GetSkillsDirectory([FromQuery] string? search)
    {
        var query = _db.EmployeeSkills
            .Include(s => s.Employee)
            .AsQueryable();
        if (!string.IsNullOrEmpty(search))
        {
            var s = search.ToLower();
            query = query.Where(sk => sk.SkillName.ToLower().Contains(s) || sk.Category.ToLower().Contains(s));
        }
        var list = await query.OrderBy(sk => sk.SkillName).ToListAsync();
        return Ok(list.Select(s => new
        {
            s.Id, s.SkillName, s.Category, s.EndorsementCount, s.RowVersion,
            EmployeeName = s.Employee?.FullName,
            EmployeeId = s.EmployeeId
        }));
    }

    [HttpPost("{skillId}/endorse")]
    public async Task<ActionResult> EndorseSkill(int skillId)
    {
        var endorserId = GetUserId();
        var skill = await _db.EmployeeSkills.FindAsync(skillId);
        if (skill == null) return NotFound();
        if (skill.EmployeeId == endorserId)
            return BadRequest(new { message = "Cannot endorse your own skill" });
        var existing = await _db.SkillEndorsements
            .FirstOrDefaultAsync(e => e.EmployeeSkillId == skillId && e.EndorsedById == endorserId);
        if (existing != null)
            return BadRequest(new { message = "Already endorsed" });
        _db.SkillEndorsements.Add(new SkillEndorsement { EmployeeSkillId = skillId, EndorsedById = endorserId });
        skill.EndorsementCount++;
        await _db.SaveChangesAsync();
        return Ok(new { endorsementCount = skill.EndorsementCount });
    }
}

[ApiController]
[Route("api/brag-board")]
[Authorize]
public class BragBoardController : ControllerBase
{
    private readonly AppDbContext _db;
    public BragBoardController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet]
    public async Task<ActionResult> GetPosts()
    {
        var posts = await _db.BragPosts
            .Include(p => p.Employee)
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedOn)
            .ToListAsync();
        return Ok(posts.Select(p => new
        {
            p.Id, p.Message, p.LikeCount, p.CreatedOn, p.RowVersion,
            EmployeeName = p.Employee?.FullName,
            EmployeeId = p.EmployeeId
        }));
    }

    [HttpPost]
    public async Task<ActionResult> CreatePost([FromBody] BragPostRequest req)
    {
        var post = new BragPost
        {
            EmployeeId = GetUserId(),
            Message = req.Message,
            IsActive = true
        };
        _db.BragPosts.Add(post);
        await _db.SaveChangesAsync();
        return Ok(new { post.Id, post.Message, post.CreatedOn });
    }

    [HttpPost("{id}/like")]
    public async Task<ActionResult> LikePost(int id)
    {
        var empId = GetUserId();
        var post = await _db.BragPosts.FindAsync(id);
        if (post == null) return NotFound();
        var existing = await _db.BragLikes.FirstOrDefaultAsync(l => l.BragPostId == id && l.EmployeeId == empId);
        if (existing != null)
            return BadRequest(new { message = "Already liked" });
        _db.BragLikes.Add(new BragLike { BragPostId = id, EmployeeId = empId });
        post.LikeCount++;
        await _db.SaveChangesAsync();
        return Ok(new { likeCount = post.LikeCount });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePost(int id)
    {
        var post = await _db.BragPosts.FindAsync(id);
        if (post == null) return NotFound();
        var employeeId = GetUserId();
        if (post.EmployeeId != employeeId &&
            !User.IsInRole("HR") &&
            !User.IsInRole("HRL2") &&
            !User.IsInRole("OrganizationHead"))
            return Forbid();
        HttpConcurrency.RequireIfMatch(Request, _db, post);
        post.IsActive = false;
        _db.SoftDelete(post, employeeId);
        await _db.SaveChangesAsync();
        HttpConcurrency.SetETag(Response, post.RowVersion);
        return Ok(new { message = "Deleted" });
    }
}
