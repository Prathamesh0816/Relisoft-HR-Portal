import useStore from '../store'
import Sidebar from './Sidebar'
import HrHome from './HrHome'
import HrControlPanel from './HrControlPanel'
import LeaveHome from './LeaveHome'
import EmployeeOnboarding from './EmployeeOnboarding'
import TicketManagement from './TicketManagement'
import HrRegistration from './HrRegistration'
import ProjectBuilder from './ProjectBuilder'
import HrBulkUploads from './HrBulkUploads'
import ReviewerInbox from './ReviewerInbox'
import Directory from './Directory'
import LeadershipOverview from './LeadershipOverview'
import LeaveCalendar from './LeaveCalendar'
import PyramidChart from './PyramidChart'
import CandidateOnboarding from './CandidateOnboarding'
import HrOnboardingDashboard from './HrOnboardingDashboard'
import OffboardingDashboard from './OffboardingDashboard'
import AssetManagement from './AssetManagement'
import HrLifecycle from './HrLifecycle'
import HrDocsSalary from './HrDocsSalary'
import EmployeeDashboard from './EmployeeDashboard'
import HrAnalytics from './HrAnalytics'
import AttendanceTracker from './AttendanceTracker'
import Announcements from './Announcements'
import KnowledgeBase from './KnowledgeBase'
import MoodTracker from './MoodTracker'
import SkillsBragBoard from './SkillsBragBoard'
import CarpoolManager from './CarpoolManager'
import DeskRoomBooking from './DeskRoomBooking'
import MentorshipProgram from './MentorshipProgram'
import RewardsStore from './RewardsStore'
import ExpenseManagement from './ExpenseManagement'
import TimesheetTracker from './TimesheetTracker'
import TrainingLearning from './TrainingLearning'
import LoanManagement from './LoanManagement'
import ShiftManager from './ShiftManager'
import VisitorManagement from './VisitorManagement'
import SurveyBuilder from './SurveyBuilder'
import BenefitsPortal from './BenefitsPortal'
import NotificationCenter from './NotificationCenter'
import InternalMobility from './InternalMobility'
import ComplianceTracker from './ComplianceTracker'
import ContractorManager from './ContractorManager'
import ResilienceDashboard from './ResilienceDashboard'
import WorkforceEmployees from './WorkforceEmployees'
import WhatIfSimulator from './WhatIfSimulator'
import SpofAnalysis from './SpofAnalysis'
import SkillGapAnalysis from './SkillGapAnalysis'
import SuccessionPlanning from './SuccessionPlanning'
import KnowledgeConcentration from './KnowledgeConcentration'
import WorkforceReadiness from './WorkforceReadiness'
import ResilienceReport from './ResilienceReport'
import DataUpload from './DataUpload'
import ResilienceAIChat from './ResilienceAIChat'
import GovernancePanel from './GovernancePanel'
import Settings from './Settings'
import { useTheme } from '../ThemeContext'
import { Menu } from 'lucide-react'

const meta = {
  hrHome: { label: 'HR', title: 'Run HR operations in the right sequence', subtitle: 'Start with company-controlled onboarding and reviews, then move to your own tasks.' },
  hrControl: { label: 'HR', title: 'Control leave policy', subtitle: 'Manage employee-facing leave options from one place.' },
  apply: { label: 'Employee', title: 'Plan time away with clarity', subtitle: 'Apply for leave, see who will approve it, and keep the request tidy.' },
  onboarding: { label: 'Employee', title: 'Complete onboarding part 2', subtitle: 'Employee side of onboarding for identity details and documents.' },
  tickets: { label: 'Tickets', title: 'Raise and manage support tickets', subtitle: 'Submit HR, asset, or general requests and track them through resolution.' },
  register: { label: 'HR', title: 'Complete company onboarding part 1', subtitle: 'Capture official employee records and trigger the onboarding invite.' },
  projects: { label: 'HR', title: 'Keep the project structure current', subtitle: 'Projects and teams define the approval path behind each employee.' },
  balances: { label: 'HR', title: 'Maintain leave ledgers', subtitle: 'Upload and adjust leave balances for the live workforce.' },
  review: { label: 'Reviewer', title: 'Review employee leave requests', subtitle: 'See pending leave requests routed to you.' },
  directory: { label: 'Directory', title: 'Read the organization at a glance', subtitle: 'See primary teams, approvers, and growth across the directory.' },
  overview: { label: 'Leadership', title: 'Read the organization at a glance', subtitle: 'Track headcount, team ownership, and approval coverage.' },
  calendar: { label: 'Calendar', title: 'Leave calendar across the organization', subtitle: 'Month-wise view of leave activity across employees.' },
  orgchart: { label: 'Org chart', title: 'Organization pyramid', subtitle: 'Hierarchy bands and headcount distribution across roles.' },
  candidateForm: { label: 'Candidate', title: 'New candidate onboarding', subtitle: 'Submit your details to begin the onboarding process.' },
  hrOnboard: { label: 'HR', title: 'HR onboarding dashboard', subtitle: 'Review candidates, approve onboarding, and complete setup steps.' },
  offboard: { label: 'HR', title: 'Offboarding dashboard', subtitle: 'Manage employee offboarding including asset handover and ID deactivation.' },
  assets: { label: 'IT', title: 'Asset management', subtitle: 'Track company assets, assignments, and returns.' },
  lifecycle: { label: 'HR', title: 'Probation & appraisal', subtitle: 'Manage probation cycles, performance reviews, and intern-to-permanent conversion.' },
  hrdocs: { label: 'HR', title: 'Salary discussions & documents', subtitle: 'Propose salary revisions, auto-generate offer letters, joining letters, Form 16, and more.' },
  dashboard: { label: 'Dashboard', title: 'Employee dashboard', subtitle: 'Your personal workspace with quick access to everything you need.' },
  analytics: { label: 'Analytics', title: 'HR analytics', subtitle: 'Track KPIs, headcount, department distribution, and HR insights.' },
  attendance: { label: 'Attendance', title: 'Attendance tracker', subtitle: 'Clock in/out and view your attendance history.' },
  announcements: { label: 'Communication', title: 'Announcements', subtitle: 'Company-wide announcements and updates.' },
  knowledgebase: { label: 'Reference', title: 'Knowledge base', subtitle: 'Search HR policies, FAQs, and company guides.' },
  moodtracker: { label: 'Wellness', title: 'Mood & Sentiment Tracker', subtitle: 'Check in daily, track team mood trends, and view org-wide sentiment.' },
  skillsbragboard: { label: 'Growth', title: 'Skills & Brag Board', subtitle: 'Showcase your skills, endorse peers, and celebrate wins.' },
  carpool: { label: 'Workplace', title: 'Carpool & Commute', subtitle: 'Register your route, find commute matches, and join carpool groups.' },
  bookings: { label: 'Workplace', title: 'Desk & Room Booking', subtitle: 'Reserve hot desks and meeting rooms.' },
  mentorship: { label: 'Growth', title: 'Mentorship Program', subtitle: 'Find a mentor, manage mentees, and track sessions.' },
  rewards: { label: 'Culture', title: 'Rewards Store', subtitle: 'Earn points, browse the catalog, and redeem rewards.' },
  expenses: { label: 'Finance', title: 'Expense Management', subtitle: 'Submit expense claims, track reimbursements, and manage approvals.' },
  timesheets: { label: 'Time', title: 'Timesheets', subtitle: 'Track your billable hours, submit periods, and manage approvals.' },
  training: { label: 'Growth', title: 'Training & Learning', subtitle: 'Browse courses, register for training, and earn certifications.' },
  loans: { label: 'Finance', title: 'Loans & Advances', subtitle: 'Apply for loans, track repayments, and manage approvals.' },
  shifts: { label: 'Scheduling', title: 'Shift Management', subtitle: 'View shift assignments, manage templates, and swap shifts.' },
  visitors: { label: 'Security', title: 'Visitor Management', subtitle: 'Pre-register visitors, manage check-ins, and track access.' },
  surveys: { label: 'Engagement', title: 'Surveys', subtitle: 'Create and respond to employee surveys.' },
  benefits: { label: 'Benefits', title: 'Benefits Administration', subtitle: 'Browse benefit plans, enroll, and manage coverage.' },
  notifications: { label: 'Alerts', title: 'Notification Center', subtitle: 'View and manage your notifications and alerts.' },
  internalMobility: { label: 'Growth', title: 'Internal Mobility', subtitle: 'Browse internal job postings and grow your career within the company.' },
  compliance: { label: 'Governance', title: 'Compliance Tracker', subtitle: 'Track regulatory requirements and compliance status.' },
  contractors: { label: 'Workplace', title: 'Contractor Management', subtitle: 'Manage vendor contracts and contractor employees.' },
  resilienceDashboard: { label: 'Resilience', title: 'Org Health Dashboard', subtitle: 'Workforce resilience composite score and KPI indicators.' },
  workforceEmployees: { label: 'Resilience', title: 'Workforce Employees', subtitle: 'Detailed employee profiles with criticality, performance, and workload.' },
  whatIfSimulator: { label: 'Resilience', title: 'What-If Simulator', subtitle: 'Simulate employee departures and measure org health impact.' },
  spofAnalysis: { label: 'Resilience', title: 'SPOF Analysis', subtitle: 'Single Point of Failure ranking and dependency impact.' },
  skillGapAnalysis: { label: 'Resilience', title: 'Skill Gap Analysis', subtitle: 'Team-level knowledge coverage and proficiency gaps.' },
  successionPlanning: { label: 'Resilience', title: 'Succession Planning', subtitle: 'Backfill readiness for critical roles.' },
  knowledgeConcentration: { label: 'Resilience', title: 'Knowledge Concentration', subtitle: 'Bus-factor risk analysis and knowledge areas.' },
  workforceReadiness: { label: 'Resilience', title: 'Workforce Readiness', subtitle: 'Project pipeline readiness and capacity utilization.' },
  resilienceReport: { label: 'Resilience', title: 'Resilience Report', subtitle: 'Downloadable workforce resilience report.' },
  dataUpload: { label: 'Resilience', title: 'Data Upload', subtitle: 'Upload workforce data for custom analysis.' },
  resilienceAiChat: { label: 'Resilience', title: 'AI Assistant', subtitle: 'Ask natural language questions about your workforce.' },
  governancePanel: { label: 'Resilience', title: 'Governance Panel', subtitle: 'Human-in-the-loop feedback and override management.' },
  settings: { label: 'Account', title: 'Settings', subtitle: 'Manage your account settings and preferences.' }
}

export default function AppLayout({ onLogout }) {
  const { activeView, currentUser } = useStore()
  const { dark } = useTheme()
  const m = meta[activeView] || meta.apply

  return (
    <div className={`min-h-screen ${dark ? 'dark' : ''} bg-[var(--bg-primary)]`}>
      <div className="max-w-[1440px] mx-auto px-5 py-6">
        <header className="flex items-center gap-4 pb-5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => useStore.getState().setActiveView(
            ['HRL2','HR'].includes(useStore.getState().currentUser?.role) ? 'hrHome' : ['OrganizationHead','ManagerL2','Manager'].includes(useStore.getState().currentUser?.role) ? 'overview' : 'apply'
          )}>
            <img src="/relisoft-logo.webp" alt="ReliSoft" className="h-10 w-auto" />
            <div>
              <div className="font-heading font-extrabold text-navy dark:text-white text-sm">ReliSoft Technologies</div>
              <div className="text-muted dark:text-white/50 text-xs">People Hub</div>
            </div>
          </div>
        </header>
        <div className="flex gap-5 items-start">
          <Sidebar onLogout={onLogout} />
          <section className="flex-1 min-w-0 space-y-4">
            <div className="card-surface p-5">
              <span className="section-kicker">{m.label}</span>
              <h2 className="section-title text-2xl mt-2">{m.title}</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">{m.subtitle}</p>
            </div>
            <div className="space-y-4">
              {activeView === 'hrHome' && <HrHome />}
              {activeView === 'hrControl' && <HrControlPanel />}
              {activeView === 'apply' && <LeaveHome />}
              {activeView === 'onboarding' && <EmployeeOnboarding />}
              {activeView === 'tickets' && <TicketManagement />}
              {activeView === 'register' && <HrRegistration />}
              {activeView === 'projects' && <ProjectBuilder />}
              {activeView === 'balances' && <HrBulkUploads />}
              {activeView === 'review' && <ReviewerInbox />}
              {activeView === 'directory' && <Directory />}
              {activeView === 'overview' && <LeadershipOverview />}
              {activeView === 'calendar' && <LeaveCalendar />}
              {activeView === 'orgchart' && <PyramidChart />}
              {activeView === 'candidateForm' && <CandidateOnboarding />}
              {activeView === 'hrOnboard' && <HrOnboardingDashboard />}
              {activeView === 'offboard' && <OffboardingDashboard />}
              {activeView === 'assets' && <AssetManagement />}
              {activeView === 'lifecycle' && <HrLifecycle />}
              {activeView === 'hrdocs' && <HrDocsSalary />}
              {activeView === 'dashboard' && <EmployeeDashboard />}
              {activeView === 'analytics' && <HrAnalytics />}
              {activeView === 'attendance' && <AttendanceTracker />}
              {activeView === 'announcements' && <Announcements />}
              {activeView === 'knowledgebase' && <KnowledgeBase />}
              {activeView === 'moodtracker' && <MoodTracker />}
              {activeView === 'skillsbragboard' && <SkillsBragBoard />}
              {activeView === 'carpool' && <CarpoolManager />}
              {activeView === 'bookings' && <DeskRoomBooking />}
              {activeView === 'mentorship' && <MentorshipProgram />}
              {activeView === 'rewards' && <RewardsStore />}
              {activeView === 'expenses' && <ExpenseManagement />}
              {activeView === 'timesheets' && <TimesheetTracker />}
              {activeView === 'training' && <TrainingLearning />}
              {activeView === 'loans' && <LoanManagement />}
              {activeView === 'shifts' && <ShiftManager />}
              {activeView === 'visitors' && <VisitorManagement />}
              {activeView === 'surveys' && <SurveyBuilder />}
              {activeView === 'benefits' && <BenefitsPortal />}
              {activeView === 'notifications' && <NotificationCenter />}
              {activeView === 'internalMobility' && <InternalMobility />}
              {activeView === 'compliance' && <ComplianceTracker />}
              {activeView === 'contractors' && <ContractorManager />}
              {activeView === 'resilienceDashboard' && <ResilienceDashboard />}
              {activeView === 'workforceEmployees' && <WorkforceEmployees />}
              {activeView === 'whatIfSimulator' && <WhatIfSimulator />}
              {activeView === 'spofAnalysis' && <SpofAnalysis />}
              {activeView === 'skillGapAnalysis' && <SkillGapAnalysis />}
              {activeView === 'successionPlanning' && <SuccessionPlanning />}
              {activeView === 'knowledgeConcentration' && <KnowledgeConcentration />}
              {activeView === 'workforceReadiness' && <WorkforceReadiness />}
              {activeView === 'resilienceReport' && <ResilienceReport />}
              {activeView === 'dataUpload' && <DataUpload />}
              {activeView === 'resilienceAiChat' && <ResilienceAIChat />}
              {activeView === 'governancePanel' && <GovernancePanel />}
              {activeView === 'settings' && <Settings />}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
