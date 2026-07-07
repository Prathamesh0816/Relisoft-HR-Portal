import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import useAuthStore from './store/authStore'

const Login = lazy(() => import('./pages/auth/Login'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Employees = lazy(() => import('./pages/employees/EmployeeList'))
const EmployeeDetail = lazy(() => import('./pages/employees/EmployeeProfile'))
const Leaves = lazy(() => import('./pages/leave/LeaveList'))
const Directory = lazy(() => import('./pages/workspace/Directory'))
const ProjectsTeams = lazy(() => import('./pages/workspace/ProjectsTeams'))
const Overview = lazy(() => import('./pages/workspace/Overview'))
const HRHome = lazy(() => import('./pages/workspace/HRHome'))
const PolicyPanel = lazy(() => import('./pages/hr/PolicyPanel'))
const ExcelUpload = lazy(() => import('./pages/excel/ExcelUploadPage'))
const OnboardingMyForm = lazy(() => import('./pages/onboarding/OnboardingMyForm'))
const Attendance = lazy(() => import('./pages/attendance/AttendanceList'))
const Payroll = lazy(() => import('./pages/payroll/PayrollList'))
const Recruitment = lazy(() => import('./pages/recruitment/RecruitmentList'))
const Onboarding = lazy(() => import('./pages/onboarding/OnboardingList'))
const Shifts = lazy(() => import('./pages/shift/ShiftList'))
const Holidays = lazy(() => import('./pages/holiday/HolidayList'))
const Performance = lazy(() => import('./pages/performance/PerformanceList'))
const Training = lazy(() => import('./pages/training/TrainingList'))
const Assets = lazy(() => import('./pages/assets/AssetList'))
const Travel = lazy(() => import('./pages/travel/TravelList'))
const Helpdesk = lazy(() => import('./pages/helpdesk/TicketList'))
const Admin = lazy(() => import('./pages/admin/AdminPanel'))
const Compliance = lazy(() => import('./pages/compliance/ComplianceList'))
const Separation = lazy(() => import('./pages/separation/SeparationList'))
const SeparationMy = lazy(() => import('./pages/separation/SeparationMy'))
const Documents = lazy(() => import('./pages/documents/DocumentList'))
const Workflows = lazy(() => import('./pages/workflow/WorkflowList'))
const Analytics = lazy(() => import('./pages/analytics/AnalyticsPage'))
const Notifications = lazy(() => import('./pages/notifications/NotificationPage'))
const Reports = lazy(() => import('./pages/reports/ReportPage'))
const Integrations = lazy(() => import('./pages/integrations/IntegrationPage'))
const Automation = lazy(() => import('./pages/automation/AutomationPage'))
const Engagement = lazy(() => import('./pages/engagement/EngagementPage'))
const Security = lazy(() => import('./pages/security/SecurityPage'))
const Mobile = lazy(() => import('./pages/mobile/MobilePage'))
const FnF = lazy(() => import('./pages/fnf/FnFList'))
const SDD = lazy(() => import('./pages/sdd/SDDPage'))

const SurveyList = lazy(() => import('./pages/surveys/SurveyList'))
const RecognitionPage = lazy(() => import('./pages/recognition/RecognitionPage'))
const AnnouncementsPage = lazy(() => import('./pages/announcements/AnnouncementsPage'))
const TimesheetPage = lazy(() => import('./pages/timesheets/TimesheetPage'))
const SocialFeed = lazy(() => import('./pages/social/SocialFeed'))
const AlumniPortal = lazy(() => import('./pages/alumni/AlumniPortal'))
const ResilienceDashboard = lazy(() => import('./pages/resilience/Dashboard'))
const ResilienceEmployees = lazy(() => import('./pages/resilience/Employees'))
const ResilienceEmployeeProfile = lazy(() => import('./pages/resilience/EmployeeProfile'))
const ResilienceWhatIf = lazy(() => import('./pages/resilience/WhatIf'))
const ResilienceSpof = lazy(() => import('./pages/resilience/SpofRanking'))
const ResilienceSkillGaps = lazy(() => import('./pages/resilience/SkillGaps'))
const ResilienceSuccession = lazy(() => import('./pages/resilience/SuccessionPlanning'))
const ResilienceKnowledge = lazy(() => import('./pages/resilience/KnowledgeConcentration'))
const ResilienceReadiness = lazy(() => import('./pages/resilience/WorkforceReadiness'))
const ResilienceReport = lazy(() => import('./pages/resilience/ResilienceReport'))
const ResilienceUpload = lazy(() => import('./pages/resilience/UploadData'))
const ResilienceAssistant = lazy(() => import('./pages/resilience/AIAssistant'))
const ResilienceLanding = lazy(() => import('./pages/resilience/ResilienceLanding'))
const AICouncil = lazy(() => import('./pages/ai-council/AICouncilPage'))
const Visa = lazy(() => import('./pages/visa/VisaPage'))
const WorkforcePlanning = lazy(() => import('./pages/workforce/WorkforcePlanningList'))
const InternalMobility = lazy(() => import('./pages/internal-mobility/InternalMobilityList'))
const Benefits = lazy(() => import('./pages/benefits/BenefitsList'))
const Contractors = lazy(() => import('./pages/contractors/ContractorList'))
const Visitors = lazy(() => import('./pages/visitors/VisitorList'))
const CaseManagement = lazy(() => import('./pages/cases/CaseList'))
const SmartForms = lazy(() => import('./pages/automation/SmartFormList'))
const TalentAnalytics = lazy(() => import('./pages/analytics/TalentAnalyticsList'))
const DocumentTemplates = lazy(() => import('./pages/documents/DocumentTemplates'))
const ServiceCatalog = lazy(() => import('./pages/service-catalog/ServiceCatalogPage'))
const ServiceRequests = lazy(() => import('./pages/service-catalog/ServiceRequestList'))
const ITAssets = lazy(() => import('./pages/it-assets/ITAssetList'))
const SoftwareLicenses = lazy(() => import('./pages/it-assets/SoftwareLicenseList'))
const PRList = lazy(() => import('./pages/procurement/PRList'))
const POList = lazy(() => import('./pages/procurement/POList'))
const GRNList = lazy(() => import('./pages/procurement/GRNList'))
const InvoiceList = lazy(() => import('./pages/procurement/InvoiceList'))
const Policies = lazy(() => import('./pages/policies/PolicyList'))
const GatePasses = lazy(() => import('./pages/gate-passes/GatePassList'))
const VirtualIDCard = lazy(() => import('./pages/id-card/VirtualIDCardPage'))
const ProfileChangeRequests = lazy(() => import('./pages/profile/ProfileChangeRequest'))
const ExpenseList = lazy(() => import('./pages/expense/ExpenseList'))
const WorldClockPage = lazy(() => import('./pages/world-clock/WorldClockPage'))
const NewsFeed = lazy(() => import('./pages/news/NewsFeed'))
const AICompanion = lazy(() => import('./pages/ai-companion/AICompanion'))
const HRChatbot = lazy(() => import('./pages/hr-chatbot/HRChatbot'))
const HRTickets = lazy(() => import('./pages/hr-tickets/HRTickets'))
const MandirDarshan = lazy(() => import('./pages/mandir/MandirDarshan'))
const LandingPage = lazy(() => import('./pages/landing/LandingPage'))

function Loading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] app-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--moss)' }} />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center app-bg">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-8xl font-black mb-4 gradient-text">404</div>
        <p className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Page Not Found</p>
        <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/dashboard"
          className="btn-primary inline-flex items-center gap-2"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useAuthStore((s) => s.theme)
  return (
    <div className={`theme-${theme}`}>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/holidays" element={<Holidays />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/training" element={<Training />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/travel" element={<Travel />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/separation" element={<Separation />} />
          <Route path="/separation/my" element={<SeparationMy />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/engagement" element={<Engagement />} />
          <Route path="/security" element={<Security />} />
          <Route path="/mobile" element={<Mobile />} />
          <Route path="/fnf" element={<FnF />} />
          <Route path="/sdd" element={<SDD />} />

          <Route path="/surveys" element={<SurveyList />} />
          <Route path="/recognition" element={<RecognitionPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/timesheets" element={<TimesheetPage />} />
          <Route path="/social-feed" element={<SocialFeed />} />
          <Route path="/alumni" element={<AlumniPortal />} />
          <Route path="/resilience" element={<ResilienceLanding />} />
          <Route path="/resilience/dashboard" element={<ResilienceDashboard />} />
          <Route path="/resilience/employees" element={<ResilienceEmployees />} />
          <Route path="/resilience/employee/:name" element={<ResilienceEmployeeProfile />} />
          <Route path="/resilience/whatif" element={<ResilienceWhatIf />} />
          <Route path="/resilience/spof" element={<ResilienceSpof />} />
          <Route path="/resilience/skill-gaps" element={<ResilienceSkillGaps />} />
          <Route path="/resilience/succession" element={<ResilienceSuccession />} />
          <Route path="/resilience/knowledge-concentration" element={<ResilienceKnowledge />} />
          <Route path="/resilience/workforce-readiness" element={<ResilienceReadiness />} />
          <Route path="/resilience/report" element={<ResilienceReport />} />
          <Route path="/resilience/upload" element={<ResilienceUpload />} />
          <Route path="/resilience/assistant" element={<ResilienceAssistant />} />
          <Route path="/ai-council" element={<AICouncil />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/workforce-planning" element={<WorkforcePlanning />} />
          <Route path="/internal-mobility" element={<InternalMobility />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/contractors" element={<Contractors />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/case-management" element={<CaseManagement />} />
          <Route path="/smart-forms" element={<SmartForms />} />
          <Route path="/talent-analytics" element={<TalentAnalytics />} />
          <Route path="/document-templates" element={<DocumentTemplates />} />
          <Route path="/service-catalog" element={<ServiceCatalog />} />
          <Route path="/service-requests" element={<ServiceRequests />} />
          <Route path="/it-assets" element={<ITAssets />} />
          <Route path="/software-licenses" element={<SoftwareLicenses />} />
          <Route path="/purchase-requisitions" element={<PRList />} />
          <Route path="/purchase-orders" element={<POList />} />
          <Route path="/goods-receipts" element={<GRNList />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/gate-passes" element={<GatePasses />} />
          <Route path="/virtual-id-card" element={<VirtualIDCard />} />
          <Route path="/profile-change-requests" element={<ProfileChangeRequests />} />
          <Route path="/workspace/directory" element={<Directory />} />
          <Route path="/workspace/projects" element={<ProjectsTeams />} />
          <Route path="/workspace/overview" element={<Overview />} />
          <Route path="/workspace/hr-home" element={<HRHome />} />
          <Route path="/hr/policy" element={<PolicyPanel />} />
          <Route path="/excel/upload" element={<ExcelUpload />} />
          <Route path="/onboarding/my" element={<OnboardingMyForm />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/world-clock" element={<WorldClockPage />} />
          <Route path="/news" element={<NewsFeed />} />
          <Route path="/ai-companion" element={<AICompanion />} />
          <Route path="/hr-assistant" element={<HRChatbot />} />
          <Route path="/hr-tickets" element={<HRTickets />} />
          <Route path="/mandir-darshan" element={<MandirDarshan />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </div>
  )
}
