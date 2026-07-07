import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resilienceAPI } from '../../services/api'
import { SkeletonPage } from '../../components/resilience/Skeleton'
import ErrorState from '../../components/resilience/ErrorState'
import KPICard from '../../components/resilience/KPICard'
import StatusBadge from '../../components/resilience/StatusBadge'

export default function SuccessionPlanning() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [teamFilter, setTeamFilter] = useState('All')

  useEffect(() => {
    resilienceAPI.getSuccessionPlanning()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonPage />
  if (error) return <ErrorState message={error} />
  if (!data) return <ErrorState message="No succession data" />

  const teams = [...new Set(data.roles.map((r) => r.team))].sort()
  const filtered = teamFilter === 'All' ? data.roles : data.roles.filter((r) => r.team === teamFilter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Succession Planning</h1>
        <p className="text-gray-500 mt-1">Backfill readiness for every critical role</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard label="Org Readiness" value={`${data.org_readiness}%`} subtitle={`${data.roles_covered}/${data.total_high_roles} roles covered`} risk={data.org_readiness >= 70 ? 'LOW' : data.org_readiness >= 45 ? 'MEDIUM' : 'HIGH'} />
        <KPICard label="Critical Roles" value={data.total_high_roles} subtitle="High-criticality positions" />
        <KPICard label="Roles With Successor" value={data.roles_covered} subtitle="At least one ready candidate" risk={data.roles_covered < data.total_high_roles * 0.5 ? 'HIGH' : 'MEDIUM'} />
        <KPICard label="Roles At Risk" value={data.total_high_roles - data.roles_covered} subtitle="No ready successor" risk={data.total_high_roles - data.roles_covered > 5 ? 'CRITICAL' : 'HIGH'} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTeamFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${teamFilter === 'All' ? 'bg-relisoft-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All Teams
        </button>
        {teams.map((t) => (
          <button
            key={t}
            onClick={() => setTeamFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${teamFilter === t ? 'bg-relisoft-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((role, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${role.has_ready_successor ? 'bg-green-500' : 'bg-red-400'}`}>
                  {role.role.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{role.role}</p>
                  <p className="text-sm text-gray-500">{role.employee} &middot; {role.team}</p>
                </div>
                {!role.backup_available && <StatusBadge level="CRITICAL" small />}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Successor</p>
                  <StatusBadge level={role.has_ready_successor ? 'LOW' : 'HIGH'} small />
                </div>
                <span className="text-gray-400 text-lg ml-2">{expanded === i ? '−' : '+'}</span>
              </div>
            </button>

            {expanded === i && (
              <div className="border-t border-gray-100 p-4">
                {role.potential_successors?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {role.potential_successors.map((s, j) => (
                      <div key={j} className={`border rounded-lg p-3 ${s.readiness_score >= 70 ? 'border-green-200 bg-green-50' : s.readiness_score >= 50 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Link to={`/employee/${s.employee}`} className="font-medium text-relisoft-600 hover:underline text-sm">
                            {s.employee}
                          </Link>
                          <span className={`text-lg font-bold ${s.readiness_score >= 70 ? 'text-green-700' : s.readiness_score >= 50 ? 'text-yellow-700' : 'text-gray-600'}`}>
                            {s.readiness_score}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{s.role}</p>
                        <p className="text-xs text-gray-400 mt-1">{s.experience_years} yrs exp &middot; {s.knowledge_overlap} areas overlap</p>
                        <div className="mt-2">
                          <StatusBadge level={s.readiness_level} small />
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${s.readiness_score >= 70 ? 'bg-green-500' : s.readiness_score >= 50 ? 'bg-yellow-500' : 'bg-gray-400'}`} style={{ width: `${s.readiness_score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No potential successors identified in the same team.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
