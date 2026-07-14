import { useEffect } from 'react'
import useStore from '../store'
import { getSuccessionPlanning } from '../api'
import { Users, Clock, Shield, TrendingUp } from 'lucide-react'

export default function SuccessionPlanning() {
  const { resilience, setResilience } = useStore()
  const succession = resilience.succession || []

  useEffect(() => {
    getSuccessionPlanning().then((d) => setResilience({ succession: d.succession || [], loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  const readinessColor = (r) => {
    if (r === 'Ready' || r >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (r === 'Developing' || (r >= 50 && r < 80)) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const readinessLabel = (r) => {
    if (r === 'Ready' || r >= 80) return 'Ready'
    if (r === 'Developing' || (r >= 50 && r < 80)) return 'Developing'
    return 'At Risk'
  }

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Succession Planning</h2>
      <p className="text-muted text-sm mb-4">Identify and prepare successors for critical roles.</p>
      {resilience.succession.length === 0 ? (
        <p className="text-muted text-sm">No succession data available.</p>
      ) : (
        <div className="space-y-3">
          {resilience.succession.map((s, i) => (
            <div key={s.id || i} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-navy dark:text-white text-sm">{s.employeeName || s.name}</div>
                  <div className="text-xs text-muted mt-1">{s.team || s.department} · {s.jobRole || s.role}</div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted">Tenure: {s.tenure ?? 0}y</span>
                  <span className="text-muted">Engagement: {s.engagement ?? 0}%</span>
                  <span className="text-muted">Backup: {s.hasBackup ? 'Yes' : 'No'}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.readiness === 'Ready' || s.readiness >= 80 ? 'bg-emerald-50 text-emerald-700' : s.readiness === 'Developing' || (s.readiness >= 50 && s.readiness < 80) ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    {typeof s.readiness === 'number' ? `${s.readiness}%` : s.readiness || 'At Risk'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
