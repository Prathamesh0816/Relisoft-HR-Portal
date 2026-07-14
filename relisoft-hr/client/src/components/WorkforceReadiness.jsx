import { useEffect } from 'react'
import useStore from '../store'
import { getWorkforceReadiness } from '../api'
import { BarChart3, Users, Briefcase, DollarSign } from 'lucide-react'

export default function WorkforceReadiness() {
  const { resilience, setResilience } = useStore()
  const readiness = resilience.readiness

  useEffect(() => {
    getWorkforceReadiness().then((d) => setResilience({ readiness: d, loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  if (!readiness) return <div className="card-surface p-6"><p className="text-muted text-sm">Loading readiness data...</p></div>

  const teams = readiness.teams || []

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Workforce Readiness</h2>
      <p className="text-muted text-sm mb-4">Overall workforce readiness and capacity utilization.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
          <div className="text-4xl font-bold text-navy dark:text-white">{readiness?.overallScore ?? 0}%</div>
          <div className="text-xs text-muted mt-1 font-bold">Overall Readiness</div>
        </div>
        <div className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
          <div className="text-4xl font-bold text-navy dark:text-white">{readiness?.activeProjects ?? 0}</div>
          <div className="text-xs text-muted mt-1 font-bold">Active Projects</div>
        </div>
      </div>
      <h3 className="font-bold text-sm text-navy dark:text-white mb-3">Per-Team Breakdown</h3>
      <div className="space-y-3">
        {(readiness?.teams || []).map((team, i) => (
          <div key={i} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-navy dark:text-white text-sm">{team.name}</div>
                <div className="text-xs text-muted mt-1">Capacity: {team.capacityUtilization ?? 0}% · Projects: {team.activeProjects ?? 0} · Contract Value: ${(team.contractValue ?? 0).toLocaleString()}</div>
              </div>
              <span className="text-lg font-bold text-navy dark:text-white">{team.readiness ?? 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}