import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ClipboardCheck, CalendarClock, Clock, CalendarDays,
  DollarSign, HeartHandshake,
  UserPlus, Briefcase, TrendingUp, GraduationCap,
  TicketCheck, Monitor, Plane, FileText,
  MessageSquare, Award, Building2, DoorOpen,
  ShieldCheck, LogOut, GitBranch,
  BarChart3, FileSpreadsheet, Bell,
  Bot, Zap, Puzzle,
  Settings, Smartphone, Code2,
  ChevronLeft, ChevronDown, User,
  Activity, AlertTriangle, BrainCircuit, Brain, Upload,
  Target, ArrowLeftRight, Gift, UserCog, Compass, Scale, PenTool, PieChart,
  ConciergeBell, Laptop, Key, ShoppingCart, ShoppingBag,
  Package, FileCheck, FileSignature, BookOpen,
  BadgeCheck,   UserCheck, DoorOpen as GateIcon,
  AppWindow, FileStack, SlidersHorizontal, ScrollText,
  UserRoundCog, Palette, Megaphone, Newspaper
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const role = user?.role || 'employee'
  const isAdmin = ['superadmin', 'admin'].includes(role)
  const isHR = ['superadmin', 'admin', 'hr'].includes(role)
  const isManager = ['superadmin', 'admin', 'hr', 'manager'].includes(role)
  const isIT = ['superadmin', 'admin', 'it'].includes(role)
  const isFinance = ['superadmin', 'admin', 'finance'].includes(role)

  const navItems = useMemo(() => [
    {
      category: 'Core HR',
      roles: ['superadmin', 'admin', 'hr', 'manager', 'team_lead', 'employee', 'finance', 'it'],
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
        { label: 'Employees', path: '/employees', icon: Users, roles: ['superadmin', 'admin', 'hr', 'manager'] },
        { label: 'Attendance', path: '/attendance', icon: ClipboardCheck, roles: ['superadmin', 'admin', 'hr', 'manager'] },
        { label: 'Leaves', path: '/leaves', icon: CalendarClock, roles: ['*'] },
        { label: 'Directory', path: '/workspace/directory', icon: Users, roles: ['*'] },
        { label: 'HR Home', path: '/workspace/hr-home', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Projects & Teams', path: '/workspace/projects', icon: Building2, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Overview', path: '/workspace/overview', icon: BarChart3, roles: ['superadmin', 'admin'] },
        { label: 'Shifts', path: '/shifts', icon: Clock, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Holidays', path: '/holidays', icon: CalendarDays, roles: ['*'] },
        { label: 'Timesheets', path: '/timesheets', icon: Clock, roles: ['*'] },
        { label: 'My Profile', path: '/employees/me', icon: User, roles: ['employee', 'team_lead', 'manager'] },
      ],
    },
    {
      category: 'Payroll & Finance',
      roles: ['superadmin', 'admin', 'hr', 'finance', 'manager'],
      items: [
        { label: 'Payroll', path: '/payroll', icon: DollarSign, roles: ['superadmin', 'admin', 'hr', 'finance'] },
        { label: 'FnF', path: '/fnf', icon: HeartHandshake, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Expenses', path: '/expenses', icon: DollarSign, roles: ['superadmin', 'admin', 'hr', 'finance'] },
        { label: 'Benefits Admin', path: '/benefits', icon: Gift, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Invoices', path: '/invoices', icon: FileSignature, roles: ['superadmin', 'admin', 'finance'] },
      ],
    },
    {
      category: 'Service Catalog & ITSM',
      roles: ['*'],
      items: [
        { label: 'Service Catalog', path: '/service-catalog', icon: ConciergeBell, roles: ['*'] },
        { label: 'Service Requests', path: '/service-requests', icon: FileStack, roles: ['superadmin', 'admin', 'hr', 'it'] },
        { label: 'IT Assets', path: '/it-assets', icon: Laptop, roles: ['superadmin', 'admin', 'it', 'hr'] },
        { label: 'Software Licenses', path: '/software-licenses', icon: Key, roles: ['superadmin', 'admin', 'it'] },
        { label: 'Helpdesk', path: '/helpdesk', icon: TicketCheck, roles: ['*'] },
        { label: 'HR Support Tickets', path: '/hr-tickets', icon: TicketCheck, roles: ['*'] },
      ],
    },
    {
      category: 'Procurement',
      roles: ['superadmin', 'admin', 'hr', 'finance'],
      items: [
        { label: 'Requisitions', path: '/purchase-requisitions', icon: ShoppingCart, roles: ['superadmin', 'admin', 'hr', 'finance'] },
        { label: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag, roles: ['superadmin', 'admin', 'finance'] },
        { label: 'Goods Receipt', path: '/goods-receipts', icon: Package, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      category: 'Talent',
      roles: ['superadmin', 'admin', 'hr', 'manager'],
      items: [
        { label: 'Recruitment', path: '/recruitment', icon: UserPlus, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Onboarding', path: '/onboarding', icon: Briefcase, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Performance', path: '/performance', icon: TrendingUp, roles: ['superadmin', 'admin', 'hr', 'manager'] },
        { label: 'Training', path: '/training', icon: GraduationCap, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Workforce Planning', path: '/workforce-planning', icon: Target, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Internal Mobility', path: '/internal-mobility', icon: ArrowLeftRight, roles: ['*'] },
      ],
    },
    {
      category: 'Workplace',
      roles: ['*'],
      items: [
        { label: 'Assets', path: '/assets', icon: Monitor, roles: ['superadmin', 'admin', 'hr', 'it'] },
        { label: 'Travel', path: '/travel', icon: Plane, roles: ['*'] },
        { label: 'Documents', path: '/documents', icon: FileText, roles: ['*'] },
        { label: 'Document Templates', path: '/document-templates', icon: ScrollText, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Contractors', path: '/contractors', icon: UserCog, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Visitors', path: '/visitors', icon: Building2, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Gate Passes', path: '/gate-passes', icon: GateIcon, roles: ['*'] },
        { label: 'Virtual ID Card', path: '/virtual-id-card', icon: BadgeCheck, roles: ['*'] },
        { label: 'Bulk Upload', path: '/excel/upload', icon: Upload, roles: ['superadmin', 'admin', 'hr'] },
      ],
    },
    {
      category: 'Policies & Compliance',
      roles: ['superadmin', 'admin', 'hr'],
      items: [
        { label: 'Policies', path: '/policies', icon: BookOpen, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'HR Policies', path: '/hr/policy', icon: ShieldCheck, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Compliance', path: '/compliance', icon: ShieldCheck, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Case Management', path: '/case-management', icon: Scale, roles: ['superadmin', 'admin', 'hr'] },
      ],
    },
    {
      category: 'Employee Self-Service',
      roles: ['employee', 'team_lead', 'manager'],
      items: [
        { label: 'Profile Changes', path: '/profile-change-requests', icon: UserCheck, roles: ['*'] },
        { label: 'My ID Card', path: '/virtual-id-card', icon: BadgeCheck, roles: ['*'] },
        { label: 'My Service Requests', path: '/service-catalog', icon: AppWindow, roles: ['*'] },
        { label: 'My Onboarding', path: '/onboarding/my', icon: Briefcase, roles: ['*'] },
      ],
    },
    {
      category: 'Engagement',
      roles: ['*'],
      items: [
        { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['*'] },
        { label: 'Social Feed', path: '/social-feed', icon: MessageSquare, roles: ['*'] },
        { label: 'Surveys', path: '/surveys', icon: ClipboardCheck, roles: ['*'] },
        { label: 'Recognition', path: '/recognition', icon: Award, roles: ['*'] },
        { label: 'Alumni Portal', path: '/alumni', icon: DoorOpen, roles: ['*'] },
        { label: 'News Feed', path: '/news', icon: Newspaper, roles: ['*'] },
        { label: 'Cultural Compass', path: '/mandir-darshan', icon: Compass, roles: ['*'] },
      ],
    },
    {
      category: 'Governance',
      roles: ['superadmin', 'admin', 'hr'],
      items: [
        { label: 'Separation', path: '/separation', icon: LogOut, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Workflow', path: '/workflows', icon: GitBranch, roles: ['superadmin', 'admin'] },
        { label: 'Security', path: '/security', icon: ShieldCheck, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      category: 'Intelligence',
      roles: ['superadmin', 'admin', 'hr', 'manager'],
      items: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Reports', path: '/reports', icon: FileSpreadsheet, roles: ['superadmin', 'admin', 'hr', 'manager'] },
        { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['*'] },
        { label: 'Talent Analytics', path: '/talent-analytics', icon: PieChart, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Smart Forms', path: '/smart-forms', icon: PenTool, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      category: 'Workforce Resilience',
      roles: ['superadmin', 'admin', 'hr', 'manager'],
      items: [
        { label: 'Resilience Home', path: '/resilience', icon: Activity, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Org Health', path: '/resilience/dashboard', icon: Activity, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'What-If Simulator', path: '/resilience/whatif', icon: BrainCircuit, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'SPOF Ranking', path: '/resilience/spof', icon: AlertTriangle, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Employees', path: '/resilience/employees', icon: Users, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Skill Gaps', path: '/resilience/skill-gaps', icon: BarChart3, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Succession Planning', path: '/resilience/succession', icon: GitBranch, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Knowledge Risk', path: '/resilience/knowledge-concentration', icon: Brain, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Workforce Readiness', path: '/resilience/workforce-readiness', icon: TrendingUp, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'Resilience Report', path: '/resilience/report', icon: FileText, roles: ['superadmin', 'admin', 'hr'] },
        { label: 'AI Assistant', path: '/resilience/assistant', icon: Bot, roles: ['*'] },
        { label: 'Upload Data', path: '/resilience/upload', icon: Upload, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      category: 'AI & Automation',
      roles: ['*'],
      items: [
        { label: 'Nova AI Companion', path: '/ai-companion', icon: Bot, roles: ['*'] },
        { label: 'HR Assistant', path: '/hr-assistant', icon: HeartHandshake, roles: ['*'] },
        { label: 'Automation', path: '/automation', icon: Zap, roles: ['superadmin', 'admin'] },
        { label: 'Integrations', path: '/integrations', icon: Puzzle, roles: ['superadmin', 'admin', 'it'] },
        { label: 'AI Council', path: '/ai-council', icon: BrainCircuit, roles: ['superadmin', 'admin'] },
        { label: 'SDD Dashboard', path: '/sdd', icon: Code2, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      category: 'System',
      roles: ['superadmin', 'admin'],
      items: [
        { label: 'Admin Panel', path: '/admin', icon: Settings, roles: ['superadmin', 'admin'] },
        { label: 'Mobile', path: '/mobile', icon: Smartphone, roles: ['*'] },
        { label: 'Visa', path: '/visa', icon: FileText, roles: ['superadmin', 'admin', 'hr'] },

      ],
    },
  ], [])

  const hasAccess = (itemRoles) => {
    if (itemRoles.includes('*')) return true
    return itemRoles.includes(role)
  }

  const visibleCategories = navItems.filter((cat) => {
    if (cat.roles.includes('*')) return true
    return cat.roles.includes(role)
  })

  const theme = useAuthStore((s) => s.theme)

  const themeLabels = { default: 'Professional', maharashtra: 'Maharashtra Culture', fun: '🏏 Cricket & Fun' }

  const [expandedCategories, setExpandedCategories] = useState(
    visibleCategories.reduce((acc, cat) => ({ ...acc, [cat.category]: true }), {})
  )

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ background: 'var(--panel)', borderRight: '1px solid var(--line)' }}
    >
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="h-8 w-8 rounded-lg flex items-center justify-center icon-gradient flex-shrink-0">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        {!collapsed && <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--moss)' }}>ReliSoft HR</span>}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1">
        {visibleCategories.map((category) => (
          <div key={category.category}>
            {!collapsed && (
              <button
                onClick={() => toggleCategory(category.category)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted)' }}
              >
                {category.category}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    expandedCategories[category.category] ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
            {expandedCategories[category.category] &&
              category.items
                .filter((item) => hasAccess(item.roles))
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link ${
                      isActive(item.path)
                        ? 'sidebar-link-active'
                        : 'sidebar-link-inactive'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                ))}
          </div>
        ))}
      </nav>

      <div className="pt-3 pb-0 px-4 flex-shrink-0" style={{ borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div className="flex items-center gap-2 px-1 mb-2">
          <Palette className="h-3 w-3" style={{ color: 'var(--moss)' }} />
          {!collapsed && <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>{themeLabels[theme] || 'Default'}</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 icon-gradient">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{user?.name || 'User'}</p>
              <p className="text-xs truncate capitalize" style={{ color: 'var(--muted)' }}>{user?.role || ''}</p>
            </div>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={logout}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--muted)' }}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="mt-3 flex items-center justify-center w-full p-2 rounded-lg transition-colors"
          style={{ color: 'var(--muted)' }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
        {!collapsed && <div className="h-2 mt-2" />}
      </div>
    </aside>
  )
}