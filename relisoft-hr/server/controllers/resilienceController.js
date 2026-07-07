import ResilienceEmployee from '../models/ResilienceEmployee.js';
import ResilienceDependency from '../models/ResilienceDependency.js';
import ResilienceKnowledge from '../models/ResilienceKnowledge.js';
import ResilienceProject from '../models/ResilienceProject.js';
import ResilienceFeedback from '../models/ResilienceFeedback.js';
import ResilienceWeightConfig from '../models/ResilienceWeightConfig.js';
import {
  computeOrgHealth, getEmployeeProfile, simulateScenario,
  compareScenarios, setWeights, getWeights, resetWeights,
  computeSkillGaps, computeSuccessionPlanning, computeWorkforceReadiness,
  computeKnowledgeConcentration, computeSpofRanking, computeUpskilling,
} from '../utils/resilienceScoring.js';

async function loadAllData() {
  const employees = await ResilienceEmployee.find({ isActive: true }).lean();
  const dependencies = await ResilienceDependency.find().lean();
  const knowledge = await ResilienceKnowledge.find().lean();
  const projects = await ResilienceProject.find().lean();
  return { employees, dependencies, knowledge, projects };
}

export async function getOrgHealth(req, res, next) {
  try {
    const data = await loadAllData();
    const result = computeOrgHealth(data);
    res.json({ success: true, ...result, source: 'scoring-engine' });
  } catch (error) {
    next(error);
  }
}

export async function listEmployees(req, res, next) {
  try {
    const employees = await ResilienceEmployee.find({ isActive: true }).lean();
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(req, res, next) {
  try {
    const data = await loadAllData();
    const profile = getEmployeeProfile(req.params.name, data);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    next(error);
  }
}

export async function getSkillGaps(req, res, next) {
  try {
    const employees = await ResilienceEmployee.find({ isActive: true }).lean();
    const knowledge = await ResilienceKnowledge.find().lean();
    const gaps = computeSkillGaps({ employees, knowledge });
    res.json({ success: true, gaps });
  } catch (error) {
    next(error);
  }
}

export async function getSuccessionPlanning(req, res, next) {
  try {
    const employees = await ResilienceEmployee.find({ isActive: true }).lean();
    const dependencies = await ResilienceDependency.find().lean();
    const knowledge = await ResilienceKnowledge.find().lean();
    const result = computeSuccessionPlanning({ employees, dependencies, knowledge });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getWorkforceReadiness(req, res, next) {
  try {
    const employees = await ResilienceEmployee.find({ isActive: true }).lean();
    const projects = await ResilienceProject.find().lean();
    const knowledge = await ResilienceKnowledge.find().lean();
    const result = computeWorkforceReadiness({ employees, projects, knowledge });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getKnowledgeConcentration(req, res, next) {
  try {
    const knowledge = await ResilienceKnowledge.find().lean();
    const employees = await ResilienceEmployee.find({ isActive: true }).lean();
    const result = computeKnowledgeConcentration({ knowledge, employees });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getSpofRanking(req, res, next) {
  try {
    const data = await loadAllData();
    const spofs = computeSpofRanking(data);
    res.json({ success: true, spofs });
  } catch (error) {
    next(error);
  }
}

export async function getUpskilling(req, res, next) {
  try {
    const data = await loadAllData();
    const result = computeUpskilling(req.params.name, data);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function postWhatIf(req, res, next) {
  try {
    const { scenarioType, removedEmployees, workloadIncreasePct, restructureTeam } = req.body;
    const data = await loadAllData();

    const baseline = computeOrgHealth(data);
    const scenario = simulateScenario({
      ...data,
      scenarioType,
      removedEmployees: removedEmployees || [],
      workloadIncreasePct: workloadIncreasePct || 0,
      restructureTeam: restructureTeam || null,
    });
    const comparison = compareScenarios(baseline, scenario);

    res.json({ success: true, baseline, scenario, comparison });
  } catch (error) {
    next(error);
  }
}

export async function postPipeline(req, res, next) {
  const start = Date.now();
  try {
    const { scenarioType, removedEmployees, workloadIncreasePct, restructureTeam, useFallback } = req.body;
    const data = await loadAllData();

    const health = computeOrgHealth(data);
    const scenario = simulateScenario({
      ...data,
      scenarioType,
      removedEmployees: removedEmployees || [],
      workloadIncreasePct: workloadIncreasePct || 0,
      restructureTeam: restructureTeam || null,
    });

    const spofs = computeSpofRanking(data);
    const gaps = computeSkillGaps(data);

    const insights = [
      `Overall health score: ${health.overallHealth?.toFixed(1) || 'N/A'}`,
      `Scenario impact: ${scenario.healthDelta ? (scenario.healthDelta > 0 ? '+' : '') + scenario.healthDelta.toFixed(1) : 'neutral'}`,
      `${spofs.length} single point${spofs.length !== 1 ? 's' : ''} of failure identified`,
      `${gaps.length} skill gap${gaps.length !== 1 ? 's' : ''} detected across the workforce`,
      `Workforce readiness: ${health.workforceReadiness || 'N/A'}`,
    ];

    const risks = [
      ...spofs.map(s => ({ risk: `SPOF: ${s.name || s.employee || 'Unknown'}`, severity: s.severity || 'high', mitigatedBy: s.mitigation || 'Cross-train backup' })),
      ...gaps.slice(0, 3).map(g => ({ risk: `Skill gap: ${g.skill || g.name || 'Unknown'}`, severity: g.severity || 'medium', mitigatedBy: 'Training or hire' })),
    ];

    const simulation = {
      scenarioType: scenarioType || 'what-if',
      baselineHealth: health.overallHealth,
      projectedHealth: scenario.projectedHealth,
      healthDelta: scenario.healthDelta || (scenario.projectedHealth ? scenario.projectedHealth - health.overallHealth : 0),
      confidence: useFallback ? 0.7 : 0.85,
      duration: '30-90 days',
    };

    const coaching = [
      { area: 'Cross-training', priority: spofs.length > 2 ? 'high' : 'medium', recommendation: `Target ${Math.min(spofs.length, 3)} critical role${spofs.length !== 1 ? 's' : ''} for shadow program` },
      { area: 'Knowledge documentation', priority: gaps.length > 5 ? 'high' : 'medium', recommendation: 'Create runbooks for undocumented processes' },
      { area: 'Workload balancing', priority: workloadIncreasePct > 20 ? 'high' : 'low', recommendation: 'Consider temporary contractors or reallocation' },
    ];

    const governance = {
      compliance: 'All recommendations align with standard workforce resilience frameworks',
      reviewCycle: 'Quarterly',
      owner: 'Resilience Team',
      status: 'Recommended',
      nextReview: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    };

    const elapsed_seconds = (Date.now() - start) / 1000;

    res.json({
      success: true,
      insights,
      risks,
      simulation,
      coaching,
      governance,
      elapsed_seconds,
    });
  } catch (error) {
    next(error);
  }
}

export async function postFeedback(req, res, next) {
  try {
    const { employee, actionTitle, decision, reason } = req.body;
    const feedback = await ResilienceFeedback.create({ employee, actionTitle, decision, reason });
    res.status(201).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
}

export async function listFeedback(req, res, next) {
  try {
    const records = await ResilienceFeedback.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: records.length, feedback: records });
  } catch (error) {
    next(error);
  }
}

export async function generateSuggestions(req, res, next) {
  try {
    const data = await loadAllData();
    const spofs = computeSpofRanking(data);
    const gaps = computeSkillGaps(data);

    const suggestions = [];

    for (const spof of spofs.slice(0, 5)) {
      suggestions.push({
        type: 'cross-training',
        employee: spof.name || spof.employee || 'Unknown',
        action: `Cross-train ${Math.ceil((spof.riskScore || 1) * 2)} team member${Math.ceil((spof.riskScore || 1) * 2) !== 1 ? 's' : ''} on ${spof.skills?.join(', ') || 'critical tasks'}`,
        rationale: `Reduces SPOF risk from ${spof.severity || 'high'} to medium`,
        priority: spof.severity || 'high',
      });
    }

    for (const gap of gaps.slice(0, 5)) {
      suggestions.push({
        type: 'hiring',
        skill: gap.skill || gap.name || 'Unknown',
        action: `Hire or contract ${gap.missingCount || gap.count || 1} resource${((gap.missingCount || gap.count || 1) !== 1) ? 's' : ''} with ${gap.skill || gap.name || 'Unknown'} proficiency`,
        rationale: `Closes skill gap affecting ${gap.affectedProjects || gap.affectedCount || 'multiple'} project${((gap.affectedProjects || gap.affectedCount || 'multiple') !== 'multiple' && (Number(gap.affectedProjects || gap.affectedCount) === 1)) ? '' : 's'}`,
        priority: gap.severity || 'medium',
      });
    }

    suggestions.push({
      type: 'documentation',
      employee: 'Org-wide',
      action: 'Document critical processes and create knowledge base for top 10 SPOF roles',
      rationale: 'Reduces knowledge concentration risk and speeds up onboarding',
      priority: 'medium',
    });

    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
}

export async function applyDecisions(req, res, next) {
  try {
    const { acceptedIds, rejectedIds, userAdded, modified } = req.body;

    const before = await ResilienceFeedback.find().lean();

    if (acceptedIds?.length) {
      await ResilienceFeedback.updateMany(
        { _id: { $in: acceptedIds } },
        { $set: { applied: true, appliedAt: new Date() } }
      );
    }
    if (rejectedIds?.length) {
      await ResilienceFeedback.deleteMany({ _id: { $in: rejectedIds } });
    }
    if (userAdded?.length) {
      for (const item of userAdded) {
        await ResilienceFeedback.create({ ...item, decision: item.decision || 'accepted', applied: true, appliedAt: new Date() });
      }
    }
    if (modified?.length) {
      for (const item of modified) {
        await ResilienceFeedback.findByIdAndUpdate(item._id, { $set: item });
      }
    }

    const data = await loadAllData();
    const healthAfter = computeOrgHealth(data);
    const after = await ResilienceFeedback.find().lean();

    res.json({
      success: true,
      projectedScore: healthAfter.overallHealth,
      before: { count: before.length, records: before },
      after: { count: after.length, records: after },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalyticsWeights(req, res, next) {
  try {
    let config = await ResilienceWeightConfig.findOne().lean();
    if (!config) {
      const defaults = getWeights();
      return res.json({ success: true, weights: defaults, source: 'defaults' });
    }
    res.json({ success: true, weights: config, source: 'database' });
  } catch (error) {
    next(error);
  }
}

export async function setAnalyticsWeights(req, res, next) {
  try {
    const { indicatorWeights, burnoutSubWeights, retentionSubWeights, resilienceSubWeights, source } = req.body;

    const payload = {};
    if (indicatorWeights) payload.indicatorWeights = indicatorWeights;
    if (burnoutSubWeights) payload.burnoutSubWeights = burnoutSubWeights;
    if (retentionSubWeights) payload.retentionSubWeights = retentionSubWeights;
    if (resilienceSubWeights) payload.resilienceSubWeights = resilienceSubWeights;
    if (source) payload.source = source;

    let config = await ResilienceWeightConfig.findOne();
    if (config) {
      Object.assign(config, payload);
      await config.save();
    } else {
      config = await ResilienceWeightConfig.create(payload);
    }

    setWeights({
      indicatorWeights: payload.indicatorWeights,
      burnoutSubWeights: payload.burnoutSubWeights,
      retentionSubWeights: payload.retentionSubWeights,
      resilienceSubWeights: payload.resilienceSubWeights,
    });

    res.json({ success: true, weights: config.toObject(), source: 'database' });
  } catch (error) {
    next(error);
  }
}

export async function resetAnalyticsWeights(req, res, next) {
  try {
    await ResilienceWeightConfig.deleteMany({});
    resetWeights();
    res.json({ success: true, message: 'Weights reset to defaults' });
  } catch (error) {
    next(error);
  }
}

export async function generateAIWeights(req, res, next) {
  try {
    const data = await loadAllData();
    const health = computeOrgHealth(data);
    const spofs = computeSpofRanking(data);
    const gaps = computeSkillGaps(data);

    const spofRatio = spofs.length / Math.max(data.employees.length, 1);
    const gapRatio = gaps.length / Math.max(data.employees.length, 1);

    const suggested = {
      indicatorWeights: {
        retention: 0.30,
        burnout: 0.25,
        resilience: 0.25,
        workload: 0.20,
      },
      burnoutSubWeights: {
        workLifeBalance: 0.30,
        stressLevel: 0.30,
        engagement: 0.25,
        recoveryTime: 0.15,
      },
      retentionSubWeights: {
        tenure: 0.20,
        turnoverRisk: 0.35,
        satisfaction: 0.30,
        growth: 0.15,
      },
      resilienceSubWeights: {
        adaptability: 0.25,
        redundancy: 0.30,
        crossTraining: 0.25,
        knowledgeSharing: 0.20,
      },
    };

    if (spofRatio > 0.3) {
      suggested.indicatorWeights.resilience = 0.35;
      suggested.indicatorWeights.burnout = 0.20;
    }
    if (gapRatio > 0.4) {
      suggested.indicatorWeights.retention = 0.35;
      suggested.indicatorWeights.workload = 0.15;
    }

    const rationale = {
      overview: `Weights optimized for an org with ${data.employees.length} employees, ${spofs.length} SPOFs, and ${gaps.length} skill gaps.`,
      retentionNote: gapRatio > 0.4 ? 'Increased retention weight due to high skill gap ratio.' : 'Standard retention weighting.',
      resilienceNote: spofRatio > 0.3 ? 'Increased resilience weight due to high SPOF concentration.' : 'Standard resilience weighting.',
    };

    res.json({ success: true, suggestedWeights: suggested, rationale });
  } catch (error) {
    next(error);
  }
}

export async function getReport(req, res, next) {
  try {
    const { scenarioType, removed } = req.query;
    const data = await loadAllData();

    const health = computeOrgHealth(data);
    const spofs = computeSpofRanking(data);
    const gaps = computeSkillGaps(data);
    const readiness = computeWorkforceReadiness(data);
    const succession = computeSuccessionPlanning(data);

    const removedList = removed ? removed.split(',').map(s => s.trim()) : [];

    let scenarioImpact = null;
    if (scenarioType) {
      const scenario = simulateScenario({ ...data, scenarioType, removedEmployees: removedList });
      scenarioImpact = scenario.healthDelta || (scenario.projectedHealth ? scenario.projectedHealth - health.overallHealth : 0);
    }

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Workforce Resilience Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; color: #1a1a2e; padding: 40px; }
  .container { max-width: 1000px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px; }
  h1 { font-size: 28px; color: #16213e; border-bottom: 3px solid #0f3460; padding-bottom: 12px; margin-bottom: 24px; }
  h2 { font-size: 20px; color: #0f3460; margin: 24px 0 12px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0; }
  .card { background: #f8f9fc; border-radius: 8px; padding: 20px; border-left: 4px solid #0f3460; }
  .card .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }
  .card .value { font-size: 28px; font-weight: 700; color: #16213e; margin-top: 4px; }
  .card .value.positive { color: #27ae60; }
  .card .value.negative { color: #e74c3c; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eef0f5; font-size: 14px; }
  th { background: #f0f2f7; font-weight: 600; color: #16213e; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .badge.high { background: #fde8e8; color: #e74c3c; }
  .badge.medium { background: #fef3e2; color: #f39c12; }
  .badge.low { background: #e8f8f0; color: #27ae60; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eef0f5; font-size: 12px; color: #aaa; text-align: center; }
</style>
</head>
<body>
<div class="container">
  <h1>Workforce Resilience Report</h1>
  <div class="meta">Generated: ${dateStr} | Employees: ${data.employees.length} | Projects: ${data.projects.length}</div>

  <h2>Organisation Health</h2>
  <div class="grid">
    <div class="card"><div class="label">Overall Health</div><div class="value">${health.overallHealth !== undefined ? health.overallHealth.toFixed(1) : 'N/A'}</div></div>
    <div class="card"><div class="label">Workforce Readiness</div><div class="value">${readiness.overallReadiness !== undefined ? readiness.overallReadiness.toFixed(1) : 'N/A'}</div></div>
    <div class="card"><div class="label">Succession Coverage</div><div class="value">${succession.coverage !== undefined ? succession.coverage.toFixed(1) : 'N/A'}</div></div>
    <div class="card"><div class="label">Active Employees</div><div class="value">${data.employees.length}</div></div>
  </div>

  ${scenarioType ? `
  <h2>Scenario: ${scenarioType}</h2>
  <div class="grid">
    <div class="card"><div class="label">Projected Impact</div><div class="value ${scenarioImpact >= 0 ? 'positive' : 'negative'}">${scenarioImpact >= 0 ? '+' : ''}${scenarioImpact?.toFixed(1) || '0.0'}</div></div>
    <div class="card"><div class="label">Removed Employees</div><div class="value">${removedList.length}</div></div>
  </div>` : ''}

  <h2>Single Points of Failure</h2>
  ${spofs.length ? `
  <table>
    <thead><tr><th>Employee</th><th>Severity</th><th>Skills</th><th>Mitigation</th></tr></thead>
    <tbody>${spofs.slice(0, 10).map(s => `
      <tr>
        <td>${s.name || s.employee || 'Unknown'}</td>
        <td><span class="badge ${s.severity || 'medium'}">${s.severity || 'medium'}</span></td>
        <td>${(s.skills || []).join(', ') || '—'}</td>
        <td>${s.mitigation || 'Cross-train'}</td>
      </tr>`).join('')}</tbody>
  </table>` : '<p>No SPOFs identified.</p>'}

  <h2>Skill Gaps</h2>
  ${gaps.length ? `
  <table>
    <thead><tr><th>Skill</th><th>Severity</th><th>Missing Count</th></tr></thead>
    <tbody>${gaps.slice(0, 10).map(g => `
      <tr>
        <td>${g.skill || g.name || 'Unknown'}</td>
        <td><span class="badge ${g.severity || 'medium'}">${g.severity || 'medium'}</span></td>
        <td>${g.missingCount || g.count || 'N/A'}</td>
      </tr>`).join('')}</tbody>
  </table>` : '<p>No skill gaps identified.</p>'}

  <div class="footer">ReliSoft Workforce Resilience Module &mdash; Confidential</div>
</div>
</body>
</html>`;

    res.json({ success: true, html });
  } catch (error) {
    next(error);
  }
}

export async function postQuery(req, res, next) {
  try {
    const { query, messages } = req.body;
    const normalized = (query || '').toLowerCase();
    const history = messages || [];

    const isFollowUp = history.length > 0;
    const lastContext = isFollowUp ? history[history.length - 1].content?.toLowerCase() || '' : '';

    let answer = '';

    if (/\bspof\b/.test(normalized) || /\bspof\b/.test(lastContext)) {
      answer = 'SPOF (Single Point of Failure) analysis identifies employees whose absence would critically impact operations. Mitigation strategies include cross-training, documentation, and role redundancy.';
    } else if (/simulat/i.test(normalized) || /what.?if/i.test(normalized)) {
      answer = 'Use the What-If Simulator (POST /api/resilience/whatif) with parameters like scenarioType, removedEmployees, and workloadIncreasePct to model workforce changes.';
    } else if (/risk/i.test(normalized) || /risk/i.test(lastContext)) {
      answer = 'Key workforce risks include: SPOF concentration, skill gaps, knowledge silos, burnout potential, and succession coverage gaps. Run GET /api/resilience/spof-ranking to see ranked risks.';
    } else if (/health/i.test(normalized) || /health/i.test(lastContext)) {
      answer = 'Organisational health is computed from retention, burnout, resilience, and workload indicators. Run GET /api/resilience/org-health to view the latest score.';
    } else if (/employee/i.test(normalized) || /profile/i.test(normalized)) {
      answer = 'Query employee profiles via GET /api/resilience/employee/:name. Profiles include skills, dependencies, project load, and resilience scores.';
    } else if (/weight/i.test(normalized) || /setting/i.test(normalized)) {
      answer = 'Analytics weights control how indicators are scored. View current weights via GET /api/resilience/analytics-weights, or adjust via the POST endpoint.';
    } else if (/suggest/i.test(normalized) || /recommend/i.test(normalized)) {
      answer = 'Run POST /api/resilience/feedback/suggestions to get AI-generated recommendations for cross-training, hiring, and documentation based on current workforce data.';
    } else if (/gap/i.test(normalized) || /skill/i.test(normalized)) {
      answer = 'Skill gaps are identified by comparing required vs. actual competencies. Run GET /api/resilience/skill-gaps for the full analysis.';
    } else if (/pipeline/i.test(normalized)) {
      answer = 'The Resilience Pipeline (POST /api/resilience/pipeline) provides end-to-end analysis including insights, risks, simulation, coaching, and governance recommendations.';
    } else if (/feedback/i.test(normalized)) {
      answer = 'Feedback records store decisions on resilience recommendations. View all via GET /api/resilience/feedback, or submit new feedback via POST.';
    } else if (/report/i.test(normalized)) {
      answer = 'Generate a formatted HTML report via GET /api/resilience/report with optional scenarioType and removed query parameters.';
    } else {
      answer = 'I can help with workforce resilience topics: SPOF analysis, skill gaps, what-if simulation, org health, employee profiles, analytics weights, suggestions, and reports. Try asking about a specific area.';
    }

    res.json({
      success: true,
      answer,
      context: { lastTopic: normalized.split(/\s+/).slice(0, 5).join(' ') },
    });
  } catch (error) {
    next(error);
  }
}
