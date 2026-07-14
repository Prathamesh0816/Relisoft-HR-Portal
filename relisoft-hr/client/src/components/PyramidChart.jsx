import useStore from '../store'

const BAND_COLORS = [
  { bg: 'from-gold-1 to-gold-2', text: 'text-navy-dark' },
  { bg: 'from-navy to-navy-dark', text: 'text-white' },
  { bg: 'from-navy-dark to-black', text: 'text-white' }
]

export default function PyramidChart() {
  const { data } = useStore()

  const roles = ['C-Level', 'OrganizationHead', 'ManagerL2', 'Manager', 'TeamLead', 'Employee']
  const bands = roles.map((role) => ({
    role,
    count: data.employees.filter((e) => e.roleName === role).length,
    label: role === 'C-Level' ? 'C-Level Executives' :
           role === 'OrganizationHead' ? 'Organization Heads' :
           role === 'ManagerL2' ? 'Sr. Managers' :
           role === 'Manager' ? 'Managers' :
           role === 'TeamLead' ? 'Team Leads' : 'Employees'
  })).filter((b) => b.count > 0)

  const maxCount = Math.max(...bands.map((b) => b.count), 1)
  const centerIdx = Math.floor(bands.length / 2)

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Organization pyramid</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Hierarchy view of headcount distribution across roles.</p>
      </div>
      <div className="px-5 pb-5 space-y-3">
        {bands.map((band, i) => {
          const pct = (band.count / maxCount) * 100
          const color = BAND_COLORS[i % BAND_COLORS.length]
          return (
            <div key={band.role} className="flex flex-col items-center">
              <div className={`w-full max-w-[600px] rounded-xl py-2.5 px-5 bg-gradient-to-r ${color.bg} ${color.text} text-center`}
                   style={{ width: `${55 + pct * 0.45}%` }}>
                <div className="font-heading font-bold text-sm">{band.label}</div>
                <div className="font-bold text-lg">{band.count}</div>
              </div>
              {i < bands.length - 1 && <div className="w-px h-4 bg-navy/20" />}
            </div>
          )
        })}
      </div>
      <div className="px-5 pb-5">
        <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
          <span className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Summary</span>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gold-1" />
              <span className="text-xs text-navy/70 dark:text-white/70">Leadership: {bands.filter((b) => ['C-Level','OrganizationHead','ManagerL2'].includes(b.role)).reduce((a, b) => a + b.count, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-navy dark:bg-navy-dark" />
              <span className="text-xs text-navy/70 dark:text-white/70">Management: {bands.filter((b) => ['Manager','TeamLead'].includes(b.role)).reduce((a, b) => a + b.count, 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-navy-dark" />
              <span className="text-xs text-navy/70 dark:text-white/70">Employees: {bands.filter((b) => b.role === 'Employee').reduce((a, b) => a + b.count, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
