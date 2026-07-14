import useStore from '../store'

export default function LeadershipOverview() {
  const { data } = useStore()
  const teamCount = data.projects.reduce((s, p) => s + p.teams.length, 0)
  const hrCount = data.employees.filter((e) => e.role === 'HR' || e.role === 'HRL2').length
  const managerCount = data.employees.filter((e) => e.role === 'Manager' || e.role === 'ManagerL2').length

  function Signal({ value, label }) {
    return (
      <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
        <strong className="text-2xl text-navy dark:text-white block">{value}</strong>
        <span className="text-xs font-bold text-navy/50 dark:text-white/50 mt-1 block">{label}</span>
      </div>
    )
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Leadership overview</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">A compact read on structure, approval ownership, and current scale.</p>
      </div>
      <div className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Signal value={data.employees.length} label="Employees" />
          <Signal value={data.projects.length} label="Projects" />
          <Signal value={teamCount} label="Teams" />
          <Signal value={managerCount} label="Managers" />
          <Signal value={hrCount} label="HR members" />
        </div>
        <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-amber-50/50 border-b border-navy/10 dark:border-white/10">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Hierarchy band</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Current count</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Who sits here</th>
              </tr>
            </thead>
            <tbody>
              {[
                { band: 'Organization head', employees: data.employees.filter((e) => e.role === 'OrganizationHead') },
                { band: 'HR hierarchy', employees: data.employees.filter((e) => e.role === 'HR' || e.role === 'HRL2') },
                { band: 'Manager hierarchy', employees: data.employees.filter((e) => e.role === 'Manager' || e.role === 'ManagerL2') },
                { band: 'Team leads', employees: data.employees.filter((e) => e.role === 'TeamLead') }
              ].map(({ band, employees }) => (
                <tr key={band} className="border-b border-navy/5 dark:border-white/5">
                  <td className="px-4 py-3 text-sm font-bold text-navy dark:text-white">{band}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{employees.length}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{employees.map((e) => e.fullName + (e.roleLabel || e.role !== band ? ` (${e.roleLabel || e.role})` : '')).join(', ') || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
