import { useEffect, useState } from 'react'
import useStore from '../store'
import { getWorkforceEmployees, getWorkforceEmployee } from '../api'
import { Users, User, Star, AlertTriangle, Shield, Activity, BookOpen, Share2 } from 'lucide-react'

export default function WorkforceEmployees() {
  const { resilience, setResilience } = useStore()
  const [tab, setTab] = useState('list')
  const [selectedId, setSelectedId] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getWorkforceEmployees().then((d) => setResilience({ employees: d.employees || [], loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  const viewProfile = async (id) => {
    setSelectedId(id)
    setTab('profile')
    const d = await getWorkforceEmployee(id)
    setProfile(d)
  }

  const criticalityColor = (c) => {
    if (c === 'High' || c === 'Critical') return 'bg-red-50 text-red-700'
    if (c === 'Medium') return 'bg-amber-50 text-amber-700'
    return 'bg-emerald-50 text-emerald-700'
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('list')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'list' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>List</button>
            <button onClick={() => setTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'profile' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Profile</button>
          </div>
        </div>
      </div>

      {tab === 'list' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Workforce Employees</h2>
          <p className="text-muted text-sm mb-4">View all employees and their resilience metrics.</p>
          {resilience.employees.length === 0 ? (
            <p className="text-muted text-sm">No employees found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/10 dark:border-white/10 text-left text-muted text-xs font-bold uppercase">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Team</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Criticality</th>
                    <th className="pb-3 pr-4">Backup</th>
                    <th className="pb-3 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {resilience.employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-navy/5 dark:border-white/5">
                      <td className="py-3 pr-4 font-bold text-navy dark:text-white text-sm">{emp.fullName || emp.name}</td>
                      <td className="py-3 pr-4 text-sm text-muted">{emp.team || emp.department}</td>
                      <td className="py-3 pr-4 text-sm text-muted">{emp.jobRole || emp.role}</td>
                      <td className="py-3 pr-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${criticalityColor(emp.criticality)}`}>{emp.criticality || 'Low'}</span></td>
                      <td className="py-3 pr-4 text-sm">{emp.hasBackup ? <span className="text-emerald-600 font-bold">Yes</span> : <span className="text-red-600 font-bold">No</span>}</td>
                      <td className="py-3"><button onClick={() => viewProfile(emp.id)} className="text-xs text-gold-1 font-bold hover:underline">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && profile && (
        <div className="card-surface p-6">
          <button onClick={() => { setTab('list'); setSelectedId(null); setProfile(null) }} className="text-xs text-gold-1 font-bold mb-4 hover:underline">&larr; Back to List</button>
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">{profile.fullName || profile.name}</h2>
          <p className="text-muted text-sm mb-4">{profile.jobRole || profile.role} · {profile.team || profile.department}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <div className="text-2xl font-bold text-navy dark:text-white">{profile.performance ?? 0}%</div>
              <div className="text-xs text-muted font-bold">Performance</div>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <div className="text-2xl font-bold text-navy dark:text-white">{profile.workload ?? 0}%</div>
              <div className="text-xs text-muted font-bold">Workload</div>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <div className="text-2xl font-bold text-navy dark:text-white">{profile.knowledgeScore ?? 0}%</div>
              <div className="text-xs text-muted font-bold">Knowledge</div>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
              <div className="text-2xl font-bold text-navy dark:text-white">{profile.dependencyCount ?? 0}</div>
              <div className="text-xs text-muted font-bold">Dependencies</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}