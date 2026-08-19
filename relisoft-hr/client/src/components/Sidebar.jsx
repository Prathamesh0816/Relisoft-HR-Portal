import useStore from '../store'
import { LogOut, Home, CalendarCheck, Ticket, UserPlus, Users, ClipboardCheck, Settings, Briefcase, DoorOpen, ChevronRight, ArrowUpRight, Wallet, Star, Award, Gift, BadgeCheck, FileText, BarChart3, GitBranch, LayoutDashboard, Clock, ClipboardList, Receipt, ListChecks, Sparkles, GraduationCap, HeartHandshake, MessagesSquare, Car, Smile, BookOpen, Megaphone, Bell, Package, HardHat, Repeat, ShieldCheck, Scale, Upload, Activity, AlertTriangle, TrendingUp, Bot, UserCircle, Network } from 'lucide-react'

const sections = [
  {
    label: 'HR',
    roles: ['HRL2', 'HR'],
    items: [
      { view: 'hrHome', label: 'HR Home', icon: Home },
      { view: 'hrControl', label: 'Leave Policy', icon: ClipboardCheck },
      { view: 'register', label: 'New Employee', icon: UserPlus },
      { view: 'projects', label: 'Projects', icon: Briefcase },
      { view: 'balances', label: 'Bulk Uploads', icon: ChevronRight },
      { view: 'hrOnboard', label: 'Onboarding', icon: Users },
      { view: 'offboard', label: 'Offboarding', icon: DoorOpen },
      { view: 'carryForward', label: 'Carry Forward', icon: ArrowUpRight },
    ]
  },
  {
    label: 'People & Appraisal',
    roles: ['HRL2', 'HR', 'Manager', 'ManagerL2', 'OrganizationHead'],
    items: [
      { view: 'lifecycle', label: 'Probation & Appraisal', icon: BadgeCheck },
      { view: 'docsSalary', label: 'Increments & Documents', icon: FileText },
      { view: 'analytics', label: 'Workforce Analytics', icon: BarChart3 },
      { view: 'orgchart', label: 'Organization Chart', icon: GitBranch },
    ]
  },
  {
    label: 'Recognition',
    items: [
      { view: 'recognition', label: 'Recognition & Awards', icon: Award },
      { view: 'rewards', label: 'Rewards Store', icon: Gift },
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { view: 'recruitment', label: 'Hiring', icon: Briefcase },
    ]
  },
  {
    label: 'Org & Teams',
    items: [
      { view: 'teams', label: 'Teams & Hierarchy', icon: Network },
      { view: 'directory', label: 'Directory', icon: Users },
    ]
  },
  {
    label: 'Employee',
    items: [
      { view: 'profile', label: 'My Profile', icon: UserCircle },
      { view: 'employeeDashboard', label: 'Dashboard', icon: LayoutDashboard },
      { view: 'apply', label: 'Apply Leave', icon: CalendarCheck },
      { view: 'onboarding', label: 'My Onboarding', icon: UserPlus },
      { view: 'tickets', label: 'Tickets', icon: Ticket },
      { view: 'attendance', label: 'My Attendance', icon: Clock },
      { view: 'timesheets', label: 'My Timesheets', icon: ClipboardList },
      { view: 'expenses', label: 'Expenses', icon: Receipt },
      { view: 'surveys', label: 'Surveys', icon: ListChecks },
      { view: 'skills', label: 'Skills & Brags', icon: Sparkles },
      { view: 'training', label: 'Training & Learning', icon: GraduationCap },
      { view: 'loans', label: 'Loans & Advances', icon: Wallet },
      { view: 'benefits', label: 'Benefits', icon: HeartHandshake },
      { view: 'mentorship', label: 'Mentorship', icon: MessagesSquare },
      { view: 'carpool', label: 'Carpool', icon: Car },
      { view: 'bookings', label: 'Desk & Room Booking', icon: DoorOpen },
      { view: 'mood', label: 'Mood & Wellness', icon: Smile },
      { view: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
      { view: 'announcements', label: 'Announcements', icon: Megaphone },
      { view: 'notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    label: 'Manager & Admin',
    roles: ['HRL2', 'HR', 'Admin', 'SuperAdmin', 'Manager', 'ManagerL2', 'OrganizationHead'],
    items: [
      { view: 'assets', label: 'Assets', icon: Package },
      { view: 'visitors', label: 'Visitors', icon: DoorOpen },
      { view: 'contractors', label: 'Contractors', icon: HardHat },
      { view: 'internalMobility', label: 'Internal Mobility', icon: Repeat },
      { view: 'compliance', label: 'Compliance', icon: ShieldCheck },
      { view: 'governance', label: 'Governance', icon: Scale },
      { view: 'dataUpload', label: 'Data Upload', icon: Upload },
      { view: 'workforce', label: 'Workforce', icon: Users },
      { view: 'resilience', label: 'Resilience', icon: Activity },
      { view: 'readiness', label: 'Workforce Readiness', icon: ShieldCheck },
      { view: 'spof', label: 'Single Point of Failure', icon: AlertTriangle },
      { view: 'succession', label: 'Succession Planning', icon: GitBranch },
      { view: 'skillGaps', label: 'Skill Gap Analysis', icon: TrendingUp },
      { view: 'knowledgeConc', label: 'Knowledge Concentration', icon: BookOpen },
      { view: 'whatIf', label: 'What-If Simulator', icon: BarChart3 },
      { view: 'resilienceReport', label: 'Resilience Report', icon: FileText },
      { view: 'resilienceChat', label: 'Resilience AI', icon: Bot },
    ]
  },
  {
    label: 'Reviews',
    items: [
        { view: 'review', label: 'Leave Review', icon: ClipboardCheck },
        { view: 'leaveReports', label: 'Leave Reports', icon: ClipboardCheck },
    ]
  },
  {
    label: 'Payroll & Reviews',
    items: [
      { view: 'payroll', label: 'Payroll', icon: Wallet },
      { view: 'reviews', label: 'Performance Reviews', icon: Star },
    ]
  },
  {
    label: 'Tools',
    items: [
      { view: 'overview', label: 'Overview', icon: Briefcase },
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
            const shown = section.items.filter(
                (item) => !userViews.length || userViews.includes(item.view)
            )
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
