import { useMemo, useState } from 'react'
import useStore from '../store'
import { Users, Briefcase, UserPlus, GitBranch, ChevronRight, ChevronDown } from 'lucide-react'

function initials(name) {
  return (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function Avatar({ name, size = 10 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-gold-1 to-gold-2 text-navy-dark grid place-items-center text-xs font-bold shrink-0`}>
      {initials(name)}
    </div>
  )
}

export default function Teams() {
  const { data } = useStore()
  const [tab, setTab] = useState('teams')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState({})

  const employees = useMemo(() => data.employees || [], [data])
  const projects = useMemo(() => data.projects || [], [data])

  const teamsByProject = useMemo(() => {
    const map = {}
    projects.forEach((p) => {
      map[p.name] = p.teams.map((t) => {
        const members = employees.filter((e) =>
          e.teams?.some((et) => String(et.id) === String(t.id)) || String(e.primaryTeamId) === String(t.id)
        )
        const lead = employees.find((e) => String(e.id) === String(t.leadId))
        const hasLead = members.some((m) => String(m.id) === String(t.leadId))
        return {
          ...t,
          projectName: p.name,
          lead: lead || members.find((m) => m.role === 'TeamLead' || m.role === 'Manager' || m.role === 'ManagerL2'),
          members: hasLead ? members : [lead, ...members.filter((m) => m.id !== lead?.id)].filter(Boolean),
        }
      })
    })
    return map
  }, [projects, employees])

  const unassigned = useMemo(() => {
    const teamIds = new Set(projects.flatMap((p) => p.teams.map((t) => String(t.id))))
    return employees.filter((e) =>
      !e.primaryTeamId && !(e.teams || []).some((t) => teamIds.has(String(t.id)))
    )
  }, [projects, employees])

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees
    const q = search.toLowerCase()
    return employees.filter((e) =>
      [e.fullName, e.email, e.employeeCode, e.designation, e.jobRole, e.department, e.primaryTeam?.name]
        .some((v) => String(v || '').toLowerCase().includes(q))
    )
  }, [employees, search])

  const hierarchy = useMemo(() => {
    const codeMap = {}
    employees.forEach((e) => { codeMap[e.employeeCode] = e })
    const byManager = {}
    employees.forEach((e) => {
      const m = e.managerCode ? codeMap[e.managerCode] : null
      const key = m ? m.id : 'top'
      ;(byManager[key] = byManager[key] || []).push(e)
    })
    const build = (id) => (byManager[id] || []).map((e) => ({ emp: e, reports: build(e.id) }))
    return build('top')
  }, [employees])

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const renderNode = (node, depth) => {
    const e = node.emp
    const hasReports = node.reports.length > 0
    const isOpen = expanded[e.id]
    return (
      <div key={e.id}>
        <div className="flex items-center gap-2 py-1.5" style={{ paddingLeft: depth * 20 }}>
          <button onClick={() => hasReports && toggle(e.id)} className="w-5 h-5 grid place-items-center text-navy/50 dark:text-white/50">
            {hasReports ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-3" />}
          </button>
          <Avatar name={e.fullName} size={8} />
          <span className="text-sm font-bold text-navy dark:text-white">{e.fullName}</span>
          <span className="text-xs text-muted dark:text-white/50">{e.designation || e.jobRole}</span>
          {e.primaryTeam?.name && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold">{e.primaryTeam.name}</span>}
        </div>
        {isOpen && node.reports.map((n) => renderNode(n, depth + 1))}
      </div>
    )
  }

  const counts = Object.values(teamsByProject).flat()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="section-kicker">Organisation</span>
          <h2 className="section-title text-2xl mt-1">Teams & Hierarchy</h2>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('teams')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'teams' ? 'gold-button' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
          <Users size={14} className="inline mr-1" /> Teams ({counts.length})
        </button>
        <button onClick={() => setTab('hierarchy')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'hierarchy' ? 'gold-button' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
          <GitBranch size={14} className="inline mr-1" /> Hierarchy
        </button>
        <button onClick={() => setTab('people')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'people' ? 'gold-button' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
          <Briefcase size={14} className="inline mr-1" /> All employees ({employees.length})
        </button>
      </div>

      {tab === 'teams' && (
        <div className="space-y-6">
          {Object.entries(teamsByProject).map(([projectName, teams]) => (
            <div key={projectName}>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={16} className="text-gold-1" />
                <h3 className="font-heading font-bold text-navy dark:text-white">{projectName}</h3>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {teams.map((t) => (
                  <div key={t.id} className="card-surface p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-heading font-bold text-navy dark:text-white">{t.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{t.members.length} member{t.members.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-xs text-muted dark:text-white/60 mt-1">{t.projectName}</div>
                    <div className="mt-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-navy/40 dark:text-white/40 mb-2">Team lead</div>
                      {t.lead ? (
                        <div className="flex items-center gap-2.5">
                          <Avatar name={t.lead.fullName} />
                          <div>
                            <div className="text-sm font-bold text-navy dark:text-white">{t.lead.fullName}</div>
                            <div className="text-xs text-muted dark:text-white/50">{t.lead.designation || t.lead.jobRole}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted dark:text-white/50">No lead assigned</div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-navy/40 dark:text-white/40 mb-2">Members</div>
                      <div className="flex flex-wrap gap-2">
                        {t.members.length === 0 && <span className="text-xs text-muted dark:text-white/50">No members yet</span>}
                        {t.members.map((m) => (
                          <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy/5 dark:bg-white/10 text-navy/70 dark:text-white/70 text-xs font-bold">
                            {m.fullName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(teamsByProject).length === 0 && (
            <div className="card-surface p-10 text-center">
              <Users size={40} className="mx-auto mb-3 text-gold-1/50" />
              <p className="text-sm text-muted dark:text-white/60">No teams created yet. Create projects and teams to get started.</p>
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="card-surface p-5">
              <h3 className="font-heading font-bold text-navy dark:text-white mb-3">Unassigned employees</h3>
              <div className="flex flex-wrap gap-2">
                {unassigned.map((e) => (
                  <span key={e.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-navy-dark/80 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 text-xs font-bold">
                    <UserPlus size={12} /> {e.fullName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="card-surface p-6">
          <h3 className="font-heading font-bold text-navy dark:text-white mb-1">Reporting hierarchy</h3>
          <p className="text-sm text-muted dark:text-white/60 mb-4">Manager → direct reports. Click the chevron to expand a reporting line.</p>
          {hierarchy.length === 0 ? (
            <p className="text-sm text-muted dark:text-white/60">No reporting structure defined yet.</p>
          ) : (
            <div className="space-y-1">{hierarchy.map((n) => renderNode(n, 0))}</div>
          )}
        </div>
      )}

      {tab === 'people' && (
        <div className="card-surface p-6">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, code, team..." className="w-full max-w-md h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-sm text-navy dark:text-white mb-4" />
          <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-amber-50/50 border-b border-navy/10">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Team</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Designation</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="border-b border-navy/5 dark:border-white/5 hover:bg-amber-50/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={e.fullName} size={8} />
                        <div>
                          <div className="text-sm font-bold text-navy dark:text-white">{e.fullName}</div>
                          <div className="text-xs text-navy/50 dark:text-white/50">{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{e.role}</span></td>
                    <td className="px-4 py-3 text-sm text-navy dark:text-white">{e.primaryTeam?.name || 'Not assigned'}</td>
                    <td className="px-4 py-3 text-sm text-navy dark:text-white">{e.department || '—'}</td>
                    <td className="px-4 py-3 text-sm text-navy dark:text-white">{e.designation || e.jobRole || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}