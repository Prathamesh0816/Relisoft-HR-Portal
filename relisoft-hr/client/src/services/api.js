import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  microsoftLogin: () => '/api/auth/microsoft',
};

export const dashboardAPI = {
  getHR: () => api.get('/dashboard/hr-snapshot'),
};

export const employeeAPI = {
  list: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const leaveAPI = {
  getMyRequests: () => api.get('/leaves/employee/requests'),
  getReviewerRequests: () => api.get('/leaves/reviewer/requests'),
  getBalance: () => api.get('/leaves/balance'),
  apply: (data) => api.post('/leaves/apply', data),
  review: (data) => api.post('/leaves/reviewer/decision', data),
  cancel: (id) => api.post(`/leaves/${id}/cancel`),
  getReport: (params) => api.get('/leaves/report', { params }),
  getReportCsv: (params) => api.get('/leaves/report', { params, responseType: 'blob' }),
};

export const attendanceAPI = {
  list: (params) => api.get('/attendance', { params }),
  punchIn: () => api.post('/attendance/punch-in'),
  punchOut: () => api.post('/attendance/punch-out'),
  getToday: () => api.get('/attendance/today'),
  getSummary: (params) => api.get('/attendance/summary', { params }),
};

export const payrollAPI = {
  list: (params) => api.get('/payroll', { params }),
  process: (data) => api.post('/payroll/process', data),
  getPayslip: (id) => api.get(`/payroll/${id}/payslip`),
  downloadPayslip: (id) => api.get(`/payroll/${id}/download`, { responseType: 'blob' }),
  getSummary: (params) => api.get('/payroll/summary', { params }),
};

export const recruitmentAPI = {
  listJobs: (params) => api.get('/recruitment/jobs', { params }),
  createJob: (data) => api.post('/recruitment/jobs', data),
  updateJob: (id, data) => api.put(`/recruitment/jobs/${id}`, data),
  getApplicants: (jobId) => api.get(`/recruitment/jobs/${jobId}/applicants`),
  updateApplicantStatus: (id, status) => api.put(`/recruitment/applicants/${id}`, { status }),
};

export const onboardingAPI = {
  list: (params) => api.get('/onboarding', { params }),
  getByEmployee: (employeeId) => api.get(`/onboarding/${employeeId}`),
  updateStage: (employeeId, stage, data) => api.put(`/onboarding/${employeeId}/stage/${stage}`, data),
  markComplete: (employeeId) => api.put(`/onboarding/${employeeId}/complete`),
  getProfile: (employeeId) => api.get(`/onboarding/profile/${employeeId}`),
  saveProfile: (formData) => api.post('/onboarding/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const shiftAPI = {
  list: (params) => api.get('/shifts', { params }),
  create: (data) => api.post('/shifts', data),
  assign: (data) => api.post('/shifts/assign', data),
  getSwapRequests: () => api.get('/shifts/swap-requests'),
  approveSwap: (id) => api.put(`/shifts/swap-requests/${id}/approve`),
  rejectSwap: (id) => api.put(`/shifts/swap-requests/${id}/reject`),
};

export const holidayAPI = {
  list: (params) => api.get('/holidays', { params }),
  create: (data) => api.post('/holidays', data),
  delete: (id) => api.delete(`/holidays/${id}`),
};

export const performanceAPI = {
  list: (params) => api.get('/performance', { params }),
  create: (data) => api.post('/performance', data),
  getById: (id) => api.get(`/performance/${id}`),
  submitRating: (id, data) => api.put(`/performance/${id}/rating`, data),
  addKRA: (id, data) => api.post(`/performance/${id}/kra`, data),
};

export const trainingAPI = {
  list: (params) => api.get('/training', { params }),
  create: (data) => api.post('/training', data),
  getById: (id) => api.get(`/training/${id}`),
  register: (id) => api.post(`/training/${id}/register`),
  getParticipants: (id) => api.get(`/training/${id}/participants`),
};

export const aiAPI = {
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  parseResume: (resumeText, jobId) => api.post('/ai/parse-resume', { resumeText, jobId }),
  matchCandidates: (jobDescription, candidates) => api.post('/ai/match-candidates', { jobDescription, candidates }),
  generateDocument: (template, data) => api.post('/ai/generate-document', { template, data }),
  analyzeSentiment: (text) => api.post('/ai/analyze-sentiment', { text }),
  getInsights: (module, params) => api.post('/ai/insights', { module, params }),
  predictAttrition: (employeeId) => api.post('/ai/predict-attrition', { employeeId }),
  recommendTraining: (employeeId) => api.post('/ai/recommend-training', { employeeId }),
  generateSpec: (description) => api.post('/ai/generate-spec', { description }),
  generateCode: (specId) => api.post('/ai/generate-code', { specId }),
  reviewCode: (codeId) => api.post('/ai/review-code', { codeId }),
  getPendingReviews: () => api.get('/ai/reviews/pending'),
  processReview: (id, action, comments) => api.put(`/ai/reviews/${id}`, { action, comments }),
};

export const socialAPI = {
  getPosts: (params) => api.get('/social', { params }),
  createPost: (data) => api.post('/social', data),
  likePost: (id) => api.post(`/social/${id}/like`),
  addComment: (id, data) => api.post(`/social/${id}/comments`, data),
  deletePost: (id) => api.delete(`/social/${id}`),
  getFeed: (params) => api.get('/social/feed', { params }),
};
export const alumniAPI = {
  getAll: (params) => api.get('/alumni', { params }),
  getById: (id) => api.get(`/alumni/${id}`),
  create: (data) => api.post('/alumni', data),
  update: (id, data) => api.put(`/alumni/${id}`, data),
  getStats: () => api.get('/alumni/stats'),
};
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getMyExpenses: (params) => api.get('/expenses/my', { params }),
  create: (data) => api.post('/expenses', data),
  updateStatus: (id, data) => api.put(`/expenses/${id}/status`, data),
  getSummary: (params) => api.get('/expenses/summary', { params }),
};

// ── ReliSoft Workforce Resilience API ──
const resilience = axios.create({
  baseURL: '/api/resilience',
  headers: { 'Content-Type': 'application/json' },
});

resilience.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

resilience.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 503) {
      console.warn('Resilience backend not available at /api/resilience');
    }
    return Promise.reject(err);
  }
);

const _resilienceGet = (path) => resilience.get(path).then(r => r.data);
const _resiliencePost = (path, body) => resilience.post(path, body).then(r => r.data);

export const resilienceAPI = {
  getHealth: () => _resilienceGet('/'),
  getOrgHealth: () => _resilienceGet('/org-health'),
  getEmployees: () => _resilienceGet('/employees'),
  getEmployeeProfile: (name) => _resilienceGet(`/employee/${encodeURIComponent(name)}`),
  getSkillGaps: () => _resilienceGet('/skill-gaps'),
  getSuccessionPlanning: () => _resilienceGet('/succession-planning'),
  getWorkforceReadiness: () => _resilienceGet('/workforce-readiness'),
  getKnowledgeConcentration: () => _resilienceGet('/knowledge-concentration'),
  getSpofRanking: () => _resilienceGet('/spof-ranking'),
  getUpskilling: (name) => _resilienceGet(`/upskilling/${encodeURIComponent(name)}`),
  postWhatIf: (body) => _resiliencePost('/whatif', body),
  postPipeline: (body) => _resiliencePost('/pipeline', body),
  postScenarioRun: (body) => _resiliencePost('/scenario-run', body),
  getScenarios: () => _resilienceGet('/scenarios'),
  getReactions: () => _resilienceGet('/reactions'),
  postFeedback: (body) => _resiliencePost('/feedback', body),
  getFeedback: () => _resilienceGet('/feedback'),
  getSuggestions: () => _resiliencePost('/feedback/suggestions', {}),
  postApplyDecisions: (body) => _resiliencePost('/feedback/apply', body),
  uploadDataset: async (file) => {
    const form = new FormData();
    form.append('file', file);
    form.append('auto_activate', 'true');
    const res = await resilience.post('/dataset/upload', form);
    return res.data;
  },
  previewDataset: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await resilience.post('/dataset/preview', form);
    return res.data;
  },
  getDatasetInfo: () => _resilienceGet('/dataset/info'),
  getDatasetFiles: () => _resilienceGet('/dataset/files'),
  postDatasetActivate: (filename, mapping) => _resiliencePost('/dataset/activate', { filename, column_mapping: mapping || null }),
  postDatasetClear: () => _resiliencePost('/dataset/clear', {}),
  postTextInput: (body) => _resiliencePost('/text-input', body),
  getAnalyticsWeights: () => _resilienceGet('/analytics-weights'),
  postAnalyticsWeights: (body) => _resiliencePost('/analytics-weights', body),
  postResetWeights: () => _resiliencePost('/analytics-weights/reset', {}),
  postAIGenerateWeights: () => _resiliencePost('/analytics-weights/ai-generate', {}),
  getReportHtml: async (scenarioType, removed) => {
    const res = await resilience.get(`/report?scenario_type=${scenarioType}&removed=${encodeURIComponent(removed || '')}`);
    return res.data;
  },
  postQuery: (body) => _resiliencePost('/query', body),
};

export const aiCouncilAPI = {
  getMembers: () => api.get('/ai-council/members'),
  createMember: (data) => api.post('/ai-council/members', data),
  updateMember: (id, data) => api.put(`/ai-council/members/${id}`, data),
  deleteMember: (id) => api.delete(`/ai-council/members/${id}`),
  getMeetings: () => api.get('/ai-council/meetings'),
  createMeeting: (data) => api.post('/ai-council/meetings', data),
  updateMeeting: (id, data) => api.put(`/ai-council/meetings/${id}`, data),
  getProposals: () => api.get('/ai-council/proposals'),
  createProposal: (data) => api.post('/ai-council/proposals', data),
  castVote: (id, data) => api.post(`/ai-council/proposals/${id}/vote`, data),
};

export const visaAPI = {
  getApplications: (params) => api.get('/visa/applications', { params }),
  createApplication: (data) => api.post('/visa/applications', data),
  getApplication: (id) => api.get(`/visa/applications/${id}`),
  updateApplication: (id, data) => api.put(`/visa/applications/${id}`, data),
  updateApplicationStatus: (id, data) => api.put(`/visa/applications/${id}/status`, data),
  uploadDocument: (id, data) => api.post(`/visa/applications/${id}/documents`, data),
  getPassports: () => api.get('/visa/passports'),
  createPassport: (data) => api.post('/visa/passports', data),
  updatePassport: (id, data) => api.put(`/visa/passports/${id}`, data),
  getExpiryAlerts: () => api.get('/visa/expiry-alerts'),
};

export const fnfAPI = {
  getPending: () => api.get('/fnf/pending'),
  getMy: () => api.get('/fnf/my'),
  initiate: (separationId) => api.post(`/fnf/initiate/${separationId}`),
  getBySeparation: (separationId) => api.get(`/fnf/${separationId}`),
  update: (id, data) => api.put(`/fnf/${id}`, data),
  approve: (id) => api.put(`/fnf/${id}/approve`),
  disburse: (id, data) => api.put(`/fnf/${id}/disburse`, data),
  updateClearance: (id, data) => api.put(`/fnf/${id}/clearance`, data),
};

export const integrationAPI = {
  list: (params) => api.get('/integrations', { params }),
  create: (data) => api.post('/integrations', data),
  update: (id, data) => api.put(`/integrations/${id}`, data),
  delete: (id) => api.delete(`/integrations/${id}`),
  triggerSync: (id) => api.post(`/integrations/${id}/sync`),
  getLogs: (id, params) => api.get(`/integrations/${id}/logs`, { params }),
  getWebhooks: (params) => api.get('/integrations/webhooks', { params }),
  registerWebhook: (data) => api.post('/integrations/webhooks', data),
  deleteWebhook: (id) => api.delete(`/integrations/webhooks/${id}`),
  getBiometricStatus: () => api.get('/integrations/biometric/status'),
};

export const leaveTypeAPI = {
  list: () => api.get('/leave-types'),
  create: (data) => api.post('/leave-types', data),
  update: (id, data) => api.put(`/leave-types/${id}`, data),
  delete: (id) => api.delete(`/leave-types/${id}`),
};

export const certificationAPI = {
  getMy: () => api.get('/certifications/my'),
  getByEmployee: (employeeId) => api.get(`/certifications/${employeeId}`),
  create: (data) => api.post('/certifications', data),
  update: (id, data) => api.put(`/certifications/${id}`, data),
  getExpiring: (params) => api.get('/certifications/expiring', { params }),
};

export const advancedAIAPI = {
  generateInterviewQuestions: (data) => api.post('/ai/generate-questions', data),
  generatePerformanceSummary: (data) => api.post('/ai/generate-performance-summary', data),
  salaryRecommendation: (data) => api.post('/ai/salary-recommendation', data),
  analyzeAttendanceAnomalies: (data) => api.post('/ai/attendance-anomalies', data),
  skillGapAnalysis: (data) => api.post('/ai/skill-gap-analysis', data),
};

export const visitorAPI = {
  list: (params) => api.get('/visitors', { params }),
  create: (data) => api.post('/visitors', data),
  update: (id, data) => api.put(`/visitors/${id}`, data),
  delete: (id) => api.delete(`/visitors/${id}`),
  getVisits: (params) => api.get('/visitors/visits', { params }),
  createVisit: (data) => api.post('/visitors/visits', data),
  updateVisitStatus: (id, status) => api.put(`/visitors/visits/${id}/status`, { status }),
  getVisitHistory: (params) => api.get('/visitors/visits/history', { params }),
};

export const caseAPI = {
  list: (params) => api.get('/cases', { params }),
  create: (data) => api.post('/cases', data),
  getById: (id) => api.get(`/cases/${id}`),
  updateStatus: (id, status) => api.put(`/cases/${id}/status`, { status }),
  assignInvestigator: (id, data) => api.put(`/cases/${id}/assign`, data),
  resolve: (id, data) => api.put(`/cases/${id}/resolve`, data),
  addTimeline: (id, data) => api.post(`/cases/${id}/timeline`, data),
  getTimeline: (id) => api.get(`/cases/${id}/timeline`),
  getDocuments: (id) => api.get(`/cases/${id}/documents`),
  uploadDocument: (id, data) => api.post(`/cases/${id}/documents`, data),
};

export const smartFormAPI = {
  list: (params) => api.get('/smart-forms', { params }),
  create: (data) => api.post('/smart-forms', data),
  getById: (id) => api.get(`/smart-forms/${id}`),
  update: (id, data) => api.put(`/smart-forms/${id}`, data),
  publish: (id) => api.put(`/smart-forms/${id}/publish`),
  getSubmissions: (formId, params) => api.get(`/smart-forms/${formId}/submissions`, { params }),
  getSubmission: (id) => api.get(`/smart-forms/submissions/${id}`),
  getAnalytics: (formId) => api.get(`/smart-forms/${formId}/analytics`),
};

export const talentAnalyticsAPI = {
  getMatrix: (params) => api.get('/talent-analytics/matrix', { params }),
  getSegments: (params) => api.get('/talent-analytics/segments', { params }),
  getFlightRisk: (params) => api.get('/talent-analytics/flight-risk', { params }),
  getSuccession: (params) => api.get('/talent-analytics/succession', { params }),
  getBenchStrength: (params) => api.get('/talent-analytics/bench-strength', { params }),
  createReview: (data) => api.post('/talent-analytics/reviews', data),
};

export const workforceAPI = {
  listPlans: (params) => api.get('/workforce/plans', { params }),
  createPlan: (data) => api.post('/workforce/plans', data),
  updatePlan: (id, data) => api.put(`/workforce/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/workforce/plans/${id}`),
  listForecasts: (params) => api.get('/workforce/forecasts', { params }),
  createForecast: (data) => api.post('/workforce/forecasts', data),
};

export const internalMobilityAPI = {
  listPostings: (params) => api.get('/internal-mobility/postings', { params }),
  createPosting: (data) => api.post('/internal-mobility/postings', data),
  updatePosting: (id, data) => api.put(`/internal-mobility/postings/${id}`, data),
  listMyApplications: (params) => api.get('/internal-mobility/applications', { params }),
  applyToPosting: (postingId, data) => api.post(`/internal-mobility/postings/${postingId}/apply`, data),
};

export const benefitsAPI = {
  listPlans: (params) => api.get('/benefits/plans', { params }),
  createPlan: (data) => api.post('/benefits/plans', data),
  updatePlan: (id, data) => api.put(`/benefits/plans/${id}`, data),
  listMyBenefits: (params) => api.get('/benefits/my', { params }),
  enrollInPlan: (data) => api.post('/benefits/enroll', data),
  listDependents: (params) => api.get('/benefits/dependents', { params }),
  addDependent: (data) => api.post('/benefits/dependents', data),
};

export const assetAPI = {
  getAll: (params) => api.get('/assets', { params }),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  assign: (id, data) => api.put(`/assets/${id}/assign`, data),
  return: (id) => api.put(`/assets/${id}/return`),
};

export const contractorAPI = {
  listVendors: (params) => api.get('/contractors/vendors', { params }),
  createVendor: (data) => api.post('/contractors/vendors', data),
  updateVendor: (id, data) => api.put(`/contractors/vendors/${id}`, data),
  listContractors: (params) => api.get('/contractors', { params }),
  createContractor: (data) => api.post('/contractors', data),
  updateContractor: (id, data) => api.put(`/contractors/${id}`, data),
  listTimeLogs: (contractorId, params) => api.get(`/contractors/${contractorId}/time-logs`, { params }),
  createTimeLog: (contractorId, data) => api.post(`/contractors/${contractorId}/time-logs`, data),
};

export const documentTemplateAPI = {
  getAll: (params) => api.get('/document-templates', { params }),
  getByCode: (code) => api.get(`/document-templates/${code}`),
  generate: (data) => api.post('/document-templates/generate', data),
  autoFill: (employeeId) => api.get(`/document-templates/employee/${employeeId}/auto-fill`),
  preview: (params) => api.get('/document-templates/preview', { params }),
};

export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  create: (data) => api.post('/tickets', data),
  updateStatus: (id, data) => api.put(`/tickets/${id}/status`, data),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
};

export const travelAPI = {
  getMyRequests: () => api.get('/travel-expenses/my'),
  getAll: () => api.get('/travel-expenses'),
  create: (data) => api.post('/travel-expenses', data),
  updateStatus: (id, data) => api.put(`/travel-expenses/${id}/status`, data),
  submitExpense: (id, data) => api.post(`/travel-expenses/${id}/expense`, data),
};

export const documentAPI = {
  getAll: () => api.get('/documents'),
  create: (data) => api.post('/documents', data),
  archive: (id) => api.put(`/documents/${id}/archive`),
  sign: (id, data) => api.post(`/documents/${id}/sign`, data),
};

export const surveyAPI = {
  getAll: () => api.get('/surveys'),
  create: (data) => api.post('/surveys', data),
  submit: (id, data) => api.post(`/surveys/${id}/respond`, data),
  results: (id) => api.get(`/surveys/${id}/results`),
};

export const complianceAPI = {
  getAll: (params) => api.get('/compliance', { params }),
  getUpcoming: () => api.get('/compliance/upcoming'),
  create: (data) => api.post('/compliance', data),
  complete: (id, data) => api.put(`/compliance/${id}/complete`, data),
};

export const workflowAPI = {
  getAll: () => api.get('/workflows'),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  toggle: (id) => api.put(`/workflows/${id}/toggle`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const roleAPI = {
  getAll: () => api.get('/roles'),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (key, data) => api.put(`/settings/${key}`, data),
  bulkUpdate: (data) => api.put('/settings/bulk', data),
};

export const separationAPI = {
  getAll: () => api.get('/separation'),
  getMySeparation: () => api.get('/separation/my'),
  initiate: (data) => api.post('/separation', data),
  updateClearance: (id, data) => api.put(`/separation/${id}/clearance`, data),
  calculate: (id) => api.get(`/separation/${id}/calculate`),
  complete: (id) => api.put(`/separation/${id}/complete`),
};

export const analyticsAPI = {
  getHeadcount: (params) => api.get('/analytics/headcount', { params }),
  getAttrition: (params) => api.get('/analytics/attrition', { params }),
  getPayroll: (params) => api.get('/analytics/payroll', { params }),
  getAttendance: (params) => api.get('/analytics/attendance', { params }),
  getLeave: (params) => api.get('/analytics/leave', { params }),
  getRecruitment: (params) => api.get('/analytics/recruitment', { params }),
};

export const reportAPI = {
  exportCSV: (key, params) => api.get(`/reports/${key}/csv`, { params, responseType: 'blob' }),
  exportPDF: (key, params) => api.get(`/reports/${key}/pdf`, { params, responseType: 'blob' }),
  hrReport: (params) => api.get('/reports/hr', { params }),
  payrollReport: (params) => api.get('/reports/payroll', { params }),
  attendanceReport: (params) => api.get('/reports/attendance', { params }),
  leaveReport: (params) => api.get('/reports/leave', { params }),
  complianceReport: (params) => api.get('/reports/compliance', { params }),
};

export const serviceCategoryAPI = {
  getAll: (params) => api.get('/service-categories', { params }),
  getById: (id) => api.get(`/service-categories/${id}`),
  create: (data) => api.post('/service-categories', data),
  update: (id, data) => api.put(`/service-categories/${id}`, data),
  delete: (id) => api.delete(`/service-categories/${id}`),
};

export const serviceCatalogAPI = {
  getAll: (params) => api.get('/service-catalog', { params }),
  getByCategory: (category) => api.get(`/service-catalog/category/${category}`),
  getById: (id) => api.get(`/service-catalog/${id}`),
  create: (data) => api.post('/service-catalog', data),
  update: (id, data) => api.put(`/service-catalog/${id}`, data),
  toggleActive: (id) => api.put(`/service-catalog/${id}/toggle`),
  delete: (id) => api.delete(`/service-catalog/${id}`),
};

export const serviceRequestAPI = {
  getAll: (params) => api.get('/service-requests', { params }),
  getMy: () => api.get('/service-requests/my'),
  getById: (id) => api.get(`/service-requests/${id}`),
  create: (data) => api.post('/service-requests', data),
  submit: (id) => api.put(`/service-requests/${id}/submit`),
  approve: (id, data) => api.put(`/service-requests/${id}/approve`, data),
  reject: (id, data) => api.put(`/service-requests/${id}/reject`, data),
  fulfill: (id) => api.put(`/service-requests/${id}/fulfill`),
  cancel: (id) => api.put(`/service-requests/${id}/cancel`),
  addComment: (id, data) => api.post(`/service-requests/${id}/comments`, data),
};

export const itAssetAPI = {
  getAll: (params) => api.get('/it-assets', { params }),
  getAvailable: () => api.get('/it-assets/available'),
  getByEmployee: (employee) => api.get(`/it-assets/employee/${employee}`),
  getWarrantyExpiring: () => api.get('/it-assets/warranty-expiring'),
  getById: (id) => api.get(`/it-assets/${id}`),
  create: (data) => api.post('/it-assets', data),
  update: (id, data) => api.put(`/it-assets/${id}`, data),
  assign: (id, data) => api.put(`/it-assets/${id}/assign`, data),
  returnAsset: (id, data) => api.put(`/it-assets/${id}/return`, data),
  delete: (id) => api.delete(`/it-assets/${id}`),
};

export const softwareLicenseAPI = {
  getAll: (params) => api.get('/software-licenses', { params }),
  getExpiring: () => api.get('/software-licenses/expiring'),
  getUsageStats: () => api.get('/software-licenses/usage-stats'),
  getById: (id) => api.get(`/software-licenses/${id}`),
  create: (data) => api.post('/software-licenses', data),
  update: (id, data) => api.put(`/software-licenses/${id}`, data),
  delete: (id) => api.delete(`/software-licenses/${id}`),
};

export const licenseAllocationAPI = {
  getAll: (params) => api.get('/license-allocations', { params }),
  getByLicense: (license) => api.get(`/license-allocations/license/${license}`),
  getByEmployee: (employee) => api.get(`/license-allocations/employee/${employee}`),
  allocate: (data) => api.post('/license-allocations/allocate', data),
  revoke: (id, data) => api.put(`/license-allocations/${id}/revoke`, data),
  delete: (id) => api.delete(`/license-allocations/${id}`),
};

export const purchaseRequisitionAPI = {
  getAll: (params) => api.get('/purchase-requisitions', { params }),
  getById: (id) => api.get(`/purchase-requisitions/${id}`),
  create: (data) => api.post('/purchase-requisitions', data),
  update: (id, data) => api.put(`/purchase-requisitions/${id}`, data),
  submit: (id) => api.put(`/purchase-requisitions/${id}/submit`),
  approve: (id, data) => api.put(`/purchase-requisitions/${id}/approve`, data),
  reject: (id, data) => api.put(`/purchase-requisitions/${id}/reject`, data),
  convertToPO: (id, data) => api.post(`/purchase-requisitions/${id}/convert-to-po`, data),
};

export const purchaseOrderAPI = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  sendToVendor: (id) => api.put(`/purchase-orders/${id}/send`),
  receiveItems: (id, data) => api.put(`/purchase-orders/${id}/receive`, data),
  cancel: (id) => api.put(`/purchase-orders/${id}/cancel`),
};

export const goodsReceiptAPI = {
  getAll: (params) => api.get('/goods-receipts', { params }),
  getById: (id) => api.get(`/goods-receipts/${id}`),
  create: (data) => api.post('/goods-receipts', data),
  receiveItems: (id, data) => api.put(`/goods-receipts/${id}/receive`, data),
};

export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  matchInvoice: (id, data) => api.put(`/invoices/${id}/match`, data),
  approveInvoice: (id) => api.put(`/invoices/${id}/approve`),
  payInvoice: (id, data) => api.put(`/invoices/${id}/pay`, data),
  disputeInvoice: (id, data) => api.put(`/invoices/${id}/dispute`, data),
};

export const policyAPI = {
  getAll: (params) => api.get('/policies', { params }),
  getActive: () => api.get('/policies/active'),
  getById: (id) => api.get(`/policies/${id}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  archive: (id) => api.put(`/policies/${id}/archive`),
  delete: (id) => api.delete(`/policies/${id}`),
};

export const policyAcknowledgmentAPI = {
  getAll: (params) => api.get('/policy-acknowledgments', { params }),
  getPending: () => api.get('/policy-acknowledgments/pending'),
  getStats: () => api.get('/policy-acknowledgments/stats'),
  create: (data) => api.post('/policy-acknowledgments', data),
  acknowledge: (id, data) => api.post(`/policy-acknowledgments/${id}/acknowledge`, data),
  getById: (id) => api.get(`/policy-acknowledgments/${id}`),
};

export const profileChangeRequestAPI = {
  getAll: (params) => api.get('/profile-change-requests', { params }),
  getMy: () => api.get('/profile-change-requests/my'),
  getById: (id) => api.get(`/profile-change-requests/${id}`),
  create: (data) => api.post('/profile-change-requests', data),
  approve: (id, data) => api.put(`/profile-change-requests/${id}/approve`, data),
  reject: (id, data) => api.put(`/profile-change-requests/${id}/reject`, data),
};

export const vendorAPI = {
  list: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

export const gatePassAPI = {
  getAll: (params) => api.get('/gate-passes', { params }),
  getToday: () => api.get('/gate-passes/today'),
  getActive: () => api.get('/gate-passes/active'),
  getById: (id) => api.get(`/gate-passes/${id}`),
  create: (data) => api.post('/gate-passes', data),
  update: (id, data) => api.put(`/gate-passes/${id}`, data),
  checkIn: (id, data) => api.put(`/gate-passes/${id}/checkin`, data),
  checkOut: (id, data) => api.put(`/gate-passes/${id}/checkout`, data),
  cancel: (id) => api.put(`/gate-passes/${id}/cancel`),
};

export const virtualIdCardAPI = {
  getAll: (params) => api.get('/virtual-id-cards', { params }),
  getMy: () => api.get('/virtual-id-cards/my'),
  getByEmployee: (employee) => api.get(`/virtual-id-cards/employee/${employee}`),
  getById: (id) => api.get(`/virtual-id-cards/${id}`),
  create: (data) => api.post('/virtual-id-cards', data),
  update: (id, data) => api.put(`/virtual-id-cards/${id}`, data),
  suspend: (id) => api.put(`/virtual-id-cards/${id}/suspend`),
  activate: (id) => api.put(`/virtual-id-cards/${id}/activate`),
  delete: (id) => api.delete(`/virtual-id-cards/${id}`),
};

export const workspaceAPI = {
  getDirectory: () => api.get('/workspace'),
  getProjects: () => api.get('/workspace/projects'),
  getHrPolicy: () => api.get('/workspace/hr-policy'),
  updateHrPolicy: (data) => api.put('/workspace/hr-policy', data),
  createEmployee: (data) => api.post('/workspace/employees', data),
  updateEmployee: (id, data) => api.put(`/workspace/employees/${id}`, data),
  createProject: (data) => api.post('/workspace/projects', data),
  updateProject: (id, data) => api.put(`/workspace/projects/${id}`, data),
  createTeam: (data) => api.post('/workspace/teams', data),
  updateTeam: (id, data) => api.put(`/workspace/teams/${id}`, data),
};

export const excelAPI = {
  uploadEmployees: (formData) => api.post('/excel/upload-existing-employees', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadLeaveBalances: (formData) => api.post('/excel/upload-leave-balances', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadEmployeeTemplate: () => api.get('/excel/template/employees', { responseType: 'blob' }),
  downloadLeaveBalanceTemplate: () => api.get('/excel/template/leave-balances', { responseType: 'blob' }),
};

export const newsAPI = {
  get: (params) => api.get('/news', { params }),
};

export default api;
