import { create } from 'zustand'
import { getMyNotifications, getUnreadNotificationCount } from './api'

const useStore = create((set, get) => ({
  loading: true,
  currentUser: null,
  activeView: 'login',
  message: null,
  data: {
    employees: [],
    projects: [],
    leaveTypes: [],
    roles: [],
    hrPolicy: { allowHalfDayLeave: false, sandwichLeave: false }
  },
  authForm: { username: '', password: '' },
  employeeForm: {
    employeeCode: '', fullName: '', email: '', department: '', designation: '',
    jobRole: '', employmentType: 'Full-time', location: '',
    salaryStructure: { fixedPay: '', variablePay: '', pf: '', gratuity: '', insurance: '', otherDeductions: '' },
    joinDate: new Date().toISOString().slice(0, 10), role: 1,
    primaryProjectId: '', projectIds: [], primaryTeamId: '', teamIds: [], submitting: false
  },
  leaveForm: {
    employeeId: '', leaveTypeId: '', startDate: '', endDate: '', isHalfDay: false, reason: '', submitting: false,
    balanceCheck: null
  },
  hrPolicyForm: { allowHalfDayLeave: false },
  onboardingForm: {
    employeeId: '', panNumber: '', aadhaarNumber: '', hasPriorExperience: true,
    experiences: [{ id: '', companyName: '', jobTitle: '', yearsOfExperience: '', relievingEmailForwarded: false }],
    documents: []
  },
  ticketForm: {
    employeeId: '', category: 'General', requestType: 'Other Inquiry',
    itemDetail: '', subject: '', description: '', submitting: false
  },
  employeeTickets: { employeeId: '', tickets: [], loading: false },
  hrTickets: { tickets: [], loading: false },
  projectForm: { name: '', managerId: '', approvalRoute: 'ProjectManager', delegateEmployeeId: '' },
  teamForm: { name: '', projectId: '', leadId: '' },
  excelUpload: { fileName: '', result: null },
  existingEmployeeUpload: { fileName: '', result: null },
  reviewer: { reviewerId: '', reviewerName: '', requests: [], recentDecisions: [], loading: false },
  myLeaves: { employeeId: '', requests: [], loading: false },
  appraisalData: { employees: [], loading: false, filtered: [] },
  dashboard: { stats: null, loading: false },
  announcements: { list: [], loading: false },
  attendance: { records: [], today: null, loading: false },
  knowledgeBase: { articles: [], loading: false },
  mood: { todayEntry: null, myMoods: [], teamTrends: [], orgOverview: null, loading: false },
  skills: { mySkills: [], directory: [], bragPosts: [], loading: false },
  carpool: { myRoute: null, matches: [], groups: [], loading: false },
  bookings: { desks: [], rooms: [], myDeskBookings: [], myRoomBookings: [], loading: false },
  mentorship: { profile: null, mentors: [], myMentees: [], myMentor: null, sessions: [], loading: false },
  rewards: { myPoints: null, catalog: [], myRedemptions: [], transactions: [], allRedemptions: [], loading: false },
  expenses: { categories: [], claims: [], pendingClaims: [], loading: false },
  timesheets: { entries: [], periods: [], approvals: [], loading: false },
  training: { courses: [], registrations: [], certifications: [], loading: false },
  loans: { types: [], myLoans: [], pendingLoans: [], repayments: [], loading: false },
  shifts: { templates: [], assignments: [], swaps: [], loading: false },
  visitors: { list: [], todayVisitors: [], loading: false },
  surveys: { list: [], currentSurvey: null, results: null, mySurveys: [], loading: false },
  benefits: { plans: [], myEnrollments: [], allEnrollments: [], loading: false },
  notifications: { list: [], unreadCount: 0, loading: false },
  internalMobility: { jobs: [], myApplications: [], allApplications: [], loading: false },
  compliance: { requirements: [], records: [], dashboard: null, loading: false },
  contractors: { list: [], employees: [], loading: false },
  resilience: { orgHealth: null, employees: [], employee: null, whatIf: null, spofs: [], skillGaps: [], succession: [], knowledge: null, readiness: null, scenarios: [], feedbacks: [], dependencies: [], projects: [], stressTest: [], report: null, loading: false },

  setLoading: (loading) => set({ loading }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveView: (view) => set({ activeView: view, message: null }),
  setMessage: (message) => set({ message }),
  setData: (data) => set({ data }),
  updateAuthForm: (field, value) => set((s) => ({ authForm: { ...s.authForm, [field]: value } })),
  updateForm: (form, field, value) => set((s) => ({ [form]: { ...s[form], [field]: value } })),
  updateNestedForm: (form, group, field, value) => set((s) => ({
    [form]: { ...s[form], [group]: { ...s[form][group], [field]: value } }
  })),
  setSubmitting: (form, value) => set((s) => ({ [form]: { ...s[form], submitting: value } })),
  resetForm: (form, defaults) => set((s) => ({ [form]: { ...s[form], ...defaults } })),
  setReviewerId: (id) => set((s) => ({ reviewer: { ...s.reviewer, reviewerId: id } })),
  setReviewerData: (data) => set((s) => ({ reviewer: { ...s.reviewer, ...data } })),
  setMyLeaves: (data) => set((s) => ({ myLeaves: { ...s.myLeaves, ...data } })),
  setEmployeeTickets: (data) => set((s) => ({ employeeTickets: { ...s.employeeTickets, ...data } })),
  setHrTickets: (data) => set((s) => ({ hrTickets: { ...s.hrTickets, ...data } })),
  setOnboardingForm: (data) => set((s) => ({ onboardingForm: { ...s.onboardingForm, ...data } })),
  updateExperience: (index, field, value) => set((s) => ({
    onboardingForm: {
      ...s.onboardingForm,
      experiences: s.onboardingForm.experiences.map((e, i) => i === index ? { ...e, [field]: value } : e)
    }
  })),
  addExperience: () => set((s) => ({
    onboardingForm: {
      ...s.onboardingForm,
      experiences: [...s.onboardingForm.experiences, { id: '', companyName: '', jobTitle: '', yearsOfExperience: '', relievingEmailForwarded: false }]
    }
  })),
  removeExperience: (index) => set((s) => {
    const exps = s.onboardingForm.experiences.filter((_, i) => i !== index)
    return {
      onboardingForm: {
        ...s.onboardingForm,
        experiences: exps.length ? exps : [{ id: '', companyName: '', jobTitle: '', yearsOfExperience: '', relievingEmailForwarded: false }]
      }
    }
  }),
  toggleTeam: (teamId) => set((s) => {
    const exists = s.employeeForm.teamIds.includes(teamId)
    return {
      employeeForm: {
        ...s.employeeForm,
        teamIds: exists ? s.employeeForm.teamIds.filter(id => id !== teamId) : [...s.employeeForm.teamIds, teamId]
      }
    }
  }),
  toggleProjectMembership: (projectId) => set((s) => {
    const exists = s.employeeForm.projectIds.includes(projectId)
    return {
      employeeForm: {
        ...s.employeeForm,
        projectIds: exists
          ? s.employeeForm.projectIds.filter(id => id !== projectId)
          : [...s.employeeForm.projectIds, projectId]
      }
    }
  }),
  setExcelFile: (form, fileName) => set((s) => ({ [form]: { ...s[form], fileName, result: null } })),
  setExcelResult: (form, result) => set((s) => ({ [form]: { ...s[form], result } })),
  setAppraisalData: (data) => set((s) => ({ appraisalData: { ...s.appraisalData, ...data } })),
  setDashboard: (data) => set((s) => ({ dashboard: { ...s.dashboard, ...data } })),
  setAnnouncements: (data) => set((s) => ({ announcements: { ...s.announcements, ...data } })),
  setAttendance: (data) => set((s) => ({ attendance: { ...s.attendance, ...data } })),
  setKnowledgeBase: (data) => set((s) => ({ knowledgeBase: { ...s.knowledgeBase, ...data } })),
  setMood: (data) => set((s) => ({ mood: { ...s.mood, ...data } })),
  setSkills: (data) => set((s) => ({ skills: { ...s.skills, ...data } })),
  setCarpool: (data) => set((s) => ({ carpool: { ...s.carpool, ...data } })),
  setBookings: (data) => set((s) => ({ bookings: { ...s.bookings, ...data } })),
  setMentorship: (data) => set((s) => ({ mentorship: { ...s.mentorship, ...data } })),
  setRewards: (data) => set((s) => ({ rewards: { ...s.rewards, ...data } })),
  setExpenses: (data) => set((s) => ({ expenses: { ...s.expenses, ...data } })),
  setTimesheets: (data) => set((s) => ({ timesheets: { ...s.timesheets, ...data } })),
  setTraining: (data) => set((s) => ({ training: { ...s.training, ...data } })),
  setLoans: (data) => set((s) => ({ loans: { ...s.loans, ...data } })),
  setShifts: (data) => set((s) => ({ shifts: { ...s.shifts, ...data } })),
  setVisitors: (data) => set((s) => ({ visitors: { ...s.visitors, ...data } })),
  setSurveys: (data) => set((s) => ({ surveys: { ...s.surveys, ...data } })),
  setBenefits: (data) => set((s) => ({ benefits: { ...s.benefits, ...data } })),
  setNotifications: (data) => set((s) => ({ notifications: { ...s.notifications, ...data } })),
  fetchNotifications: async () => {
    try {
      const [list, cnt] = await Promise.all([getMyNotifications(), getUnreadNotificationCount()])
      set({ notifications: { list: Array.isArray(list) ? list : [], unreadCount: cnt?.count || 0, loading: false } })
    } catch { set((s) => ({ notifications: { ...s.notifications, loading: false } })) }
  },
  setInternalMobility: (data) => set((s) => ({ internalMobility: { ...s.internalMobility, ...data } })),
  setCompliance: (data) => set((s) => ({ compliance: { ...s.compliance, ...data } })),
  setContractors: (data) => set((s) => ({ contractors: { ...s.contractors, ...data } })),
  setResilience: (data) => set((s) => ({ resilience: { ...s.resilience, ...data } })),
  logout: () => set({
    currentUser: null, activeView: 'login', message: null,
  reviewer: { reviewerId: '', reviewerName: '', requests: [], cancellationRequests: [], recentDecisions: [], loading: false },
    myLeaves: { employeeId: '', requests: [], loading: false },
    employeeTickets: { employeeId: '', tickets: [], loading: false },
    hrTickets: { tickets: [], loading: false },
    appraisalData: { employees: [], loading: false, filtered: [] },
    dashboard: { stats: null, loading: false },
    announcements: { list: [], loading: false },
    attendance: { records: [], today: null, loading: false },
    knowledgeBase: { articles: [], loading: false },
    mood: { todayEntry: null, myMoods: [], teamTrends: [], orgOverview: null, loading: false },
    skills: { mySkills: [], directory: [], bragPosts: [], loading: false },
    carpool: { myRoute: null, matches: [], groups: [], loading: false },
    bookings: { desks: [], rooms: [], myDeskBookings: [], myRoomBookings: [], loading: false },
    mentorship: { profile: null, mentors: [], myMentees: [], myMentor: null, sessions: [], loading: false },
    rewards: { myPoints: null, catalog: [], myRedemptions: [], transactions: [], allRedemptions: [], loading: false },
    expenses: { categories: [], claims: [], pendingClaims: [], loading: false },
    timesheets: { entries: [], periods: [], approvals: [], loading: false },
    training: { courses: [], registrations: [], certifications: [], loading: false },
    loans: { types: [], myLoans: [], pendingLoans: [], repayments: [], loading: false },
    shifts: { templates: [], assignments: [], swaps: [], loading: false },
    visitors: { list: [], todayVisitors: [], loading: false },
    surveys: { list: [], currentSurvey: null, results: null, mySurveys: [], loading: false },
    benefits: { plans: [], myEnrollments: [], allEnrollments: [], loading: false },
    notifications: { list: [], unreadCount: 0, loading: false },
    internalMobility: { jobs: [], myApplications: [], allApplications: [], loading: false },
    compliance: { requirements: [], records: [], dashboard: null, loading: false },
    contractors: { list: [], employees: [], loading: false },
    resilience: { orgHealth: null, employees: [], employee: null, whatIf: null, spofs: [], skillGaps: [], succession: [], knowledge: null, readiness: null, scenarios: [], feedbacks: [], dependencies: [], projects: [], stressTest: [], report: null, loading: false }
  })
}))

export default useStore
