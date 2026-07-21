import useStore from '../store'
import { LogOut, Home, CalendarCheck, Ticket, UserPlus, Users, ClipboardCheck, Settings, Briefcase, DoorOpen, ChevronRight } from 'lucide-react'

const sections = [
  {
    label: 'HR',
    roles: ['HRL2', 'HR'],
    items: [
      { view: 'hrHome', label: 'HR Home', icon: Home },
      { view: 'hrControl', label: 'Leave Policy', icon: ClipboardCheck },
      { view: 'register', label: 'New Employee', icon: UserPlus },
      { view: 'balances', label: 'Bulk Uploads', icon: ChevronRight },
      { view: 'hrOnboard', label: 'Onboarding', icon: Users },
      { view: 'offboard', label: 'Offboarding', icon: DoorOpen },
    ]
  },
  {
    label: 'Employee',
    items: [
      { view: 'apply', label: 'Apply Leave', icon: CalendarCheck },
      { view: 'onboarding', label: 'My Onboarding', icon: UserPlus },
      { view: 'tickets', label: 'Tickets', icon: Ticket },
    ]
  },
  {
    label: 'Reviews',
    roles: ['HRL2', 'HR', 'OrganizationHead', 'ManagerL2', 'Manager', 'TeamLead'],
    items: [
      { view: 'review', label: 'Leave Review', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Tools',
    items: [
      { view: 'overview', label: 'Overview', icon: Briefcase },
      { view: 'directory', label: 'Directory', icon: Users },
      { view: 'calendar', label: 'Leave Calendar', icon: CalendarCheck },
      { view: 'settings', label: 'Settings', icon: Settings },
    ]
  }
]

export default function Sidebar({ onLogout, onNavigate }) {
  const { currentUser, activeView, setActiveView } = useStore()
  const role = currentUser?.role || ''
  const userViews = currentUser?.views || []

  const visible = (roles) => !roles || roles.includes(role)

  const handleNav = (view) => {
    setActiveView(view)
    onNavigate?.()
  }

  return (
    <aside className="w-56 md:w-60 bg-white dark:bg-navy-dark/95 border-r border-navy/10 dark:border-white/10 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-3 space-y-1">
        {sections.map((section) => {
          if (!visible(section.roles)) return null
          const shown = section.items.filter((i) => userViews.includes(i.view))
          if (!shown.length) return null
          return (
            <div key={section.label}>
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-navy/40 dark:text-white/40 uppercase tracking-widest">
                {section.label}
              </div>
              {shown.map((item) => {
                const Icon = item.icon
                const active = activeView === item.view
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNav(item.view)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark shadow-md'
                        : 'text-navy/60 dark:text-white/60 hover:bg-navy/5 dark:hover:bg-white/5 hover:text-navy dark:hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="sticky bottom-0 bg-white dark:bg-navy-dark/95 border-t border-navy/10 dark:border-white/10 p-3">
        <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-navy/60 dark:text-white/60 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  )
}
