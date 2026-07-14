import { useEffect } from 'react'
import useStore from '../store'
import { getSpofRanking } from '../api'
import { AlertTriangle, Users, DollarSign, Hash } from 'lucide-react'

export default function SpofAnalysis() {
  const { resilience, setResilience } = useStore()
  const spofs = resilience.spofs || []

  useEffect(() => {
    getSpofRanking().then((d) => setResilience({ spofs: d.spofs || [], loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  const criticalityColor = (c) => {
    if (c === 'High' || c === 'Critical') return 'bg-red-50 text-red-700 border-red-200'
    if (c === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Single Point of Failure Analysis</h2>
      <p className="text-muted text-sm mb-4">Ranked list of critical single points of failure.</p>
      {resilience.spofs.length === 0 ? (
        <p className="text-muted text-sm">No SPOFs identified.</p>
      ) : (
        <div className="space-y-3">
          {resilience.spofs.map((spof, i) => (
            <div key={spof.id || i} className={`p-4 rounded-xl border ${criticalityColor(spof.criticality)} bg-white dark:bg-[var(--bg-secondary)]`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-bold text-navy dark:text-white text-sm">{spof.employeeName || spof.name}</div>
                  <div className="text-xs text-muted mt-1">{spof.team || spof.department} · {spof.jobRole || spof.role}</div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-bold text-navy dark:text-white">Score: {spof.score ?? 0}</span>
                  <span className="text-muted">Deps: {spof.dependencyCount ?? 0}</span>
                  <span className="text-red-600 font-bold">${(spof.revenueImpact ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
