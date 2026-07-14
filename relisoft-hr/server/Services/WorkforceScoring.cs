namespace RelisoftHR.Services;

public class OrgHealthResult
{
    public double CompositeScore { get; set; }
    public double TrustScore { get; set; }
    public double ResilienceScore { get; set; }
    public double BurnoutRisk { get; set; }
    public double RetentionScore { get; set; }
    public int EmployeeCount { get; set; }
    public int SpofCount { get; set; }
    public double RevenueAtRisk { get; set; }
}

public class SpofRanking
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = "";
    public string Team { get; set; } = "";
    public string Role { get; set; } = "";
    public string Criticality { get; set; } = "";
    public int DependencyCount { get; set; }
    public double RevenueImpact { get; set; }
    public double SpofScore { get; set; }
    public bool HasBackup { get; set; }
}

public static class WorkforceScoring
{
    public static OrgHealthResult ComputeOrgHealth(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforceDependency> dependencies,
        List<Models.WorkforcePerformance> performances,
        List<Models.WorkforceWorkload> workloads,
        List<Models.WorkforceProject> projects)
    {
        int count = employees.Count;
        if (count == 0) return new OrgHealthResult();

        // Trust Score: backup coverage + documentation quality
        double backupCoverage = employees.Count(e => e.BackupAvailable == "Yes") / (double)count;
        double trustScore = Math.Round(backupCoverage * 100, 1);

        // Resilience Score: criticality distribution
        double highCritical = employees.Count(e => e.Criticality == "High") / (double)count;
        double resilienceScore = Math.Round((1 - highCritical) * 100, 1);

        // Burnout Risk: weekly hours + overdue tasks + PTO
        double avgHours = workloads.Any() ? workloads.Average(w => w.WeeklyHours) : 0;
        double avgOverdue = workloads.Any() ? workloads.Average(w => w.OverdueTasks) : 0;
        double burnoutRaw = (avgHours / 60) * 0.5 + (avgOverdue / 10) * 0.3 + 0.2;
        double burnoutRisk = Math.Round(Math.Min(burnoutRaw, 1.0) * 100, 1);

        // Retention Score: engagement + tenure
        double avgEngagement = performances.Any() ? performances.Average(p => p.EngagementScore) : 5;
        double avgTenure = employees.Average(e => e.TenureYears);
        double retentionScore = Math.Round((avgEngagement / 10) * 60 + Math.Min(avgTenure / 10, 1) * 40, 1);

        // SPOF count
        int spofCount = dependencies
            .GroupBy(d => d.OwnerId)
            .Count(g => g.Count() > 3 && !employees.Any(e => e.Id == g.Key && e.BackupAvailable == "Yes"));

        // Revenue at risk
        double revenueAtRisk = 0;
        var spofEmployees = dependencies
            .GroupBy(d => d.OwnerId)
            .Where(g => g.Count() > 2)
            .Select(g => g.Key);
        foreach (var empId in spofEmployees)
        {
            var emp = employees.FirstOrDefault(e => e.Id == empId);
            if (emp != null) revenueAtRisk += emp.AnnualSalaryUsd * 3;
        }

        // Composite score
        double composite = Math.Round((trustScore + resilienceScore + (100 - burnoutRisk) + retentionScore) / 4, 1);

        return new OrgHealthResult
        {
            CompositeScore = composite,
            TrustScore = trustScore,
            ResilienceScore = resilienceScore,
            BurnoutRisk = burnoutRisk,
            RetentionScore = retentionScore,
            EmployeeCount = count,
            SpofCount = spofCount,
            RevenueAtRisk = revenueAtRisk
        };
    }

    public static List<SpofRanking> RankSpofs(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforceDependency> dependencies,
        List<Models.WorkforceProject> projects)
    {
        var depCounts = dependencies.GroupBy(d => d.OwnerId)
            .ToDictionary(g => g.Key, g => g.Count());

        var spofs = employees.Where(e => depCounts.ContainsKey(e.Id) && depCounts[e.Id] > 0)
            .Select(e =>
            {
                int depCount = depCounts.GetValueOrDefault(e.Id, 0);
                double revenueImpact = projects.Where(p => p.Team == e.Team).Sum(p => p.AnnualContractValueUsd);
                double score = Math.Round((double)(
                    (e.Criticality == "High" ? 40 : e.Criticality == "Medium" ? 20 : 10) +
                    Math.Min(depCount * 10, 30) +
                    (e.BackupAvailable == "No" ? 20 : 0) +
                    Math.Min(e.ExperienceYears * 2, 20)), 1);
                return new SpofRanking
                {
                    EmployeeId = e.Id,
                    EmployeeName = e.FullName,
                    Team = e.Team,
                    Role = e.Role,
                    Criticality = e.Criticality,
                    DependencyCount = depCount,
                    RevenueImpact = revenueImpact,
                    SpofScore = score,
                    HasBackup = e.BackupAvailable == "Yes"
                };
            })
            .OrderByDescending(s => s.SpofScore)
            .ToList();

        return spofs;
    }

    public static List<object> AnalyzeSkillGaps(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforceKnowledge> knowledge)
    {
        var teams = employees.GroupBy(e => e.Team);
        var gaps = new List<object>();
        foreach (var team in teams)
        {
            var teamKnowledge = knowledge.Where(k => k.EmployeeName == team.First().FullName || team.Any(e => e.FullName == k.EmployeeName)).ToList();
            var areas = teamKnowledge.GroupBy(k => k.KnowledgeArea);
            foreach (var area in areas)
            {
                var avgProficiency = area.Average(a =>
                    a.Proficiency == "Expert" ? 4 : a.Proficiency == "Advanced" ? 3 : a.Proficiency == "Intermediate" ? 2 : 1);
                var docLevel = area.Min(a =>
                    a.DocumentationLevel == "High" ? 3 : a.DocumentationLevel == "Medium" ? 2 : 1);
                if (avgProficiency < 2.5 || docLevel < 2)
                {
                    gaps.Add(new
                    {
                        Team = team.Key,
                        KnowledgeArea = area.Key,
                        AvgProficiency = Math.Round(avgProficiency, 1),
                        DocumentationLevel = area.Min(a => a.DocumentationLevel),
                        EmployeeCount = area.Count(),
                        RiskLevel = avgProficiency < 1.5 ? "High" : "Medium",
                        Suggestion = docLevel < 2 ? "Improve documentation" : avgProficiency < 2 ? "Provide training" : "Cross-train team members"
                    });
                }
            }
        }
        return gaps;
    }

    public static List<object> AnalyzeSuccession(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforcePerformance> performances)
    {
        return employees
            .Where(e => e.Criticality == "High")
            .Select(e =>
            {
                var perf = performances.FirstOrDefault(p => p.EmployeeId == e.Id);
                return new
                {
                    e.Id, e.FullName, e.Team, e.Role, e.TenureYears,
                    Performance = perf?.PerformanceRating ?? "N/A",
                    EngagementScore = perf?.EngagementScore ?? 0,
                    HasBackup = e.BackupAvailable == "Yes",
                    ReadinessScore = Math.Round(
                        (e.BackupAvailable == "Yes" ? 30 : 0) +
                        Math.Min(e.TenureYears * 5, 20) +
                        (perf?.EngagementScore ?? 5) * 5 +
                        (e.Criticality == "High" ? -10 : 0), 1),
                    ReadinessLevel = (e.BackupAvailable == "Yes" && (perf?.EngagementScore ?? 0) >= 7) ? "Ready" :
                                     e.BackupAvailable == "Yes" ? "Developing" : "At Risk"
                };
            })
            .OrderBy(s => s.ReadinessScore)
            .ToList<object>();
    }

    public static object AnalyzeKnowledgeConcentration(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforceKnowledge> knowledge)
    {
        var areaCounts = knowledge.GroupBy(k => k.KnowledgeArea)
            .Select(g => new
            {
                Area = g.Key,
                ExpertCount = g.Count(k => k.Proficiency == "Expert"),
                TotalCount = g.Count(),
                AvgDocLevel = g.Average(k =>
                    k.DocumentationLevel == "High" ? 3 : k.DocumentationLevel == "Medium" ? 2 : 1),
                Employees = g.Select(k => k.EmployeeName).Distinct().ToList()
            })
            .OrderBy(a => a.ExpertCount)
            .ToList();

        var highRisk = areaCounts.Where(a => a.ExpertCount <= 1 && a.TotalCount <= 2 && a.AvgDocLevel < 2).ToList();

        return new
        {
            TotalAreas = areaCounts.Count,
            HighRiskAreas = highRisk.Select(a => new
            {
                a.Area, a.ExpertCount, a.TotalCount,
                BusFactor = a.ExpertCount,
                RiskLevel = "High",
                Suggestion = $"Cross-train at least {3 - a.ExpertCount} more employees in {a.Area}"
            }),
            AllAreas = areaCounts,
            BusFactorScore = Math.Round((double)(areaCounts.Count - highRisk.Count) / (areaCounts.Count > 0 ? areaCounts.Count : 1) * 100, 1)
        };
    }

    public static object AnalyzeWorkforceReadiness(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforceProject> projects,
        List<Models.WorkforceWorkload> workloads)
    {
        var activeProjects = projects.Where(p => p.Status == "Active").ToList();
        var teamWorkloads = workloads.GroupBy(w => w.Team)
            .Select(g => new
            {
                Team = g.Key,
                AvgHours = g.Average(w => w.WeeklyHours),
                TotalOverdue = g.Sum(w => w.OverdueTasks),
                Headcount = g.Count(),
                ActiveProjCount = activeProjects.Count(p => p.Team == g.Key)
            }).ToList();

        return new
        {
            TotalActiveProjects = activeProjects.Count,
            TotalContractValue = activeProjects.Sum(p => p.AnnualContractValueUsd),
            TotalEmployees = employees.Count,
            ReadinessScore = Math.Round(teamWorkloads.Any()
                ? teamWorkloads.Average(t => Math.Max(0, 100 - (t.AvgHours / 60) * 50 - t.TotalOverdue * 5))
                : 0, 1),
            TeamReadiness = teamWorkloads.Select(t => new
            {
                t.Team,
                t.Headcount,
                t.AvgHours,
                t.TotalOverdue,
                t.ActiveProjCount,
                CapacityUtilization = Math.Round(t.AvgHours / 40 * 100, 1),
                ReadinessPct = Math.Round(Math.Max(0, 100 - (t.AvgHours / 40) * 50 - t.TotalOverdue * 5), 1)
            })
        };
    }

    public static OrgHealthResult SimulateWhatIf(
        List<Models.WorkforceEmployee> employees,
        List<Models.WorkforceDependency> dependencies,
        List<Models.WorkforcePerformance> performances,
        List<Models.WorkforceWorkload> workloads,
        List<Models.WorkforceProject> projects,
        List<int> departingEmployeeIds)
    {
        var remaining = employees.Where(e => !departingEmployeeIds.Contains(e.Id)).ToList();
        if (!remaining.Any()) return new OrgHealthResult { CompositeScore = 0 };

        var filteredDeps = dependencies.Where(d => !departingEmployeeIds.Contains(d.OwnerId)).ToList();
        var filteredPerf = performances.Where(p => !departingEmployeeIds.Contains(p.EmployeeId)).ToList();
        var filteredWork = workloads.Where(w => !departingEmployeeIds.Contains(w.EmployeeId)).ToList();

        return ComputeOrgHealth(remaining, filteredDeps, filteredPerf, filteredWork, projects);
    }
}
