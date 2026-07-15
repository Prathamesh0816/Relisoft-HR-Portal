import axios from 'axios'

const api = axios.create({ headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('relisoft-hr-user')
  if (stored) {
    const user = JSON.parse(stored)
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('relisoft-hr-user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

export async function login(username, password) {
  const { data } = await api.post('/api/auth/login', { username, password })
  localStorage.setItem('relisoft-hr-user', JSON.stringify(data))
  return data
}

export async function loadWorkspace() {
  const { data } = await api.get('/api/workspace')
  return data
}

export async function createEmployee(req) {
  const { data } = await api.post('/api/workspace/employees', req)
  return data
}

export async function updateEmployee(id, req) {
  const { data } = await api.put(`/api/workspace/employees/${id}`, req)
  return data
}

export async function applyLeave(req) {
  const { data } = await api.post('/api/leave/apply-leave', req)
  return data
}

export async function getMyLeaveRequests(employeeId) {
  const { data } = await api.get(`/api/leave/employee/${employeeId}/requests`)
  return data
}

export async function getReviewerRequests(reviewerId) {
  const { data } = await api.get(`/api/leave/reviewer/${reviewerId}/requests`)
  return data
}

export async function makeDecision(req) {
  const { data } = await api.post('/api/leave/reviewer/decision', req)
  return data
}

export async function cancelLeave(id, req) {
  const { data } = await api.post(`/api/leave/${id}/cancel`, req)
  return data
}

export async function requestCancellation(id, req) {
  const { data } = await api.post(`/api/leave/${id}/request-cancellation`, req)
  return data
}

export async function bulkDecision(req) {
  const { data } = await api.post('/api/leave/reviewer/bulk-decision', req)
  return data
}

export async function getLeaveCalendar(from, to) {
  const params = new URLSearchParams()
  if (from) params.append('from', from)
  if (to) params.append('to', to)
  const { data } = await api.get(`/api/leave/calendar?${params}`)
  return data
}

export async function getOnboardingProfile(employeeId) {
  const { data } = await api.get(`/api/onboarding/${employeeId}`)
  return data
}

export async function saveOnboardingProfile(formData) {
  const { data } = await axios.post('/api/onboarding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('relisoft-hr-user') || '{}').token || ''}`
  })
  return data
}

export async function getEmployeeTickets(employeeId) {
  const { data } = await api.get(`/api/tickets/employee/${employeeId}`)
  return data
}

export async function getHrTickets() {
  const { data } = await api.get('/api/tickets/hr')
  return data
}

export async function createTicket(req) {
  const { data } = await api.post('/api/tickets', req)
  return data
}

export async function addTimeline(id, req) {
  const { data } = await api.post(`/api/tickets/${id}/timeline`, req)
  return data
}

export async function cancelTicket(id, req) {
  const { data } = await api.post(`/api/tickets/${id}/cancel`, req)
  return data
}

export async function createProject(name) {
  const { data } = await api.post('/api/workspace/projects', { name })
  return data
}

export async function updateProject(id, name) {
  const { data } = await api.put(`/api/workspace/projects/${id}`, { name })
  return data
}

export async function createTeam(req) {
  const { data } = await api.post('/api/workspace/teams', req)
  return data
}

export async function updateTeam(id, req) {
  const { data } = await api.put(`/api/workspace/teams/${id}`, req)
  return data
}

export async function updateHrPolicy(allowHalfDayLeave, sandwichLeave) {
  const { data } = await api.put('/api/workspace/hr-policy', { allowHalfDayLeave, sandwichLeave })
  return data
}

export async function getDelegates(managerId) {
  const { data } = await api.get(`/api/workspace/delegates/${managerId}`)
  return data
}

export async function addDelegate(managerId, req) {
  const { data } = await api.post(`/api/workspace/delegates?managerId=${managerId}`, req)
  return data
}

export async function removeDelegate(id) {
  const { data } = await api.delete(`/api/workspace/delegates/${id}`)
  return data
}

export async function getLeaveReport(year) {
  const { data } = await api.get(`/api/workspace/leave-report?year=${year || new Date().getFullYear()}`)
  return data
}

export async function getFloaterUsage(employeeId, year) {
  const { data } = await api.get(`/api/workspace/floater-usage/${employeeId}?year=${year || new Date().getFullYear()}`)
  return data
}

export async function checkLeaveBalance(employeeId, leaveTypeId) {
  const { data } = await api.get(`/api/leave/balance-check/${employeeId}/${leaveTypeId}`)
  return data
}

export async function applyCompOff(req) {
  const { data } = await api.post('/api/leave/comp-off', req)
  return data
}

export async function transferCompOff(req) {
  const { data } = await api.post('/api/leave/comp-off/transfer', req)
  return data
}

export async function getCompOffTransfers(employeeId) {
  const { data } = await api.get(`/api/leave/comp-off/transfers/${employeeId}`)
  return data
}

export async function uploadMedicalCertificate(id, formData) {
  const { data } = await axios.post(`/api/leave/${id}/upload-medical`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('relisoft-hr-user') || '{}').token || ''}`
  })
  return data
}

export async function checkAllBalances() {
  const { data } = await api.get('/api/leave/balance-check-all')
  return data
}

export async function downloadLeaveReport() {
  const res = await api.get('/api/excel/leave-report', { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url; a.download = 'leave-report.xlsx'; a.click()
  window.URL.revokeObjectURL(url)
  return { message: 'Report downloaded.' }
}

export async function uploadExistingExcel(formData) {
  const { data } = await axios.post('/api/excel/upload-existing-employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('relisoft-hr-user') || '{}').token || ''}`
  })
  return data
}

export async function uploadLeaveExcel(formData) {
  const { data } = await axios.post('/api/excel/upload-leave-balances', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    Authorization: `Bearer ${JSON.parse(localStorage.getItem('relisoft-hr-user') || '{}').token || ''}`
  })
  return data
}

export async function getOnboardingChecklist() {
  const { data } = await api.get('/api/onboarding-v2/checklist')
  return data
}

export async function getCandidates() {
  const { data } = await api.get('/api/onboarding-v2/candidates')
  return data
}

export async function submitCandidateForm(req) {
  const { data } = await api.post('/api/onboarding-v2/candidate', req)
  return data
}

export async function approveOnboarding(employeeId) {
  const { data } = await api.post(`/api/onboarding-v2/candidate/${employeeId}/approve`)
  return data
}

export async function completeStep(stepId, triggerEvent) {
  const { data } = await api.post(`/api/onboarding-v2/step/${stepId}/complete`, { triggerEvent })
  return data
}

export async function oneClickOnboard(employeeId) {
  const { data } = await api.post(`/api/onboarding-v2/one-click-onboard/${employeeId}`)
  return data
}

export async function bulkOnboard(candidates) {
  const { data } = await api.post('/api/onboarding-v2/bulk-onboard', candidates)
  return data
}

export async function getOffboardings() {
  const { data } = await api.get('/api/onboarding-v2/offboardings')
  return data
}

export async function oneClickOffboard(employeeId, req) {
  const { data } = await api.post(`/api/onboarding-v2/one-click-offboard/${employeeId}`, req)
  return data
}

export async function completeOffboarding(offboardingId) {
  const { data } = await api.post(`/api/onboarding-v2/offboard-complete/${offboardingId}`)
  return data
}

export async function bulkOffboard(requests) {
  const { data } = await api.post('/api/onboarding-v2/bulk-offboard', requests)
  return data
}

export async function getAssets() {
  const { data } = await api.get('/api/assets')
  return data
}

export async function createAsset(req) {
  const { data } = await api.post('/api/assets', req)
  return data
}

export async function getEmployeeAssets(employeeId) {
  const { data } = await api.get(`/api/assets/employee/${employeeId}`)
  return data
}

export async function assignAsset(employeeId, assetId) {
  const { data } = await api.post(`/api/assets/assign?employeeId=${employeeId}&assetId=${assetId}`)
  return data
}

export async function returnAsset(id) {
  const { data } = await api.post(`/api/assets/return/${id}`)
  return data
}

export async function getAllAssignments() {
  const { data } = await api.get('/api/assets/all-assignments')
  return data
}

export async function getProbations() {
  const { data } = await api.get('/api/hr-v2/probations')
  return data
}

export async function getProbation(employeeId) {
  const { data } = await api.get(`/api/hr-v2/probation/${employeeId}`)
  return data
}

export async function startProbation(req) {
  const { data } = await api.post('/api/hr-v2/probation/start', req)
  return data
}

export async function extendProbation(req) {
  const { data } = await api.post('/api/hr-v2/probation/extend', req)
  return data
}

export async function confirmProbation(req) {
  const { data } = await api.post('/api/hr-v2/probation/confirm', req)
  return data
}

export async function getAppraisalCycles() {
  const { data } = await api.get('/api/hr-v2/appraisal-cycles')
  return data
}

export async function createAppraisalCycle(req) {
  const { data } = await api.post('/api/hr-v2/appraisal-cycles', req)
  return data
}

export async function closeAppraisalCycle(id) {
  const { data } = await api.put(`/api/hr-v2/appraisal-cycles/${id}`)
  return data
}

export async function getAppraisals(cycleId) {
  const { data } = await api.get(`/api/hr-v2/appraisals${cycleId ? `?cycleId=${cycleId}` : ''}`)
  return data
}

export async function initAppraisal(employeeId, cycleId, reviewerId) {
  const { data } = await api.post(`/api/hr-v2/appraisals/${employeeId}/init?cycleId=${cycleId}${reviewerId ? `&reviewerId=${reviewerId}` : ''}`)
  return data
}

export async function submitSelfAppraisal(id, req) {
  const { data } = await api.post(`/api/hr-v2/appraisals/${id}/self`, req)
  return data
}

export async function submitManagerReview(id, req) {
  const { data } = await api.post(`/api/hr-v2/appraisals/${id}/manager`, req)
  return data
}

export async function convertInternToPermanent(req) {
  const { data } = await api.post('/api/hr-v2/intern-convert', req)
  return data
}

export async function getSalaryDiscussions(employeeId) {
  const { data } = await api.get(`/api/hr-v2/salary-discussions${employeeId ? `?employeeId=${employeeId}` : ''}`)
  return data
}

export async function createSalaryDiscussion(req) {
  const { data } = await api.post('/api/hr-v2/salary-discussions', req)
  return data
}

export async function approveSalary(id, req) {
  const { data } = await api.put(`/api/hr-v2/salary-discussions/${id}/approve`, req)
  return data
}

export async function rejectSalary(id) {
  const { data } = await api.put(`/api/hr-v2/salary-discussions/${id}/reject`)
  return data
}

export async function getDocumentTemplates() {
  const { data } = await api.get('/api/documents/templates')
  return data
}

export async function createDocumentTemplate(req) {
  const { data } = await api.post('/api/documents/templates', req)
  return data
}

export async function getEmployeeDocuments(employeeId) {
  const { data } = await api.get(`/api/documents/employee/${employeeId}`)
  return data
}

export async function generateDocument(employeeId, documentType) {
  const { data } = await api.post(`/api/documents/generate/${employeeId}/${documentType}`)
  return data
}

export async function markDocumentSent(id) {
  const { data } = await api.post(`/api/documents/${id}/mark-sent`)
  return data
}

export async function autoGenerateDocuments(employeeId) {
  const { data } = await api.get(`/api/documents/auto-generate/${employeeId}`)
  return data
}

// ─── Dashboard ───
export async function getDashboardStats() {
  const { data } = await api.get('/api/hr-features/dashboard-stats')
  return data
}

// ─── Announcements ───
export async function getAnnouncements() {
  const { data } = await api.get('/api/hr-features/announcements')
  return data
}

export async function createAnnouncement(req) {
  const { data } = await api.post('/api/hr-features/announcements', req)
  return data
}

export async function deleteAnnouncement(id) {
  const { data } = await api.delete(`/api/hr-features/announcements/${id}`)
  return data
}

// ─── Attendance ───
export async function getAttendance(employeeId, date) {
  const params = new URLSearchParams()
  if (employeeId) params.append('employeeId', employeeId)
  if (date) params.append('date', date)
  const { data } = await api.get(`/api/hr-features/attendance?${params}`)
  return data
}

export async function clockIn() {
  const { data } = await api.post('/api/hr-features/attendance/clock-in')
  return data
}

export async function clockOut() {
  const { data } = await api.post('/api/hr-features/attendance/clock-out')
  return data
}

// ─── Knowledge Base ───
export async function getKnowledgeBase(category, search) {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (search) params.append('search', search)
  const { data } = await api.get(`/api/hr-features/knowledge-base?${params}`)
  return data
}

export async function createKnowledgeArticle(req) {
  const { data } = await api.post('/api/hr-features/knowledge-base', req)
  return data
}

export async function recordArticleView(id) {
  const { data } = await api.post(`/api/hr-features/knowledge-base/${id}/view`)
  return data
}

// ─── Mood & Sentiment Tracker ───
export async function moodCheckIn(req) {
  const { data } = await api.post('/api/mood/check-in', req)
  return data
}

export async function getMyMoods() {
  const { data } = await api.get('/api/mood/my')
  return data
}

export async function getTeamMoodTrends() {
  const { data } = await api.get('/api/mood/team-trends')
  return data
}

export async function getMoodOrgOverview() {
  const { data } = await api.get('/api/mood/org-overview')
  return data
}

// ─── Skills Endorsement & Brag Board ───
export async function getMySkills() {
  const { data } = await api.get('/api/skills')
  return data
}

export async function addSkill(req) {
  const { data } = await api.post('/api/skills', req)
  return data
}

export async function removeSkill(id) {
  const { data } = await api.delete(`/api/skills/${id}`)
  return data
}

export async function getSkillsDirectory(search) {
  const { data } = await api.get(`/api/skills/directory${search ? `?search=${search}` : ''}`)
  return data
}

export async function endorseSkill(skillId) {
  const { data } = await api.post(`/api/skills/${skillId}/endorse`)
  return data
}

export async function getBragPosts() {
  const { data } = await api.get('/api/brag-board')
  return data
}

export async function createBragPost(req) {
  const { data } = await api.post('/api/brag-board', req)
  return data
}

export async function likeBragPost(id) {
  const { data } = await api.post(`/api/brag-board/${id}/like`)
  return data
}

export async function deleteBragPost(id) {
  const { data } = await api.delete(`/api/brag-board/${id}`)
  return data
}

// ─── Carpool & Commute ───
export async function getMyCommuteRoute() {
  const { data } = await api.get('/api/carpool/routes')
  return data
}

export async function saveCommuteRoute(req) {
  const { data } = await api.post('/api/carpool/routes', req)
  return data
}

export async function deleteCommuteRoute() {
  const { data } = await api.delete('/api/carpool/routes')
  return data
}

export async function findCarpoolMatches() {
  const { data } = await api.get('/api/carpool/matches')
  return data
}

export async function getCarpoolGroups() {
  const { data } = await api.get('/api/carpool/groups')
  return data
}

export async function createCarpoolGroup(req) {
  const { data } = await api.post('/api/carpool/groups', req)
  return data
}

export async function joinCarpoolGroup(groupId) {
  const { data } = await api.post(`/api/carpool/groups/${groupId}/join`)
  return data
}

export async function leaveCarpoolGroup(groupId) {
  const { data } = await api.post(`/api/carpool/groups/${groupId}/leave`)
  return data
}

// ─── Desk & Room Booking ───
export async function getDesks(building, floor) {
  const params = new URLSearchParams()
  if (building) params.append('building', building)
  if (floor) params.append('floor', floor)
  const { data } = await api.get(`/api/bookings/desks?${params}`)
  return data
}

export async function createDesk(req) {
  const { data } = await api.post('/api/bookings/desks', req)
  return data
}

export async function getMeetingRooms(building) {
  const { data } = await api.get(`/api/bookings/rooms${building ? `?building=${building}` : ''}`)
  return data
}

export async function createMeetingRoom(req) {
  const { data } = await api.post('/api/bookings/rooms', req)
  return data
}

export async function bookDesk(req) {
  const { data } = await api.post('/api/bookings/desk-book', req)
  return data
}

export async function bookRoom(req) {
  const { data } = await api.post('/api/bookings/room-book', req)
  return data
}

export async function getMyBookings() {
  const { data } = await api.get('/api/bookings/my-bookings')
  return data
}

export async function cancelDeskBooking(id) {
  const { data } = await api.post(`/api/bookings/desk-cancel/${id}`)
  return data
}

export async function cancelRoomBooking(id) {
  const { data } = await api.post(`/api/bookings/room-cancel/${id}`)
  return data
}

export async function getDeskAvailability(date, deskId) {
  const params = new URLSearchParams({ date })
  if (deskId) params.append('deskId', deskId)
  const { data } = await api.get(`/api/bookings/desk-availability?${params}`)
  return data
}

export async function getRoomAvailability(date, roomId) {
  const params = new URLSearchParams({ date })
  if (roomId) params.append('roomId', roomId)
  const { data } = await api.get(`/api/bookings/room-availability?${params}`)
  return data
}

// ─── Mentorship ───
export async function getMentorshipProfile() {
  const { data } = await api.get('/api/mentorship/profile')
  return data
}

export async function saveMentorshipProfile(req) {
  const { data } = await api.post('/api/mentorship/profile', req)
  return data
}

export async function getMentors(search) {
  const { data } = await api.get(`/api/mentorship/mentors${search ? `?search=${search}` : ''}`)
  return data
}

export async function getMyMentees() {
  const { data } = await api.get('/api/mentorship/mentees')
  return data
}

export async function getMyMentor() {
  const { data } = await api.get('/api/mentorship/my-mentor')
  return data
}

export async function requestMentorship(req) {
  const { data } = await api.post('/api/mentorship/request', req)
  return data
}

export async function respondToMentorshipRequest(id, action) {
  const { data } = await api.post(`/api/mentorship/${id}/respond?action=${action}`)
  return data
}

export async function completeMentorship(id) {
  const { data } = await api.post(`/api/mentorship/${id}/complete`)
  return data
}

export async function getMentorshipSessions(matchId) {
  const { data } = await api.get(`/api/mentorship/${matchId}/sessions`)
  return data
}

export async function addMentorshipSession(matchId, req) {
  const { data } = await api.post(`/api/mentorship/${matchId}/sessions`, req)
  return data
}

// ─── Rewards Store ───
export async function getMyRewardPoints() {
  const { data } = await api.get('/api/rewards/my-points')
  return data
}

export async function getRewardCatalog() {
  const { data } = await api.get('/api/rewards/catalog')
  return data
}

export async function addRewardCatalogItem(req) {
  const { data } = await api.post('/api/rewards/catalog', req)
  return data
}

export async function updateRewardCatalogItem(id, req) {
  const { data } = await api.put(`/api/rewards/catalog/${id}`, req)
  return data
}

export async function redeemRewardItem(itemId, req) {
  const { data } = await api.post(`/api/rewards/redeem/${itemId}`, req || {})
  return data
}

export async function getMyRedemptions() {
  const { data } = await api.get('/api/rewards/my-redemptions')
  return data
}

export async function getMyRewardTransactions() {
  const { data } = await api.get('/api/rewards/transactions')
  return data
}

export async function getAllRedemptions() {
  const { data } = await api.get('/api/rewards/all-redemptions')
  return data
}

export async function fulfillRedemption(id) {
  const { data } = await api.post(`/api/rewards/redemptions/${id}/fulfill`)
  return data
}

export async function rejectRedemption(id) {
  const { data } = await api.post(`/api/rewards/redemptions/${id}/reject`)
  return data
}

// ─── Expense Management ───
export async function getExpenseCategories() {
  const { data } = await api.get('/api/expenses/categories')
  return data
}
export async function createExpenseCategory(req) {
  const { data } = await api.post('/api/expenses/categories', req)
  return data
}
export async function getMyExpenseClaims() {
  const { data } = await api.get('/api/expenses/claims')
  return data
}
export async function createExpenseClaim(req) {
  const { data } = await api.post('/api/expenses/claims', req)
  return data
}
export async function getPendingExpenseClaims() {
  const { data } = await api.get('/api/expenses/claims/pending')
  return data
}
export async function approveExpenseClaim(id) {
  const { data } = await api.post(`/api/expenses/claims/${id}/approve`)
  return data
}
export async function rejectExpenseClaim(id, reason) {
  const { data } = await api.post(`/api/expenses/claims/${id}/reject?reason=${reason}`)
  return data
}
export async function reimburseExpenseClaim(id) {
  const { data } = await api.post(`/api/expenses/claims/${id}/reimburse`)
  return data
}

// ─── Timesheets ───
export async function getMyTimesheets(date) {
  const { data } = await api.get(`/api/timesheets${date ? `?date=${date}` : ''}`)
  return data
}
export async function createTimesheetEntry(req) {
  const { data } = await api.post('/api/timesheets', req)
  return data
}
export async function updateTimesheetEntry(id, req) {
  const { data } = await api.put(`/api/timesheets/${id}`, req)
  return data
}
export async function deleteTimesheetEntry(id) {
  const { data } = await api.delete(`/api/timesheets/${id}`)
  return data
}
export async function getTimesheetPeriods() {
  const { data } = await api.get('/api/timesheets/periods')
  return data
}
export async function submitTimesheetPeriod(req) {
  const { data } = await api.post('/api/timesheets/periods/submit', req)
  return data
}
export async function getTimesheetApprovals() {
  const { data } = await api.get('/api/timesheets/approvals')
  return data
}
export async function approveTimesheet(id) {
  const { data } = await api.post(`/api/timesheets/${id}/approve`)
  return data
}
export async function rejectTimesheet(id) {
  const { data } = await api.post(`/api/timesheets/${id}/reject`)
  return data
}

// ─── Training & Learning ───
export async function getTrainingCourses(category) {
  const { data } = await api.get(`/api/training/courses${category ? `?category=${category}` : ''}`)
  return data
}
export async function createTrainingCourse(req) {
  const { data } = await api.post('/api/training/courses', req)
  return data
}
export async function updateTrainingCourse(id, req) {
  const { data } = await api.put(`/api/training/courses/${id}`, req)
  return data
}
export async function getMyTrainingRegistrations() {
  const { data } = await api.get('/api/training/registrations')
  return data
}
export async function registerForTraining(courseId) {
  const { data } = await api.post(`/api/training/courses/${courseId}/register`)
  return data
}
export async function completeTraining(id, score) {
  const { data } = await api.post(`/api/training/registrations/${id}/complete${score ? `?score=${score}` : ''}`)
  return data
}
export async function getMyCertifications() {
  const { data } = await api.get('/api/training/certifications')
  return data
}

// ─── Loans & Advances ───
export async function getLoanTypes() {
  const { data } = await api.get('/api/loans/types')
  return data
}
export async function createLoanType(req) {
  const { data } = await api.post('/api/loans/types', req)
  return data
}
export async function getMyLoans() {
  const { data } = await api.get('/api/loans/my')
  return data
}
export async function applyForLoan(req) {
  const { data } = await api.post('/api/loans/apply', req)
  return data
}
export async function getPendingLoans() {
  const { data } = await api.get('/api/loans/pending')
  return data
}
export async function approveLoan(id) {
  const { data } = await api.post(`/api/loans/${id}/approve`)
  return data
}
export async function rejectLoan(id) {
  const { data } = await api.post(`/api/loans/${id}/reject`)
  return data
}
export async function getLoanRepayments(id) {
  const { data } = await api.get(`/api/loans/${id}/repayments`)
  return data
}

// ─── Shift Management ───
export async function getShiftTemplates() {
  const { data } = await api.get('/api/shifts/templates')
  return data
}
export async function createShiftTemplate(req) {
  const { data } = await api.post('/api/shifts/templates', req)
  return data
}
export async function updateShiftTemplate(id, req) {
  const { data } = await api.put(`/api/shifts/templates/${id}`, req)
  return data
}
export async function getShiftAssignments(employeeId) {
  const { data } = await api.get(`/api/shifts/assignments${employeeId ? `?employeeId=${employeeId}` : ''}`)
  return data
}
export async function createShiftAssignment(req) {
  const { data } = await api.post('/api/shifts/assignments', req)
  return data
}
export async function deleteShiftAssignment(id) {
  const { data } = await api.delete(`/api/shifts/assignments/${id}`)
  return data
}
export async function getShiftSwaps() {
  const { data } = await api.get('/api/shifts/swaps')
  return data
}
export async function requestShiftSwap(req) {
  const { data } = await api.post('/api/shifts/swaps/request', req)
  return data
}
export async function respondToShiftSwap(id, action) {
  const { data } = await api.post(`/api/shifts/swaps/${id}/respond?action=${action}`)
  return data
}

// ─── Visitor Management ───
export async function getVisitors(status) {
  const { data } = await api.get(`/api/visitors${status ? `?status=${status}` : ''}`)
  return data
}
export async function createVisitor(req) {
  const { data } = await api.post('/api/visitors', req)
  return data
}
export async function updateVisitor(id, req) {
  const { data } = await api.put(`/api/visitors/${id}`, req)
  return data
}
export async function checkInVisitor(id) {
  const { data } = await api.post(`/api/visitors/${id}/check-in`)
  return data
}
export async function checkOutVisitor(id) {
  const { data } = await api.post(`/api/visitors/${id}/check-out`)
  return data
}
export async function getTodayVisitors() {
  const { data } = await api.get('/api/visitors/today')
  return data
}

// ─── Surveys ───
export async function getSurveys() {
  const { data } = await api.get('/api/surveys')
  return data
}
export async function createSurvey(req) {
  const { data } = await api.post('/api/surveys', req)
  return data
}
export async function getSurvey(id) {
  const { data } = await api.get(`/api/surveys/${id}`)
  return data
}
export async function respondToSurvey(id, responses) {
  const { data } = await api.post(`/api/surveys/${id}/respond`, responses)
  return data
}
export async function getSurveyResults(id) {
  const { data } = await api.get(`/api/surveys/${id}/results`)
  return data
}
export async function getMySurveys() {
  const { data } = await api.get('/api/surveys/my')
  return data
}

// ─── Benefits Administration ───
export async function getBenefitPlans() {
  const { data } = await api.get('/api/benefits/plans')
  return data
}
export async function createBenefitPlan(req) {
  const { data } = await api.post('/api/benefits/plans', req)
  return data
}
export async function updateBenefitPlan(id, req) {
  const { data } = await api.put(`/api/benefits/plans/${id}`, req)
  return data
}
export async function getMyBenefitEnrollments() {
  const { data } = await api.get('/api/benefits/my-enrollments')
  return data
}
export async function enrollInBenefitPlan(planId) {
  const { data } = await api.post('/api/benefits/enroll', { planId })
  return data
}
export async function cancelBenefitEnrollment(id) {
  const { data } = await api.post(`/api/benefits/enrollments/${id}/cancel`)
  return data
}
export async function getAllBenefitEnrollments() {
  const { data } = await api.get('/api/benefits/enrollments')
  return data
}

// ─── Notifications ───
export async function getMyNotifications(unreadOnly) {
  const { data } = await api.get(`/api/notifications${unreadOnly ? '?unreadOnly=true' : ''}`)
  return data
}
export async function markNotificationRead(id) {
  const { data } = await api.post(`/api/notifications/${id}/read`)
  return data
}
export async function markAllNotificationsRead() {
  const { data } = await api.post('/api/notifications/read-all')
  return data
}
export async function getUnreadNotificationCount() {
  const { data } = await api.get('/api/notifications/unread-count')
  return data
}

// ─── Internal Mobility ───
export async function getInternalJobs() {
  const { data } = await api.get('/api/internal-mobility/jobs')
  return data
}
export async function createInternalJob(req) {
  const { data } = await api.post('/api/internal-mobility/jobs', req)
  return data
}
export async function updateInternalJob(id, req) {
  const { data } = await api.put(`/api/internal-mobility/jobs/${id}`, req)
  return data
}
export async function closeInternalJob(id) {
  const { data } = await api.post(`/api/internal-mobility/jobs/${id}/close`)
  return data
}
export async function getMyJobApplications() {
  const { data } = await api.get('/api/internal-mobility/applications/my')
  return data
}
export async function applyForInternalJob(jobId, coverNote) {
  const { data } = await api.post(`/api/internal-mobility/jobs/${jobId}/apply`, { coverNote })
  return data
}
export async function getAllJobApplications() {
  const { data } = await api.get('/api/internal-mobility/applications')
  return data
}
export async function shortlistJobApplication(id) {
  const { data } = await api.post(`/api/internal-mobility/applications/${id}/shortlist`)
  return data
}
export async function rejectJobApplication(id) {
  const { data } = await api.post(`/api/internal-mobility/applications/${id}/reject`)
  return data
}

// ─── Compliance ───
export async function getComplianceRequirements() {
  const { data } = await api.get('/api/compliance/requirements')
  return data
}
export async function createComplianceRequirement(req) {
  const { data } = await api.post('/api/compliance/requirements', req)
  return data
}
export async function updateComplianceRequirement(id, req) {
  const { data } = await api.put(`/api/compliance/requirements/${id}`, req)
  return data
}
export async function getComplianceRecords(status) {
  const { data } = await api.get(`/api/compliance/records${status ? `?status=${status}` : ''}`)
  return data
}
export async function createComplianceRecord(req) {
  const { data } = await api.post('/api/compliance/records', req)
  return data
}
export async function getComplianceDashboard() {
  const { data } = await api.get('/api/compliance/dashboard')
  return data
}

// ─── Contractors ───
export async function getContractors() {
  const { data } = await api.get('/api/contractors')
  return data
}
export async function createContractor(req) {
  const { data } = await api.post('/api/contractors', req)
  return data
}
export async function updateContractor(id, req) {
  const { data } = await api.put(`/api/contractors/${id}`, req)
  return data
}
export async function getContractorEmployees(contractorId) {
  const { data } = await api.get(`/api/contractors/${contractorId}/employees`)
  return data
}
export async function addContractorEmployee(contractorId, req) {
  const { data } = await api.post(`/api/contractors/${contractorId}/employees`, req)
  return data
}
export async function updateContractorEmployee(id, req) {
  const { data } = await api.put(`/api/contractors/employees/${id}`, req)
  return data
}
export async function deactivateContractorEmployee(id) {
  const { data } = await api.post(`/api/contractors/employees/${id}/deactivate`)
  return data
}

// ─── Workforce Resilience (TruPulse AI) ───
export async function getOrgHealth() {
  const { data } = await api.get('/api/resilience/org-health')
  return data
}
export async function getWorkforceEmployees() {
  const { data } = await api.get('/api/resilience/employees')
  return data
}
export async function getWorkforceEmployee(id) {
  const { data } = await api.get(`/api/resilience/employees/${id}`)
  return data
}
export async function runWhatIf(departingEmployeeIds) {
  const { data } = await api.post('/api/resilience/whatif', { departingEmployeeIds })
  return data
}
export async function getSpofRanking() {
  const { data } = await api.get('/api/resilience/spof-ranking')
  return data
}
export async function getSkillGaps() {
  const { data } = await api.get('/api/resilience/skill-gaps')
  return data
}
export async function getSuccessionPlanning() {
  const { data } = await api.get('/api/resilience/succession-planning')
  return data
}
export async function getKnowledgeConcentration() {
  const { data } = await api.get('/api/resilience/knowledge-concentration')
  return data
}
export async function getWorkforceReadiness() {
  const { data } = await api.get('/api/resilience/workforce-readiness')
  return data
}
export async function getResilienceScenarios() {
  const { data } = await api.get('/api/resilience/scenarios')
  return data
}
export async function createResilienceScenario(req) {
  const { data } = await api.post('/api/resilience/scenarios', req)
  return data
}
export async function getResilienceFeedback() {
  const { data } = await api.get('/api/resilience/feedback')
  return data
}
export async function createResilienceFeedback(req) {
  const { data } = await api.post('/api/resilience/feedback', req)
  return data
}
export async function getResilienceDependencies() {
  const { data } = await api.get('/api/resilience/dependencies')
  return data
}
export async function getResilienceProjects() {
  const { data } = await api.get('/api/resilience/projects')
  return data
}
export async function uploadWorkforceData(table, rows) {
  const { data } = await api.post('/api/resilience/upload', { table, rows })
  return data
}
export async function getStressTest() {
  const { data } = await api.get('/api/resilience/stress-test')
  return data
}
export async function getResilienceReport() {
  const { data } = await api.get('/api/resilience/report')
  return data
}
