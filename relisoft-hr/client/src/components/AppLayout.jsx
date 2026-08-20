import LeaveReports from './LeaveReports'
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
import CarryForwardAdmin from './CarryForwardAdmin'
import Settings from './Settings'
import ProjectBuilder from './ProjectBuilder'
import PayrollManagement from './PayrollManagement'
import ReviewsPage from './ReviewsPage'
import Recognition from './Recognition'
import RewardsStore from './RewardsStore'
import HrLifecycle from './HrLifecycle'
import HrDocsSalary from './HrDocsSalary'
import HrAnalytics from './HrAnalytics'
import PyramidChart from './PyramidChart'
import EmployeeDashboard from './EmployeeDashboard'
import AttendanceTracker from './AttendanceTracker'
import TimesheetTracker from './TimesheetTracker'
import ExpenseManagement from './ExpenseManagement'
import SurveyBuilder from './SurveyBuilder'
import SkillsBragBoard from './SkillsBragBoard'
import TrainingLearning from './TrainingLearning'
import LoanManagement from './LoanManagement'
import BenefitsPortal from './BenefitsPortal'
import MentorshipProgram from './MentorshipProgram'
import CarpoolManager from './CarpoolManager'
import DeskRoomBooking from './DeskRoomBooking'
import MoodTracker from './MoodTracker'
import KnowledgeBase from './KnowledgeBase'
import Announcements from './Announcements'
import NotificationCenter from './NotificationCenter'
import AssetManagement from './AssetManagement'
import MyAssets from './MyAssets'
import ShiftManager from './ShiftManager'
import ErrorBoundary from './ErrorBoundary'
import VisitorManagement from './VisitorManagement'
import ContractorManager from './ContractorManager'
import InternalMobility from './InternalMobility'
import ComplianceTracker from './ComplianceTracker'
import GovernancePanel from './GovernancePanel'
import DataUpload from './DataUpload'
import WorkforceEmployees from './WorkforceEmployees'
import ResilienceDashboard from './ResilienceDashboard'
import WorkforceReadiness from './WorkforceReadiness'
import SpofAnalysis from './SpofAnalysis'
import SuccessionPlanning from './SuccessionPlanning'
import SkillGapAnalysis from './SkillGapAnalysis'
import KnowledgeConcentration from './KnowledgeConcentration'
import WhatIfSimulator from './WhatIfSimulator'
import ResilienceReport from './ResilienceReport'
import ResilienceAIChat from './ResilienceAIChat'
import Recruitment from './Recruitment'
import Profile from './Profile'
import Teams from './Teams'
import { Menu, X } from 'lucide-react'

const meta = {
  hrHome: { label: 'HR', title: 'Run HR operations in the right sequence', subtitle: 'Start with company-controlled onboarding and reviews, then move to your own tasks.' },
  projects: { label: 'HR', title: 'Projects and teams', subtitle: 'Keep the project structure ready before HR attaches teams to employees.' },
  hrControl: { label: 'HR', title: 'Control leave policy', subtitle: 'Manage employee-facing leave options from one place.' },
  apply: { label: 'Employee', title: 'Plan time away with clarity', subtitle: 'Apply for leave, see who will approve it, and keep the request tidy.' },
  onboarding: { label: 'Employee', title: 'Complete onboarding part 2', subtitle: 'Employee side of onboarding for identity details and documents.' },
  tickets: { label: 'Tickets', title: 'Raise and manage support tickets', subtitle: 'Submit HR, asset, or general requests and track them through resolution.' },
  register: { label: 'HR', title: 'Complete company onboarding part 1', subtitle: 'Capture official employee records and trigger the onboarding invite.' },
  balances: { label: 'HR', title: 'Maintain leave ledgers', subtitle: 'Upload and adjust leave balances for the live workforce.' },
  review: { label: 'Reviewer', title: 'Review employee leave requests', subtitle: 'See pending leave requests routed to you.' },
  leaveReports: {label: 'Reports', title: 'Generate Leave Reports', subtitle: 'Generate monthly and yearly leave reports with employee, team and project filters.'},
  directory: { label: 'Directory', title: 'Read the organization at a glance', subtitle: 'See primary teams, approvers, and growth across the directory.' },
  overview: { label: 'Leadership', title: 'Read the organization at a glance', subtitle: 'Track headcount, team ownership, and approval coverage.' },
  calendar: { label: 'Calendar', title: 'Leave calendar across the organization', subtitle: 'Month-wise view of leave activity and holidays.' },
  candidateForm: { label: 'Candidate', title: 'New candidate onboarding', subtitle: 'Submit your details to begin the onboarding process.' },
  hrOnboard: { label: 'HR', title: 'HR onboarding dashboard', subtitle: 'Review candidates, approve onboarding, and complete setup steps.' },
  offboard: { label: 'HR', title: 'Offboarding dashboard', subtitle: 'Manage employee offboarding including asset handover and ID deactivation.' },
  carryForward: { label: 'HR', title: 'Year-end leave carry-forward', subtitle: 'Preview, process, and audit leave balance carry-forward across financial years.' },
  payroll: { label: 'Payroll', title: 'Payroll', subtitle: 'Salary structures, monthly pay runs, and payslips.' },
  reviews: { label: 'Reviews', title: 'Performance reviews', subtitle: 'Yearly and 6-month scorecards, filled in by the reviewer.' },
  recognition: { label: 'Recognition', title: 'Recognition & awards', subtitle: 'Kudos, monthly/quarterly/annual awards, and Fun Friday celebrations.' },
  rewards: { label: 'Rewards', title: 'Rewards store', subtitle: 'Spend recognition points on rewards from the catalog.' },
  recruitment: { label: 'Recruitment', title: 'Hiring', subtitle: 'Job postings, candidate pipeline, interviews, and offers.' },
  lifecycle: { label: 'People', title: 'Probation & appraisal', subtitle: 'Probation cycles, performance appraisals, and intern-to-permanent conversion.' },
  docsSalary: { label: 'People', title: 'Increments & documents', subtitle: 'Salary discussions, increments, and document generation.' },
  analytics: { label: 'People', title: 'Workforce analytics', subtitle: 'Headcount, probations, appraisals, and ticket health at a glance.' },
  orgchart: { label: 'People', title: 'Organization chart', subtitle: 'Hierarchy view of headcount distribution across roles.' },
  employeeDashboard: { label: 'Employee', title: 'Employee dashboard', subtitle: 'Your stats, attendance, notifications, and quick actions at a glance.' },
  attendance: { label: 'Employee', title: 'Attendance', subtitle: 'Clock in/out and review your daily attendance history.' },
  timesheets: { label: 'Employee', title: 'Timesheets', subtitle: 'Log project hours, submit periods, and track approvals.' },
  expenses: { label: 'Employee', title: 'Expenses', subtitle: 'Submit claims, track reimbursements, and approve team claims.' },
  surveys: { label: 'Employee', title: 'Surveys', subtitle: 'Take active surveys and review your responses.' },
  skills: { label: 'Employee', title: 'Skills & brag board', subtitle: 'Maintain your skills and share wins with the team.' },
  training: { label: 'Employee', title: 'Training & learning', subtitle: 'Browse courses, register, and track certifications.' },
  loans: { label: 'Employee', title: 'Loans & advances', subtitle: 'Apply for loans and track repayment schedules.' },
  benefits: { label: 'Employee', title: 'Benefits', subtitle: 'View plans and manage your enrollments.' },
  mentorship: { label: 'Employee', title: 'Mentorship', subtitle: 'Find mentors, request matches, and log sessions.' },
  carpool: { label: 'Employee', title: 'Carpool & commute', subtitle: 'Save your route and join ride-share groups.' },
  bookings: { label: 'Employee', title: 'Desk & room booking', subtitle: 'Reserve desks and meeting rooms, and manage bookings.' },
  mood: { label: 'Employee', title: 'Mood & wellness', subtitle: 'Check in daily and see team sentiment trends.' },
  knowledge: { label: 'Employee', title: 'Knowledge base', subtitle: 'Search and read company articles and policies.' },
  announcements: { label: 'Employee', title: 'Announcements', subtitle: 'Company-wide news and updates.' },
  notifications: { label: 'Employee', title: 'Notifications', subtitle: 'Your in-app notifications and alerts.' },
  assets: { label: 'Manager', title: 'Asset management', subtitle: 'Inventory, assignments, and returns across the company.' },
  shifts: { label: 'Manager', title: 'Shift management', subtitle: 'Define and manage shift schedules.' },
  visitors: { label: 'Manager', title: 'Visitor management', subtitle: 'Pre-register, check in, and check out office visitors.' },
  contractors: { label: 'Manager', title: 'Contractors', subtitle: 'Manage vendors and their on-site employees.' },
  internalMobility: { label: 'Manager', title: 'Internal mobility', subtitle: 'Post internal jobs, review applications, and shortlist.' },
  compliance: { label: 'Manager', title: 'Compliance', subtitle: 'Track statutory requirements and compliance records.' },
  governance: { label: 'Manager', title: 'Governance', subtitle: 'Audit trail, leave encashment, attendance regularization, document verification, virtual IDs, and feedback overrides.' },
  dataUpload: { label: 'Manager', title: 'Data upload', subtitle: 'Bulk-import workforce data across tables.' },
  workforce: { label: 'Manager', title: 'Workforce', subtitle: 'Employee-level resilience and health details.' },
  resilience: { label: 'Manager', title: 'Resilience', subtitle: 'Org health, burnout risk, and revenue-at-risk overview.' },
  readiness: { label: 'Manager', title: 'Workforce readiness', subtitle: 'Capacity and readiness across critical roles.' },
  spof: { label: 'Manager', title: 'Single point of failure', subtitle: 'Role-critical employees with highest impact.' },
  succession: { label: 'Manager', title: 'Succession planning', subtitle: 'Backup candidates for every critical role.' },
  skillGaps: { label: 'Manager', title: 'Skill gap analysis', subtitle: 'Missing skills and training recommendations.' },
  knowledgeConc: { label: 'Manager', title: 'Knowledge concentration', subtitle: 'How knowledge is concentrated in a few people.' },
  whatIf: { label: 'Manager', title: 'What-if simulator', subtitle: 'Simulate departures and their impact on the org.' },
  resilienceReport: { label: 'Manager', title: 'Resilience report', subtitle: 'Consolidated resilience insights and recommendations.' },
  resilienceChat: { label: 'Manager', title: 'Resilience AI', subtitle: 'Chat with AI about your workforce resilience.' },
  profile: { label: 'Employee', title: 'My profile', subtitle: 'View and manage your employee profile.' },
  myAssets: { label: 'Employee', title: 'My assets', subtitle: 'View the assets assigned to you and request returns.' },
  teams: { label: 'Employee', title: 'Teams & hierarchy', subtitle: 'Teams, team leads, projects, and reporting lines.' },
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
          <ErrorBoundary resetKey={activeView}>
          {activeView === 'hrHome' && <HrHome />}
          {activeView === 'hrControl' && <HrControlPanel />}
          {activeView === 'apply' && <LeaveHome />}
          {activeView === 'onboarding' && <EmployeeOnboarding />}
          {activeView === 'tickets' && <TicketManagement />}
          {activeView === 'register' && <HrRegistration />}
          {activeView === 'balances' && <HrBulkUploads />}
          {activeView === 'review' && <ReviewerInbox />}
          {activeView === 'leaveReports' && <LeaveReports />}
          {activeView === 'directory' && <Directory />}
          {activeView === 'projects' && <ProjectBuilder />}
          {activeView === 'overview' && <LeadershipOverview />}
          {activeView === 'calendar' && <LeaveCalendar />}
          {activeView === 'candidateForm' && <CandidateOnboarding />}
          {activeView === 'hrOnboard' && <HrOnboardingDashboard />}
          {activeView === 'offboard' && <OffboardingDashboard />}
          {activeView === 'carryForward' && <CarryForwardAdmin />}
          {activeView === 'payroll' && <PayrollManagement />}
          {activeView === 'reviews' && <ReviewsPage />}
          {activeView === 'recognition' && <Recognition />}
          {activeView === 'rewards' && <RewardsStore />}
          {activeView === 'recruitment' && <Recruitment />}
      {activeView === 'profile' && <Profile />}
      {activeView === 'teams' && <Teams />}
          {activeView === 'lifecycle' && <HrLifecycle />}
          {activeView === 'docsSalary' && <HrDocsSalary />}
          {activeView === 'analytics' && <HrAnalytics />}
          {activeView === 'orgchart' && <PyramidChart />}
          {activeView === 'employeeDashboard' && <EmployeeDashboard />}
          {activeView === 'attendance' && <AttendanceTracker />}
          {activeView === 'timesheets' && <TimesheetTracker />}
          {activeView === 'expenses' && <ExpenseManagement />}
          {activeView === 'surveys' && <SurveyBuilder />}
          {activeView === 'skills' && <SkillsBragBoard />}
          {activeView === 'training' && <TrainingLearning />}
          {activeView === 'loans' && <LoanManagement />}
          {activeView === 'benefits' && <BenefitsPortal />}
          {activeView === 'mentorship' && <MentorshipProgram />}
          {activeView === 'carpool' && <CarpoolManager />}
          {activeView === 'bookings' && <DeskRoomBooking />}
          {activeView === 'mood' && <MoodTracker />}
          {activeView === 'knowledge' && <KnowledgeBase />}
          {activeView === 'announcements' && <Announcements />}
          {activeView === 'notifications' && <NotificationCenter />}
          {activeView === 'assets' && <AssetManagement />}
          {activeView === 'myAssets' && <MyAssets />}
          {activeView === 'shifts' && <ShiftManager />}
          {activeView === 'visitors' && <VisitorManagement />}
          {activeView === 'contractors' && <ContractorManager />}
          {activeView === 'internalMobility' && <InternalMobility />}
          {activeView === 'compliance' && <ComplianceTracker />}
          {activeView === 'governance' && <GovernancePanel />}
          {activeView === 'dataUpload' && <DataUpload />}
          {activeView === 'workforce' && <WorkforceEmployees />}
          {activeView === 'resilience' && <ResilienceDashboard />}
          {activeView === 'readiness' && <WorkforceReadiness />}
          {activeView === 'spof' && <SpofAnalysis />}
          {activeView === 'succession' && <SuccessionPlanning />}
          {activeView === 'skillGaps' && <SkillGapAnalysis />}
          {activeView === 'knowledgeConc' && <KnowledgeConcentration />}
          {activeView === 'whatIf' && <WhatIfSimulator />}
          {activeView === 'resilienceReport' && <ResilienceReport />}
          {activeView === 'resilienceChat' && <ResilienceAIChat />}
          {activeView === 'settings' && <Settings />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
