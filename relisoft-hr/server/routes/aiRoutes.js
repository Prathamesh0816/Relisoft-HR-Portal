import express from 'express';
import {
  chat,
  parseResume,
  matchCandidates,
  generateDocument,
  analyzeSentiment,
  generateInsights,
  predictAttrition,
  recommendTraining,
  generateSpec,
  generateCode,
  reviewCode,
  listPendingReviews,
  processReview,
  generateInterviewQuestions,
  generatePerformanceSummary,
  salaryRecommendation,
  analyzeAttendanceAnomalies,
  skillGapAnalysis,
  policyChatbotQuery,
  batchAttritionPrediction,
  advancedTrainingRecommendations,
  batchResumeMatcher,
  batchSentimentAnalysis,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';
import aiAuditLogger from '../middleware/aiAudit.js';

const router = express.Router();

router.use(protect);
router.use(aiAuditLogger);

router.post('/chat', chat);
router.post('/parse-resume', parseResume);
router.post('/match-candidates', matchCandidates);
router.post('/generate-document', generateDocument);
router.post('/analyze-sentiment', analyzeSentiment);
router.post('/insights', generateInsights);
router.post('/predict-attrition', predictAttrition);
router.post('/recommend-training', recommendTraining);
router.post('/generate-spec', authorize('admin', 'hr'), generateSpec);
router.post('/generate-code', authorize('admin', 'hr'), generateCode);
router.post('/review-code', reviewCode);
router.post('/generate-questions', generateInterviewQuestions);
router.post('/generate-performance-summary', generatePerformanceSummary);
router.post('/salary-recommendation', salaryRecommendation);
router.post('/attendance-anomalies', analyzeAttendanceAnomalies);
router.post('/skill-gap-analysis', skillGapAnalysis);

router.post('/policy-chatbot', policyChatbotQuery);
router.post('/batch-attrition', batchAttritionPrediction);
router.post('/advanced-training', advancedTrainingRecommendations);
router.post('/batch-resume-matcher', batchResumeMatcher);
router.post('/batch-sentiment', batchSentimentAnalysis);

router.get('/reviews/pending', authorize('admin', 'hr'), listPendingReviews);
router.put('/reviews/:id', authorize('admin', 'hr'), processReview);

export default router;
