import { describe, it, expect, vi } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import useStore from '../store'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal()
  const mocked = {}
  for (const key of Object.keys(actual)) {
    if (typeof actual[key] === 'function') mocked[key] = vi.fn().mockResolvedValue([])
  }
  mocked.getMoodOrgOverview = vi.fn().mockResolvedValue({ todayAvg: 0, todayCount: 0, totalEntries: 0, trends: [] })
  mocked.getUnreadNotificationCount = vi.fn().mockResolvedValue({ count: 0 })
  return mocked
})

import HrHome from '../components/HrHome'
import HrControlPanel from '../components/HrControlPanel'
import LeaveHome from '../components/LeaveHome'
import EmployeeOnboarding from '../components/EmployeeOnboarding'
import TicketManagement from '../components/TicketManagement'
import HrRegistration from '../components/HrRegistration'
import HrBulkUploads from '../components/HrBulkUploads'
import ReviewerInbox from '../components/ReviewerInbox'
import LeaveReports from '../components/LeaveReports'
import Directory from '../components/Directory'
import ProjectBuilder from '../components/ProjectBuilder'
import LeadershipOverview from '../components/LeadershipOverview'
import LeaveCalendar from '../components/LeaveCalendar'
import CandidateOnboarding from '../components/CandidateOnboarding'
import HrOnboardingDashboard from '../components/HrOnboardingDashboard'
import OffboardingDashboard from '../components/OffboardingDashboard'
import CarryForwardAdmin from '../components/CarryForwardAdmin'
import PayrollManagement from '../components/PayrollManagement'
import ReviewsPage from '../components/ReviewsPage'
import Recognition from '../components/Recognition'
import RewardsStore from '../components/RewardsStore'
import Recruitment from '../components/Recruitment'
import Profile from '../components/Profile'
import Teams from '../components/Teams'
import HrLifecycle from '../components/HrLifecycle'
import HrDocsSalary from '../components/HrDocsSalary'
import HrAnalytics from '../components/HrAnalytics'
import PyramidChart from '../components/PyramidChart'
import EmployeeDashboard from '../components/EmployeeDashboard'
import AttendanceTracker from '../components/AttendanceTracker'
import TimesheetTracker from '../components/TimesheetTracker'
import ExpenseManagement from '../components/ExpenseManagement'
import SurveyBuilder from '../components/SurveyBuilder'
import SkillsBragBoard from '../components/SkillsBragBoard'
import TrainingLearning from '../components/TrainingLearning'
import LoanManagement from '../components/LoanManagement'
import BenefitsPortal from '../components/BenefitsPortal'
import MentorshipProgram from '../components/MentorshipProgram'
import CarpoolManager from '../components/CarpoolManager'
import DeskRoomBooking from '../components/DeskRoomBooking'
import MoodTracker from '../components/MoodTracker'
import KnowledgeBase from '../components/KnowledgeBase'
import Announcements from '../components/Announcements'
import NotificationCenter from '../components/NotificationCenter'
import AssetManagement from '../components/AssetManagement'
import MyAssets from '../components/MyAssets'
import ShiftManager from '../components/ShiftManager'
import VisitorManagement from '../components/VisitorManagement'
import ContractorManager from '../components/ContractorManager'
import InternalMobility from '../components/InternalMobility'
import ComplianceTracker from '../components/ComplianceTracker'
import GovernancePanel from '../components/GovernancePanel'
import DataUpload from '../components/DataUpload'
import WorkforceEmployees from '../components/WorkforceEmployees'
import ResilienceDashboard from '../components/ResilienceDashboard'
import WorkforceReadiness from '../components/WorkforceReadiness'
import SpofAnalysis from '../components/SpofAnalysis'
import SuccessionPlanning from '../components/SuccessionPlanning'
import SkillGapAnalysis from '../components/SkillGapAnalysis'
import KnowledgeConcentration from '../components/KnowledgeConcentration'
import WhatIfSimulator from '../components/WhatIfSimulator'
import ResilienceReport from '../components/ResilienceReport'
import ResilienceAIChat from '../components/ResilienceAIChat'
import Settings from '../components/Settings'

const views = [
  ['HrHome', HrHome], ['HrControlPanel', HrControlPanel], ['LeaveHome', LeaveHome],
  ['EmployeeOnboarding', EmployeeOnboarding], ['TicketManagement', TicketManagement],
  ['HrRegistration', HrRegistration], ['HrBulkUploads', HrBulkUploads], ['ReviewerInbox', ReviewerInbox],
  ['LeaveReports', LeaveReports], ['Directory', Directory], ['ProjectBuilder', ProjectBuilder],
  ['LeadershipOverview', LeadershipOverview], ['LeaveCalendar', LeaveCalendar],
  ['CandidateOnboarding', CandidateOnboarding], ['HrOnboardingDashboard', HrOnboardingDashboard],
  ['OffboardingDashboard', OffboardingDashboard], ['CarryForwardAdmin', CarryForwardAdmin],
  ['PayrollManagement', PayrollManagement], ['ReviewsPage', ReviewsPage], ['Recognition', Recognition],
  ['RewardsStore', RewardsStore], ['Recruitment', Recruitment], ['Profile', Profile], ['Teams', Teams],
  ['HrLifecycle', HrLifecycle], ['HrDocsSalary', HrDocsSalary], ['HrAnalytics', HrAnalytics],
  ['PyramidChart', PyramidChart], ['EmployeeDashboard', EmployeeDashboard], ['AttendanceTracker', AttendanceTracker],
  ['TimesheetTracker', TimesheetTracker], ['ExpenseManagement', ExpenseManagement], ['SurveyBuilder', SurveyBuilder],
  ['SkillsBragBoard', SkillsBragBoard], ['TrainingLearning', TrainingLearning], ['LoanManagement', LoanManagement],
  ['BenefitsPortal', BenefitsPortal], ['MentorshipProgram', MentorshipProgram], ['CarpoolManager', CarpoolManager],
  ['DeskRoomBooking', DeskRoomBooking], ['MoodTracker', MoodTracker], ['KnowledgeBase', KnowledgeBase],
  ['Announcements', Announcements], ['NotificationCenter', NotificationCenter], ['AssetManagement', AssetManagement],
  ['MyAssets', MyAssets], ['ShiftManager', ShiftManager], ['VisitorManagement', VisitorManagement],
  ['ContractorManager', ContractorManager], ['InternalMobility', InternalMobility], ['ComplianceTracker', ComplianceTracker],
  ['GovernancePanel', GovernancePanel], ['DataUpload', DataUpload], ['WorkforceEmployees', WorkforceEmployees],
  ['ResilienceDashboard', ResilienceDashboard], ['WorkforceReadiness', WorkforceReadiness], ['SpofAnalysis', SpofAnalysis],
  ['SuccessionPlanning', SuccessionPlanning], ['SkillGapAnalysis', SkillGapAnalysis],
  ['KnowledgeConcentration', KnowledgeConcentration], ['WhatIfSimulator', WhatIfSimulator],
  ['ResilienceReport', ResilienceReport], ['ResilienceAIChat', ResilienceAIChat], ['Settings', Settings]
]

const flush = () => new Promise((r) => setTimeout(r, 10))

describe('all views render without crashing (no white pages)', () => {
  beforeEach(() => {
    useStore.setState({
      currentUser: { employeeId: 1, fullName: 'Preeti Patil', role: 'HRL2', username: 'preeti', email: 'preeti.patil@relisofttechnologies.com' },
      data: { employees: [], projects: [], leaveTypes: [], roles: [], hrPolicy: { allowHalfDayLeave: false, sandwichLeave: false } }
    })
  })

  for (const [name, Comp] of views) {
    it(`renders ${name}`, async () => {
      let error = null
      try {
        render(<Comp />)
        await act(async () => { await flush() })
        await act(async () => { await flush() })
      } catch (e) {
        error = e
      }
      cleanup()
      expect(error).toBeNull()
    })
  }
})

