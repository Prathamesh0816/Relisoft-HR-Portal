import { useEffect } from 'react'
import useStore from '../store'
import { getOrgHealth } from '../api'
import { Heart, Shield, Brain, TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react'

export default function ResilienceDashboard() {
  const { resilience, setResilience } = useStore()
  const health = resilience.orgHealth || {}

  useEffect(() => {
    getOrgHealth().then((d) => setResilience({ orgHealth: d, loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  const kpis = [
    { label: 'Trust Score', value: health.trustScore, icon: Heart, color: 'emerald' },
    { label: 'Resilience Score', value: health.resilienceScore, icon: Brain, color: 'blue' },
    { label: 'Burnout Risk', value: health.burnoutRisk, icon: AlertTriangle, color: 'red' },
    { label: 'Retention Score', value: health.retentionScore, icon: TrendingUp, color: 'purple' },
  ]

  const scoreColor = (v) => {
    if (v >= 80) return 'text-emerald-600'
    if (v >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      <div className="card-surface p-6">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Workforce Resilience Dashboard</h2>
        <p className="text-muted text-sm mb-4">TruPulse AI — Organizational Health Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {kpis.map((k) => {
            const Icon = k.icon
            const val = k.value ?? 0
            return (
              <div key={k.label} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
                <Icon size={24} className={`mx-auto mb-2 text-${k.color}-600`} />
                <div className={`text-3xl font-bold ${scoreColor(val)}`}>{typeof val === 'number' ? val.toFixed(1) : val}%</div>
                <div className="text-xs text-muted mt-1 font-bold">{k.label}</div>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
            <div className="text-5xl font-bold text-navy dark:text-white">{health.compositeScore ?? 0}</div>
            <div className="text-xs text-muted mt-1 font-bold">Composite Resilience Score</div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <Users size={20} className="mx-auto mb-1 text-navy/50" />
              <div className="text-2xl font-bold text-navy dark:text-white">{health.employeeCount ?? 0}</div>
              <div className="text-xs text-muted font-bold">Employees</div>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <AlertTriangle size={20} className="mx-auto mb-1 text-amber-600" />
              <div className="text-2xl font-bold text-amber-700">{health.spofCount ?? 0}</div>
              <div className="text-xs text-muted font-bold">SPOFs</div>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <Dollar size={20} className="mx-auto mb-1 text-red-600" />
              <div className="text-2xl font-bold text-red-700">${(health.revenueAtRisk ?? 0).toLocaleString()}</div>
              <div className="text-xs text-muted font-bold">Revenue at Risk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}