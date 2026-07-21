import { useState } from 'react'
import useStore from '../store'
import Sidebar from './Sidebar'
import LeaveHome from './LeaveHome'
import EmployeeOnboarding from './EmployeeOnboarding'
import TicketManagement from './TicketManagement'
import HrRegistration from './HrRegistration'
import HrBulkUploads from './HrBulkUploads'
import ReviewerInbox from './ReviewerInbox'
import Directory from './Directory'
import LeadershipOverview from './LeadershipOverview'
import LeaveCalendar from './LeaveCalendar'
import CandidateOnboarding from './CandidateOnboarding'
import HrOnboardingDashboard from './HrOnboardingDashboard'
import OffboardingDashboard from './OffboardingDashboard'
import HrHome from './HrHome'
import HrControlPanel from './HrControlPanel'
import Settings from './Settings'
import { Menu, X } from 'lucide-react'

const meta = {
  hrHome: { label: 'HR', title: 'Run HR operations in the right sequence', subtitle: 'Start with company-controlled onboarding and reviews, then move to your own tasks.' },
  hrControl: { label: 'HR', title: 'Control leave policy', subtitle: 'Manage employee-facing leave options from one place.' },
  apply: { label: 'Employee', title: 'Plan time away with clarity', subtitle: 'Apply for leave, see who will approve it, and keep the request tidy.' },
  onboarding: { label: 'Employee', title: 'Complete onboarding part 2', subtitle: 'Employee side of onboarding for identity details and documents.' },
  tickets: { label: 'Tickets', title: 'Raise and manage support tickets', subtitle: 'Submit HR, asset, or general requests and track them through resolution.' },
  register: { label: 'HR', title: 'Complete company onboarding part 1', subtitle: 'Capture official employee records and trigger the onboarding invite.' },
  balances: { label: 'HR', title: 'Maintain leave ledgers', subtitle: 'Upload and adjust leave balances for the live workforce.' },
  review: { label: 'Reviewer', title: 'Review employee leave requests', subtitle: 'See pending leave requests routed to you.' },
  directory: { label: 'Directory', title: 'Read the organization at a glance', subtitle: 'See primary teams, approvers, and growth across the directory.' },
  overview: { label: 'Leadership', title: 'Read the organization at a glance', subtitle: 'Track headcount, team ownership, and approval coverage.' },
  calendar: { label: 'Calendar', title: 'Leave calendar across the organization', subtitle: 'Month-wise view of leave activity and holidays.' },
  candidateForm: { label: 'Candidate', title: 'New candidate onboarding', subtitle: 'Submit your details to begin the onboarding process.' },
  hrOnboard: { label: 'HR', title: 'HR onboarding dashboard', subtitle: 'Review candidates, approve onboarding, and complete setup steps.' },
  offboard: { label: 'HR', title: 'Offboarding dashboard', subtitle: 'Manage employee offboarding including asset handover and ID deactivation.' },
  settings: { label: 'Account', title: 'Settings', subtitle: 'Manage your account settings and preferences.' }
}

export default function AppLayout({ onLogout }) {
  const { activeView, currentUser } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const m = meta[activeView] || meta.apply

  const goHome = () => useStore.getState().setActiveView(
    ['HRL2', 'HR'].includes(useStore.getState().currentUser?.role) ? 'hrHome'
    : ['OrganizationHead', 'ManagerL2', 'Manager'].includes(useStore.getState().currentUser?.role) ? 'overview'
    : 'apply'
  )

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-dark/80 backdrop-blur-md border-b border-navy/10 dark:border-white/10">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-xl hover:bg-navy/5 dark:hover:bg-white/5 text-navy/70 dark:text-white/70">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
              <img src="/relisoft-logo.webp" alt="ReliSoft" className="h-8 w-auto" />
              <div className="hidden sm:block">
                <div className="font-heading font-extrabold text-navy dark:text-white text-sm">ReliSoft Technologies</div>
                <div className="text-muted dark:text-white/40 text-[10px]">Phase 1 — Core HR</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-1/10 text-gold-1 text-[10px] font-bold">
              Phase 1
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy/5 dark:bg-white/5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-[10px] font-bold text-navy-dark">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-xs font-bold text-navy dark:text-white">{currentUser?.fullName}</div>
                <div className="text-[10px] text-muted dark:text-white/40">{currentUser?.roleLabel || currentUser?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed md:static inset-0 top-14 z-20 md:z-auto`}>
          <div className="absolute md:relative inset-0 bg-black/20 md:bg-transparent" onClick={() => setSidebarOpen(false)} />
          <div className="absolute md:relative left-0 top-0 h-full md:h-auto">
            <Sidebar onLogout={onLogout} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-4">
          {activeView !== 'hrHome' && (
            <div className="card-surface p-4 md:p-5">
              <span className="section-kicker">{m.label}</span>
              <h2 className="section-title text-xl md:text-2xl mt-1">{m.title}</h2>
              <p className="text-muted dark:text-white/60 text-xs md:text-sm mt-0.5">{m.subtitle}</p>
            </div>
          )}
          {activeView === 'hrHome' && <HrHome />}
          {activeView === 'hrControl' && <HrControlPanel />}
          {activeView === 'apply' && <LeaveHome />}
          {activeView === 'onboarding' && <EmployeeOnboarding />}
          {activeView === 'tickets' && <TicketManagement />}
          {activeView === 'register' && <HrRegistration />}
          {activeView === 'balances' && <HrBulkUploads />}
          {activeView === 'review' && <ReviewerInbox />}
          {activeView === 'directory' && <Directory />}
          {activeView === 'overview' && <LeadershipOverview />}
          {activeView === 'calendar' && <LeaveCalendar />}
          {activeView === 'candidateForm' && <CandidateOnboarding />}
          {activeView === 'hrOnboard' && <HrOnboardingDashboard />}
          {activeView === 'offboard' && <OffboardingDashboard />}
          {activeView === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
