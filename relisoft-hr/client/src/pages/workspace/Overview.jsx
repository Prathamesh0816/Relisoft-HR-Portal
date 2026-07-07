import { useState, useEffect } from 'react'
import { Loader2, Users, Building2, Briefcase, UserCog, Shield, BarChart3 } from 'lucide-react'
import { workspaceAPI } from '../../services/api'

export default function Overview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await workspaceAPI.getDirectory()
      setData(res.data)
    } catch (err) {
      console.error('Failed to load', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} /></div>
  }

  const employees = data?.employees || []
  const projects = data?.projects || []
  const teams = projects.reduce((a, p) => a + (p.teams?.length || 0), 0)
  const managers = employees.filter(e => e.roleLabel?.includes('Manager') || e.roleLabel?.includes('Lead')).length
  const hrMembers = employees.filter(e => e.roleLabel?.includes('HR')).length

  const roleCounts = {}
  for (const emp of employees) {
    const label = emp.roleLabel || 'Employee'
    roleCounts[label] = (roleCounts[label] || 0) + 1
  }

  const stats = [
    { label: 'Employees', value: employees.length, icon: Users, color: '#2563eb' },
    { label: 'Projects', value: projects.length, icon: Building2, color: '#0891b2' },
    { label: 'Teams', value: teams, icon: Briefcase, color: '#f59e0b' },
    { label: 'Managers', value: managers, icon: UserCog, color: '#dc2626' },
    { label: 'HR', value: hrMembers, icon: Shield, color: '#1b8c3a' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Leadership Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Organization-wide metrics and hierarchy</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card">
              <div className="p-2 rounded-lg" style={{ background: `${s.color}14` }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{s.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-extrabold mb-4" style={{ color: 'var(--ink)' }}>Role Distribution</h3>
          <div className="space-y-3">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-sm font-medium w-28" style={{ color: 'var(--ink)' }}>{role}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--sage)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(count / employees.length) * 100}%`, background: 'var(--moss)' }} />
                </div>
                <span className="text-xs font-semibold w-8 text-right" style={{ color: 'var(--muted)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-extrabold mb-4" style={{ color: 'var(--ink)' }}>Quick Summary</h3>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--line)' }}>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{s.label}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
