import useStore from '../store'
import ThemeToggle from './ThemeToggle'
import { LogOut } from 'lucide-react'

const viewLabels = {
  hrHome: 'HR home', hrControl: 'HR control', apply: 'My leave',
  onboarding: 'My onboarding', tickets: 'Tickets',
  register: 'New employee onboarding', projects: 'Projects & teams',
  balances: 'Bulk uploads', directory: 'Directory', review: 'Leave review',
  overview: 'Overview', calendar: 'Leave calendar', orgchart: 'Pyramid',
  candidateForm: 'Apply as candidate', hrOnboard: 'Onboarding dashboard',
  offboard: 'Offboarding', assets: 'Assets',
  lifecycle: 'Probation & appraisal', hrdocs: 'Salary & documents',
  dashboard: 'Dashboard', analytics: 'Analytics',
  attendance: 'Attendance', announcements: 'Announcements',
  knowledgebase: 'Knowledge base',
  moodtracker: 'Mood tracker',
  skillsbragboard: 'Skills & brags',
  carpool: 'Carpool',
  bookings: 'Desk & room booking',
  mentorship: 'Mentorship',
  rewards: 'Rewards store',
  expenses: 'Expenses',
  timesheets: 'Timesheets',
  training: 'Training',
  loans: 'Loans',
  shifts: 'Shifts',
  visitors: 'Visitors',
  surveys: 'Surveys',
  benefits: 'Benefits',
  notifications: 'Notifications',
  internalMobility: 'Internal jobs',
  compliance: 'Compliance',
  contractors: 'Contractors',
  resilienceDashboard: 'Org health',
  workforceEmployees: 'WF Employees',
  whatIfSimulator: 'What-If',
  spofAnalysis: 'SPOFs',
  skillGapAnalysis: 'Skill gaps',
  successionPlanning: 'Succession',
  knowledgeConcentration: 'Knowledge',
  workforceReadiness: 'Readiness',
  resilienceReport: 'Report',
  dataUpload: 'Upload data',
  resilienceAiChat: 'AI assistant',
  governancePanel: 'Governance'
}

export default function Sidebar({ onLogout }) {
  const { currentUser, activeView, setActiveView } = useStore()
  const views = currentUser?.views || []

  return (
    <aside className="w-64 shrink-0">
      <div className="card-surface p-4 sticky top-4 space-y-4">
        <div className="px-3 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80">
          <div className="font-bold text-sm text-navy dark:text-white">{currentUser?.fullName}</div>
          <div className="text-xs font-bold text-navy/50 dark:text-white/50 mt-0.5">{currentUser?.roleLabel || currentUser?.role}</div>
        </div>
        <div>
          <div className="text-xs font-bold text-navy dark:text-white uppercase tracking-widest mb-2 px-3">Workspace</div>
          <nav className="space-y-1.5">
            {views.map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeView === view
                    ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark shadow-lg'
                    : 'text-navy/70 dark:text-white/70 hover:bg-navy/5 dark:hover:bg-white/5 border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80'
                }`}
              >
                {viewLabels[view] || view}
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-3 border-t border-navy/10 dark:border-white/10 space-y-2">
          <ThemeToggle />
          <button onClick={() => setActiveView('settings')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy/70 dark:text-white/70 hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-1 dark:hover:text-gold-1 hover:border-gold-200 dark:hover:border-gold-800 transition-all flex items-center gap-2">
            <svg size={14} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Settings
          </button>
          <button onClick={onLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy/70 dark:text-white/70 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all flex items-center gap-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
