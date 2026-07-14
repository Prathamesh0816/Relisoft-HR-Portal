using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelisoftHR.Data;
using RelisoftHR.Models;
using RelisoftHR.Services;
using System.Text.Json;

namespace RelisoftHR.Controllers;

[ApiController]
[Route("api/resilience")]
[Authorize]
public class WorkforceResilienceController : ControllerBase
{
    private readonly AppDbContext _db;
    public WorkforceResilienceController(AppDbContext db) => _db = db;

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return claim != null ? int.Parse(claim) : 0;
    }

    [HttpGet("org-health")]
    public async Task<ActionResult> GetOrgHealth()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var dependencies = await _db.WorkforceDependencies.ToListAsync();
        var performances = await _db.WorkforcePerformances.ToListAsync();
        var workloads = await _db.WorkforceWorkloads.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();
        return Ok(WorkforceScoring.ComputeOrgHealth(employees, dependencies, performances, workloads, projects));
    }

    [HttpGet("employees")]
    public async Task<ActionResult> GetEmployees()
    {
        var list = await _db.WorkforceEmployees.OrderBy(e => e.FullName).ToListAsync();
        return Ok(list);
    }

    [HttpGet("employees/{id}")]
    public async Task<ActionResult> GetEmployee(int id)
    {
        var emp = await _db.WorkforceEmployees.FindAsync(id);
        if (emp == null) return NotFound();
        var perf = await _db.WorkforcePerformances.FirstOrDefaultAsync(p => p.EmployeeId == id);
        var workload = await _db.WorkforceWorkloads.FirstOrDefaultAsync(w => w.EmployeeId == id);
        var knowledge = await _db.WorkforceKnowledges.Where(k => k.EmployeeId == id).ToListAsync();
        var owned = await _db.WorkforceDependencies.Where(d => d.OwnerId == id).ToListAsync();
        var depended = await _db.WorkforceDependencies.Where(d => d.DependentId == id).ToListAsync();
        return Ok(new
        {
            Employee = emp,
            Performance = perf,
            Workload = workload,
            KnowledgeAreas = knowledge,
            OwnedDependencies = owned,
            DependedOnBy = depended
        });
    }

    [HttpPost("whatif")]
    public async Task<ActionResult> WhatIf([FromBody] WhatIfRequest req)
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var dependencies = await _db.WorkforceDependencies.ToListAsync();
        var performances = await _db.WorkforcePerformances.ToListAsync();
        var workloads = await _db.WorkforceWorkloads.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();

        var baseline = WorkforceScoring.ComputeOrgHealth(employees, dependencies, performances, workloads, projects);
        var projected = WorkforceScoring.SimulateWhatIf(employees, dependencies, performances, workloads, projects, req.DepartingEmployeeIds.ToList());
        var departingNames = employees.Where(e => req.DepartingEmployeeIds.Contains(e.Id)).Select(e => e.FullName).ToList();

        return Ok(new
        {
            Baseline = baseline,
            Projected = projected,
            Impact = Math.Round(baseline.CompositeScore - projected.CompositeScore, 1),
            DepartingNames = departingNames
        });
    }

    [HttpGet("spof-ranking")]
    public async Task<ActionResult> GetSpofRanking()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var dependencies = await _db.WorkforceDependencies.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();
        return Ok(WorkforceScoring.RankSpofs(employees, dependencies, projects));
    }

    [HttpGet("skill-gaps")]
    public async Task<ActionResult> GetSkillGaps()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var knowledge = await _db.WorkforceKnowledges.ToListAsync();
        return Ok(WorkforceScoring.AnalyzeSkillGaps(employees, knowledge));
    }

    [HttpGet("succession-planning")]
    public async Task<ActionResult> GetSuccessionPlanning()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var performances = await _db.WorkforcePerformances.ToListAsync();
        return Ok(WorkforceScoring.AnalyzeSuccession(employees, performances));
    }

    [HttpGet("knowledge-concentration")]
    public async Task<ActionResult> GetKnowledgeConcentration()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var knowledge = await _db.WorkforceKnowledges.ToListAsync();
        return Ok(WorkforceScoring.AnalyzeKnowledgeConcentration(employees, knowledge));
    }

    [HttpGet("workforce-readiness")]
    public async Task<ActionResult> GetWorkforceReadiness()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();
        var workloads = await _db.WorkforceWorkloads.ToListAsync();
        return Ok(WorkforceScoring.AnalyzeWorkforceReadiness(employees, projects, workloads));
    }

    [HttpGet("scenarios")]
    public async Task<ActionResult> GetScenarios()
    {
        var list = await _db.WorkforceScenarios.OrderByDescending(s => s.CreatedOn).ToListAsync();
        return Ok(list);
    }

    [HttpPost("scenarios")]
    public async Task<ActionResult> CreateScenario([FromBody] ScenarioRequest req)
    {
        List<int> departingIds = new();
        try
        {
            var config = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(req.Configuration);
            if (config != null && config.TryGetValue("departingEmployeeIds", out var ids))
                departingIds = JsonSerializer.Deserialize<List<int>>(ids.GetRawText()) ?? new();
        }
        catch { }

        var employees = await _db.WorkforceEmployees.ToListAsync();
        var dependencies = await _db.WorkforceDependencies.ToListAsync();
        var performances = await _db.WorkforcePerformances.ToListAsync();
        var workloads = await _db.WorkforceWorkloads.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();

        var baseline = WorkforceScoring.ComputeOrgHealth(employees, dependencies, performances, workloads, projects);
        OrgHealthResult projected;
        if (departingIds.Count > 0)
            projected = WorkforceScoring.SimulateWhatIf(employees, dependencies, performances, workloads, projects, departingIds);
        else
            projected = baseline;

        var scenario = new WorkforceScenario
        {
            Name = req.Name,
            Description = req.Description,
            Configuration = req.Configuration,
            BaselineScore = baseline.CompositeScore,
            ProjectedScore = projected.CompositeScore,
            Impact = Math.Round(baseline.CompositeScore - projected.CompositeScore, 1),
            Status = "Active",
            CreatedById = GetUserId()
        };
        _db.WorkforceScenarios.Add(scenario);
        await _db.SaveChangesAsync();
        return Ok(scenario);
    }

    [HttpGet("feedback")]
    public async Task<ActionResult> GetFeedback()
    {
        var list = await _db.WorkforceFeedbacks.OrderByDescending(f => f.CreatedOn).ToListAsync();
        return Ok(list);
    }

    [HttpPost("feedback")]
    public async Task<ActionResult> CreateFeedback([FromBody] FeedbackRequest req)
    {
        var emp = await _db.WorkforceEmployees.FirstOrDefaultAsync(e => e.FullName == req.EmployeeName);
        var feedback = new WorkforceFeedback
        {
            EmployeeId = emp?.Id ?? 0,
            EmployeeName = req.EmployeeName,
            ActionTitle = req.ActionTitle,
            Decision = req.Decision,
            Reason = req.Reason
        };
        _db.WorkforceFeedbacks.Add(feedback);
        await _db.SaveChangesAsync();
        return Ok(feedback);
    }

    [HttpGet("dependencies")]
    public async Task<ActionResult> GetDependencies()
    {
        var list = await _db.WorkforceDependencies.ToListAsync();
        return Ok(list);
    }

    [HttpGet("projects")]
    public async Task<ActionResult> GetProjects()
    {
        var list = await _db.WorkforceProjects.ToListAsync();
        return Ok(list);
    }

    [HttpPost("upload")]
    public async Task<ActionResult> Upload([FromBody] UploadRequest req)
    {
        var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        switch (req.TableName.ToLower())
        {
            case "employees":
                _db.WorkforceEmployees.RemoveRange(_db.WorkforceEmployees);
                var emps = req.Data.Select(d => JsonSerializer.Deserialize<WorkforceEmployee>(d.GetRawText(), opts)!).ToList();
                _db.WorkforceEmployees.AddRange(emps);
                break;
            case "projects":
                _db.WorkforceProjects.RemoveRange(_db.WorkforceProjects);
                var projs = req.Data.Select(d => JsonSerializer.Deserialize<WorkforceProject>(d.GetRawText(), opts)!).ToList();
                _db.WorkforceProjects.AddRange(projs);
                break;
            case "dependencies":
                _db.WorkforceDependencies.RemoveRange(_db.WorkforceDependencies);
                var deps = req.Data.Select(d => JsonSerializer.Deserialize<WorkforceDependency>(d.GetRawText(), opts)!).ToList();
                _db.WorkforceDependencies.AddRange(deps);
                break;
            case "knowledge":
                _db.WorkforceKnowledges.RemoveRange(_db.WorkforceKnowledges);
                var knw = req.Data.Select(d => JsonSerializer.Deserialize<WorkforceKnowledge>(d.GetRawText(), opts)!).ToList();
                _db.WorkforceKnowledges.AddRange(knw);
                break;
            case "performance":
                _db.WorkforcePerformances.RemoveRange(_db.WorkforcePerformances);
                var perf = req.Data.Select(d => JsonSerializer.Deserialize<WorkforcePerformance>(d.GetRawText(), opts)!).ToList();
                _db.WorkforcePerformances.AddRange(perf);
                break;
            case "workload":
                _db.WorkforceWorkloads.RemoveRange(_db.WorkforceWorkloads);
                var wl = req.Data.Select(d => JsonSerializer.Deserialize<WorkforceWorkload>(d.GetRawText(), opts)!).ToList();
                _db.WorkforceWorkloads.AddRange(wl);
                break;
            default:
                return BadRequest(new { message = $"Unknown table name: {req.TableName}" });
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = $"{req.TableName} data replaced successfully" });
    }

    [HttpGet("stress-test")]
    public async Task<ActionResult> StressTest()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var dependencies = await _db.WorkforceDependencies.ToListAsync();
        var performances = await _db.WorkforcePerformances.ToListAsync();
        var workloads = await _db.WorkforceWorkloads.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();

        var spofs = WorkforceScoring.RankSpofs(employees, dependencies, projects).Take(5).ToList();
        var results = new List<object>();
        var removedIds = new List<int>();

        foreach (var spof in spofs)
        {
            removedIds.Add(spof.EmployeeId);
            var remaining = employees.Where(e => !removedIds.Contains(e.Id)).ToList();
            var filteredDeps = dependencies.Where(d => !removedIds.Contains(d.OwnerId)).ToList();
            var filteredPerf = performances.Where(p => !removedIds.Contains(p.EmployeeId)).ToList();
            var filteredWork = workloads.Where(w => !removedIds.Contains(w.EmployeeId)).ToList();
            var health = WorkforceScoring.ComputeOrgHealth(remaining, filteredDeps, filteredPerf, filteredWork, projects);
            results.Add(new
            {
                step = results.Count + 1,
                removedEmployee = spof.EmployeeName,
                removedRole = spof.Role,
                remainingCount = remaining.Count,
                compositeScore = health.CompositeScore,
                trustScore = health.TrustScore,
                resilienceScore = health.ResilienceScore,
                burnoutRisk = health.BurnoutRisk,
                retentionScore = health.RetentionScore
            });
        }

        return Ok(results);
    }

    [HttpGet("report")]
    public async Task<ActionResult> GetReport()
    {
        var employees = await _db.WorkforceEmployees.ToListAsync();
        var dependencies = await _db.WorkforceDependencies.ToListAsync();
        var performances = await _db.WorkforcePerformances.ToListAsync();
        var workloads = await _db.WorkforceWorkloads.ToListAsync();
        var projects = await _db.WorkforceProjects.ToListAsync();
        var knowledge = await _db.WorkforceKnowledges.ToListAsync();

        var health = WorkforceScoring.ComputeOrgHealth(employees, dependencies, performances, workloads, projects);
        var spofs = WorkforceScoring.RankSpofs(employees, dependencies, projects);
        var gaps = WorkforceScoring.AnalyzeSkillGaps(employees, knowledge);
        var succession = WorkforceScoring.AnalyzeSuccession(employees, performances);
        var concentration = WorkforceScoring.AnalyzeKnowledgeConcentration(employees, knowledge);
        var readiness = WorkforceScoring.AnalyzeWorkforceReadiness(employees, projects, workloads);

        var rows = string.Concat(employees.Select(e =>
            $"<tr><td>{e.FullName}</td><td>{e.Team}</td><td>{e.Role}</td><td>{e.Criticality}</td><td>{e.BackupAvailable}</td><td>{e.ExperienceYears}</td></tr>"
        ));

        var spofRows = string.Concat(spofs.Select(s =>
            $"<tr><td>{s.EmployeeName}</td><td>{s.Team}</td><td>{s.Role}</td><td>{s.Criticality}</td><td>{s.DependencyCount}</td><td>{s.SpofScore}</td><td>{(s.HasBackup ? "Yes" : "No")}</td></tr>"
        ));

        var gapRows = string.Concat(gaps.Select(g =>
        {
            var dict = (IDictionary<string, object>)g;
            return $"<tr><td>{dict["Team"]}</td><td>{dict["KnowledgeArea"]}</td><td>{dict["AvgProficiency"]}</td><td>{dict["DocumentationLevel"]}</td><td>{dict["RiskLevel"]}</td><td>{dict["Suggestion"]}</td></tr>";
        }));

        var succRows = string.Concat(succession.Select(s =>
        {
            var dict = (IDictionary<string, object>)s;
            return $"<tr><td>{dict["FullName"]}</td><td>{dict["Team"]}</td><td>{dict["Role"]}</td><td>{dict["ReadinessLevel"]}</td><td>{dict["ReadinessScore"]}</td><td>{dict["HasBackup"]}</td></tr>";
        }));

        var concentJson = JsonSerializer.Serialize(concentration, new JsonSerializerOptions { WriteIndented = true });
        var readinessJson = JsonSerializer.Serialize(readiness, new JsonSerializerOptions { WriteIndented = true });

        var html = $@"<!DOCTYPE html>
<html><head><meta charset=""utf-8"">
<title>Workforce Resilience Report</title>
<style>
body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #333; }}
h1 {{ color: #1a237e; border-bottom: 3px solid #1a237e; padding-bottom: 8px; }}
h2 {{ color: #283593; margin-top: 30px; }}
table {{ border-collapse: collapse; width: 100%; margin: 12px 0 24px; }}
th, td {{ border: 1px solid #ccc; padding: 8px 12px; text-align: left; }}
th {{ background: #1a237e; color: #fff; }}
tr:nth-child(even) {{ background: #f5f5f5; }}
.score-card {{ display: inline-block; margin: 8px 16px 8px 0; padding: 14px 20px; border-radius: 8px; color: #fff; min-width: 140px; }}
.score-card.green {{ background: #2e7d32; }}
.score-card.amber {{ background: #f57f17; }}
.score-card.red {{ background: #c62828; }}
.score-card.blue {{ background: #1565c0; }}
.score-card .label {{ font-size: 12px; opacity: 0.9; }}
.score-card .value {{ font-size: 26px; font-weight: 700; }}
pre {{ background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; }}
.footer {{ margin-top: 40px; color: #888; font-size: 12px; text-align: center; }}
</style></head><body>
<h1>Workforce Resilience Report</h1>
<p>Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>

<h2>Organizational Health Summary</h2>
<div class=""score-card {(health.CompositeScore >= 70 ? "green" : health.CompositeScore >= 40 ? "amber" : "red")}"">
    <div class=""label"">Composite Score</div>
    <div class=""value"">{health.CompositeScore}</div>
</div>
<div class=""score-card blue"">
    <div class=""label"">Trust Score</div>
    <div class=""value"">{health.TrustScore}</div>
</div>
<div class=""score-card blue"">
    <div class=""label"">Resilience Score</div>
    <div class=""value"">{health.ResilienceScore}</div>
</div>
<div class=""score-card {(health.BurnoutRisk >= 60 ? "red" : health.BurnoutRisk >= 30 ? "amber" : "green")}"">
    <div class=""label"">Burnout Risk</div>
    <div class=""value"">{health.BurnoutRisk}%</div>
</div>
<div class=""score-card {(health.RetentionScore >= 70 ? "green" : health.RetentionScore >= 40 ? "amber" : "red")}"">
    <div class=""label"">Retention Score</div>
    <div class=""value"">{health.RetentionScore}</div>
</div>
<p><strong>Employees:</strong> {health.EmployeeCount} &nbsp; <strong>SPOFs:</strong> {health.SpofCount} &nbsp; <strong>Revenue at Risk:</strong> ${health.RevenueAtRisk:N0}</p>

<h2>Employee Roster</h2>
<table><thead><tr><th>Name</th><th>Team</th><th>Role</th><th>Criticality</th><th>Backup</th><th>Experience</th></tr></thead><tbody>{rows}</tbody></table>

<h2>Top SPOF Rankings</h2>
<table><thead><tr><th>Name</th><th>Team</th><th>Role</th><th>Criticality</th><th>Dependencies</th><th>SPOF Score</th><th>Has Backup</th></tr></thead><tbody>{spofRows}</tbody></table>

<h2>Skill Gaps</h2>
<table><thead><tr><th>Team</th><th>Area</th><th>Avg Proficiency</th><th>Documentation</th><th>Risk Level</th><th>Suggestion</th></tr></thead><tbody>{gapRows}</tbody></table>

<h2>Succession Planning (High-Criticality Roles)</h2>
<table><thead><tr><th>Name</th><th>Team</th><th>Role</th><th>Readiness</th><th>Score</th><th>Has Backup</th></tr></thead><tbody>{succRows}</tbody></table>

<h2>Knowledge Concentration</h2>
<pre>{concentJson}</pre>

<h2>Workforce Readiness</h2>
<pre>{readinessJson}</pre>

<div class=""footer"">ReliSoft HR Portal — Workforce Resilience Module</div>
</body></html>";

        return Ok(html);
    }
}

public class WhatIfRequest
{
    public int[] DepartingEmployeeIds { get; set; } = [];
}

public class ScenarioRequest
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Configuration { get; set; } = "";
}

public class FeedbackRequest
{
    public string EmployeeName { get; set; } = "";
    public string ActionTitle { get; set; } = "";
    public string Decision { get; set; } = "";
    public string Reason { get; set; } = "";
}

public class UploadRequest
{
    public string TableName { get; set; } = "";
    public List<JsonElement> Data { get; set; } = new();
}
