import api from './api';

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

export default aiAPI;
