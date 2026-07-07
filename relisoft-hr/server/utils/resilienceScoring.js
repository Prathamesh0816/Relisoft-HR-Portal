const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value))

const average = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length

const defaultWeights = {
  indicator: { resilience: 0.30, trust: 0.20, burnout: 0.25, retention: 0.25 },
  burnout_sub: { hour_burnout: 0.45, pto_risk: 0.30, overdue_risk: 0.25 },
  retention_sub: { engagement: 0.55, criticality: 0.30, backup_penalty: 0.15 },
  resilience_sub: { backup_coverage: 0.40, severity_penalty_max: 40, doc_bonus_max: 20, team_bonus_max: 20 },
}

let currentWeights = JSON.parse(JSON.stringify(defaultWeights))

const criticalityScore = (criticality) => {
  switch (criticality) {
    case 'High': return 80
    case 'Medium': return 50
    case 'Low': return 20
    default: return 0
  }
}

function computeSPOFSeverity(employee, knowledge) {
  const base = criticalityScore(employee.criticality)
  const depCount = (employee.dependents || []).length
  const empKnowledge = (knowledge || []).filter(k => k.employee === employee.name)
  const highDocCount = empKnowledge.filter(k => k.documentation === 'High').length
  const docBonus = Math.min(highDocCount * 10, 30)
  return base + depCount * 10 - docBonus
}

function detectSPOFs(employees, knowledge) {
  return (employees || []).filter(emp => {
    if (emp.backupAvailable) return false
    const hasDependents = (emp.dependents || []).length > 0
    const isHighCriticality = emp.criticality === 'High'
    return hasDependents || isHighCriticality
  }).map(spof => {
    const severity = computeSPOFSeverity(spof, knowledge)
    return { ...spof, spofSeverity: severity }
  })
}

function computeResilience(employees, knowledge) {
  if (!employees || employees.length === 0) return { score: 0, spofs: [], details: {} }

  const total = employees.length
  const withBackup = employees.filter(e => e.backupAvailable).length
  const backupCoverage = (withBackup / total) * 100

  const spofs = detectSPOFs(employees, knowledge)
  const severityPenalty = spofs.reduce((sum, spof) => sum + spof.spofSeverity / total * 100, 0)

  const knowledgeAreas = knowledge || []
  const highDocCount = knowledgeAreas.filter(k => k.documentation === 'High').length
  const totalAreas = knowledgeAreas.length
  const docBonus = totalAreas > 0 ? (highDocCount / totalAreas) * 20 : 0

  const teams = [...new Set((employees || []).map(e => e.team).filter(Boolean))]
  const teamsWithBackup = teams.filter(team => {
    const teamMembers = employees.filter(e => e.team === team)
    return teamMembers.some(e => e.backupAvailable)
  })
  const teamBonus = teams.length > 0 ? (teamsWithBackup.length / teams.length) * 20 : 0

  const subScore = backupCoverage * (currentWeights.resilience_sub.backup_coverage / 0.40) + docBonus + teamBonus - severityPenalty
  const score = clamp(subScore)

  return {
    score,
    spofs,
    details: {
      backupCoverage,
      severityPenalty,
      docBonus,
      teamBonus,
      totalEmployees: total,
      employeesWithBackup: withBackup,
      teamsWithBackupCount: teamsWithBackup.length,
      totalTeams: teams.length,
      spofCount: spofs.length,
    }
  }
}

function computeTrust(knowledge) {
  if (!knowledge || knowledge.length === 0) return { score: 0, details: {} }

  const docScores = { High: 100, Medium: 60, Low: 20 }
  const scores = knowledge.map(k => docScores[k.documentation] || 0)
  const score = clamp(average(scores))

  return {
    score,
    details: {
      totalAreas: knowledge.length,
      byLevel: {
        high: knowledge.filter(k => k.documentation === 'High').length,
        medium: knowledge.filter(k => k.documentation === 'Medium').length,
        low: knowledge.filter(k => k.documentation === 'Low').length,
      }
    }
  }
}

function computeBurnout(employees) {
  if (!employees || employees.length === 0) return { score: 0, details: [] }

  const w = currentWeights.burnout_sub
  const employeeBurnouts = employees.map(emp => {
    const hourBurnout = emp.weeklyHours > 45 ? ((emp.weeklyHours - 45) / 25) * 100 : 0
    const ptoRisk = emp.ptoPlannedDays > 20 ? ((emp.ptoPlannedDays - 20) / 20) * 100 : 0
    const overdueRisk = emp.overdueTasks > 3 ? ((emp.overdueTasks - 3) / 7) * 100 : 0
    const combined = hourBurnout * w.hour_burnout + ptoRisk * w.pto_risk + overdueRisk * w.overdue_risk
    return { name: emp.name, hourBurnout, ptoRisk, overdueRisk, combined }
  })

  const avgBurnout = average(employeeBurnouts.map(e => e.combined))
  const score = clamp(100 - avgBurnout)

  return { score, details: employeeBurnouts }
}

function computeRetention(employees) {
  if (!employees || employees.length === 0) return { score: 0, details: {} }

  const total = employees.length
  const avgEngagement = average(employees.map(e => e.engagement || 0))

  const highCriticalityCount = employees.filter(e => e.criticality === 'High').length
  const criticalityPenalty = (highCriticalityCount / total) * 30

  const noBackupCount = employees.filter(e => !e.backupAvailable).length
  const backupPenalty = (noBackupCount / total) * 20

  const w = currentWeights.retention_sub
  const subScore = (avgEngagement * w.engagement) + (100 - criticalityPenalty) * w.criticality + (100 - backupPenalty) * w.backup_penalty
  const score = clamp(subScore)

  return {
    score,
    details: {
      avgEngagement,
      highCriticalityCount,
      criticalityPenalty,
      noBackupCount,
      backupPenalty,
    }
  }
}

export function computeOrgHealth(employees, dependencies, knowledge, projects) {
  const resilience = computeResilience(employees, knowledge)
  const trust = computeTrust(knowledge)
  const burnout = computeBurnout(employees)
  const retention = computeRetention(employees)

  const w = currentWeights.indicator
  const composite = clamp(
    resilience.score * w.resilience +
    trust.score * w.trust +
    burnout.score * w.burnout +
    retention.score * w.retention
  )

  return {
    composite,
    resilience: resilience.score,
    trust: trust.score,
    burnout: burnout.score,
    retention: retention.score,
    spofs: resilience.spofs,
    details: {
      resilience: resilience.details,
      trust: trust.details,
      burnout: burnout.details,
      retention: retention.details,
    }
  }
}

export function getEmployeeProfile(name, employees, dependencies, knowledge, projects) {
  const emp = (employees || []).find(e => e.name === name)
  if (!emp) return null

  const empKnowledge = (knowledge || []).filter(k => k.employee === name)
  const incomingDeps = (dependencies || []).filter(d => d.to === name)
  const outgoingDeps = (dependencies || []).filter(d => d.from === name)
  const spofs = detectSPOFs(employees, knowledge)
  const isSPOF = spofs.some(s => s.name === name)
  const spofSeverity = isSPOF ? computeSPOFSeverity(emp, knowledge) : null
  const projectsWithEmployee = (projects || []).filter(p =>
    (p.tasks || []).some(t => t.assignee === name)
  )

  const docScores = { High: 100, Medium: 60, Low: 20 }
  const trustScore = empKnowledge.length > 0
    ? average(empKnowledge.map(k => docScores[k.documentation] || 0))
    : 0

  const wBurnout = currentWeights.burnout_sub
  const hourBurnout = emp.weeklyHours > 45 ? ((emp.weeklyHours - 45) / 25) * 100 : 0
  const ptoRisk = emp.ptoPlannedDays > 20 ? ((emp.ptoPlannedDays - 20) / 20) * 100 : 0
  const overdueRisk = emp.overdueTasks > 3 ? ((emp.overdueTasks - 3) / 7) * 100 : 0
  const burnoutScore = hourBurnout * wBurnout.hour_burnout + ptoRisk * wBurnout.pto_risk + overdueRisk * wBurnout.overdue_risk

  return {
    employee: emp,
    isSPOF,
    spofSeverity,
    knowledge: empKnowledge,
    trustScore,
    burnoutScore,
    incomingDependencies: incomingDeps,
    outgoingDependencies: outgoingDeps,
    projects: projectsWithEmployee,
  }
}

export function simulateScenario(scenarioType, employees, dependencies, knowledge, projects, options) {
  if (!employees || employees.length === 0) {
    return computeOrgHealth([], dependencies, knowledge, projects)
  }

  let modifiedEmployees = employees.map(e => ({ ...e }))
  let modifiedKnowledge = knowledge ? knowledge.map(k => ({ ...k })) : []
  let modifiedDependencies = dependencies ? dependencies.map(d => ({ ...d })) : []

  switch (scenarioType) {
    case 'attrition': {
      const { employees: removedNames = [] } = options || {}
      const removedSet = new Set(removedNames)
      modifiedEmployees = modifiedEmployees.filter(e => !removedSet.has(e.name))
      modifiedKnowledge = modifiedKnowledge.filter(k => !removedSet.has(k.employee))
      modifiedDependencies = modifiedDependencies.filter(d =>
        !removedSet.has(d.from) && !removedSet.has(d.to)
      )
      break
    }

    case 'workload_increase': {
      const { pct = 10 } = options || {}
      modifiedEmployees = modifiedEmployees.map(e => ({
        ...e,
        weeklyHours: Math.round((e.weeklyHours || 0) * (1 + pct / 100)),
      }))
      break
    }

    case 'team_restructuring': {
      const { team = '' } = options || {}
      modifiedEmployees = modifiedEmployees.map(e => {
        if (e.team === team) {
          return {
            ...e,
            weeklyHours: Math.round((e.weeklyHours || 0) * 1.2),
            overdueTasks: (e.overdueTasks || 0) + 2,
          }
        }
        return e
      })
      break
    }

    default:
      break
  }

  return computeOrgHealth(modifiedEmployees, modifiedDependencies, modifiedKnowledge, projects)
}

export function compareScenarios(baseline, projected) {
  if (!baseline || !projected) return null

  const diff = (key) => ({
    from: baseline[key],
    to: projected[key],
    change: +(projected[key] - baseline[key]).toFixed(2),
  })

  return {
    composite: diff('composite'),
    resilience: diff('resilience'),
    trust: diff('trust'),
    burnout: diff('burnout'),
    retention: diff('retention'),
    spofs: {
      from: baseline.spofs || [],
      to: projected.spofs || [],
      change: (projected.spofs || []).length - (baseline.spofs || []).length,
    },
  }
}

export function setWeights(indicator, burnout, retention, resilience, source) {
  if (indicator) {
    Object.assign(currentWeights.indicator, indicator)
  }
  if (burnout) {
    Object.assign(currentWeights.burnout_sub, burnout)
  }
  if (retention) {
    Object.assign(currentWeights.retention_sub, retention)
  }
  if (resilience) {
    Object.assign(currentWeights.resilience_sub, resilience)
  }
}

export function getWeights() {
  return JSON.parse(JSON.stringify(currentWeights))
}

export function resetWeights() {
  currentWeights = JSON.parse(JSON.stringify(defaultWeights))
}

export function computeSkillGaps(employees, knowledge) {
  if (!knowledge || knowledge.length === 0) return []

  const teams = [...new Set((employees || []).map(e => e.team).filter(Boolean))]
  const areas = [...new Set(knowledge.map(k => k.area).filter(Boolean))]
  const gaps = []

  for (const team of teams) {
    const teamKnowledge = knowledge.filter(k => k.team === team)
    const teamMembers = (employees || []).filter(e => e.team === team).map(e => e.name)
    const teamMemberSet = new Set(teamMembers)

    for (const area of areas) {
      const areaKnowledge = teamKnowledge.filter(k => k.area === area)
      const coveredBy = areaKnowledge.map(k => k.employee)
      const onTeam = coveredBy.filter(e => teamMemberSet.has(e))
      const highDoc = areaKnowledge.filter(k => k.documentation === 'High').map(k => k.employee)
      const highOnTeam = highDoc.filter(e => teamMemberSet.has(e))

      let coverage = 'none'
      if (onTeam.length > 0 && highOnTeam.length > 0) {
        coverage = 'high'
      } else if (onTeam.length > 0) {
        coverage = 'low'
      }

      gaps.push({
        team,
        area,
        coveredBy: onTeam,
        highDocCoverage: highOnTeam,
        coverage,
        gap: coverage !== 'high',
      })
    }
  }

  return gaps
}

export function computeSuccessionPlanning(employees, knowledge) {
  if (!employees) return []
  return employees.map(emp => {
    const name = emp.name
    const empKnowledge = (knowledge || []).filter(k => k.employee === name)
    const readinessScore = Math.min(100, (empKnowledge.length * 15) + (emp.tenure || 0))
    return {
      name,
      team: emp.team || 'Unknown',
      role: emp.role || 'Team Member',
      currentSkills: empKnowledge.map(k => k.area),
      readinessScore,
      readiness: readinessScore >= 70 ? 'ready' : readinessScore >= 40 ? 'developing' : 'gap',
      potentialSuccessors: [],
    }
  }).sort((a, b) => b.readinessScore - a.readinessScore)
}

export function computeWorkforceReadiness(employees, knowledge, projects) {
  if (!employees) return { readiness: 0, metrics: {} }
  const totalHeadcount = employees.length
  const totalProjects = (projects || []).length
  const trainedCount = employees.filter(e =>
    (knowledge || []).some(k => k.employee === e.name)
  ).length
  const coverage = totalHeadcount > 0 ? (trainedCount / totalHeadcount) * 100 : 0
  const projectLoad = totalProjects > 0 ? Math.min(100, (totalProjects / Math.max(totalHeadcount, 1)) * 50) : 0
  const readiness = Math.round(Math.min(100, coverage * 0.7 + (100 - projectLoad) * 0.3))
  return {
    readiness,
    metrics: {
      totalHeadcount,
      trainedEmployees: trainedCount,
      trainingCoverage: Math.round(coverage),
      activeProjects: totalProjects,
      projectLoad: Math.round(projectLoad),
      overallReadiness: readiness,
    },
  }
}

export function computeKnowledgeConcentration({ knowledge, employees }) {
  if (!knowledge || knowledge.length === 0) return []
  const areas = [...new Set(knowledge.map(k => k.area).filter(Boolean))]
  const result = []
  for (const area of areas) {
    const areaKnowledge = knowledge.filter(k => k.area === area)
    const employeesWithKnowledge = [...new Set(areaKnowledge.map(k => k.employee).filter(Boolean))]
    const employeeNames = employeesWithKnowledge.map(name => {
      const emp = (employees || []).find(e => e.name === name)
      return { name, team: emp?.team || 'Unknown' }
    })
    result.push({
      area,
      employeeCount: employeesWithKnowledge.length,
      employees: employeeNames,
      concentration: employeesWithKnowledge.length === 1 ? 'critical' : employeesWithKnowledge.length <= 2 ? 'high' : 'moderate',
    })
  }
  return result
}

export function computeSpofRanking(data) {
  const { employees, dependencies, knowledge } = data || {}
  if (!employees) return []
  return employees.map(emp => {
    const name = emp.name
    const empDeps = (dependencies || []).filter(d => d.source === name || d.target === name)
    const empKnowledge = (knowledge || []).filter(k => k.employee === name)
    const spofScore = Math.min(100, (empDeps.length * 20) + (empKnowledge.length * 10))
    return {
      name,
      team: emp.team || 'Unknown',
      role: emp.role || 'Team Member',
      dependencyCount: empDeps.length,
      knowledgeAreas: empKnowledge.length,
      spofScore,
      risk: spofScore >= 70 ? 'high' : spofScore >= 40 ? 'medium' : 'low',
    }
  }).sort((a, b) => b.spofScore - a.spofScore)
}

export function computeUpskilling(employeeName, data) {
  const { employees, knowledge } = data || {}
  const emp = (employees || []).find(e => e.name === employeeName)
  if (!emp) return null
  const empKnowledge = (knowledge || []).filter(k => k.employee === employeeName)
  const knownAreas = new Set(empKnowledge.map(k => k.area))
  const allAreas = [...new Set((knowledge || []).map(k => k.area).filter(Boolean))]
  const missingAreas = allAreas.filter(a => !knownAreas.has(a))
  return {
    employee: employeeName,
    team: emp.team || 'Unknown',
    currentSkills: empKnowledge.map(k => ({ area: k.area, proficiency: k.proficiency || 'intermediate' })),
    recommendedAreas: missingAreas.slice(0, 5).map(area => ({ area, priority: 'recommended' })),
    upskillingScore: Math.round((knownAreas.size / Math.max(allAreas.length, 1)) * 100),
  }
}
