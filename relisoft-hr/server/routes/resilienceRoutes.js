import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as resilienceController from '../controllers/resilienceController.js';

const router = Router();

router.use(protect);

router.get('/org-health', authorize('admin', 'hr', 'manager'), resilienceController.getOrgHealth);
router.get('/employees', authorize('admin', 'hr', 'manager'), resilienceController.listEmployees);
router.get('/employee/:name', authorize('admin', 'hr', 'manager', 'employee'), resilienceController.getEmployee);
router.get('/skill-gaps', authorize('admin', 'hr', 'manager'), resilienceController.getSkillGaps);
router.get('/succession-planning', authorize('admin', 'hr'), resilienceController.getSuccessionPlanning);
router.get('/workforce-readiness', authorize('admin', 'hr'), resilienceController.getWorkforceReadiness);
router.get('/knowledge-concentration', authorize('admin', 'hr', 'manager'), resilienceController.getKnowledgeConcentration);
router.get('/spof-ranking', authorize('admin', 'hr'), resilienceController.getSpofRanking);
router.get('/upskilling/:name', authorize('admin', 'hr', 'manager', 'employee'), resilienceController.getUpskilling);

router.post('/whatif', authorize('admin', 'hr'), resilienceController.postWhatIf);
router.post('/pipeline', authorize('admin', 'hr'), resilienceController.postPipeline);

router.post('/feedback', authorize('admin', 'hr'), resilienceController.postFeedback);
router.get('/feedback', authorize('admin', 'hr'), resilienceController.listFeedback);
router.post('/feedback/suggestions', authorize('admin', 'hr'), resilienceController.generateSuggestions);
router.post('/feedback/apply', authorize('admin', 'hr'), resilienceController.applyDecisions);

router.get('/analytics-weights', authorize('admin', 'hr'), resilienceController.getAnalyticsWeights);
router.post('/analytics-weights', authorize('admin'), resilienceController.setAnalyticsWeights);
router.post('/analytics-weights/reset', authorize('admin'), resilienceController.resetAnalyticsWeights);
router.post('/analytics-weights/ai-generate', authorize('admin', 'hr'), resilienceController.generateAIWeights);

router.get('/report', authorize('admin', 'hr', 'manager'), resilienceController.getReport);

router.post('/query', authorize('admin', 'hr', 'manager', 'employee'), resilienceController.postQuery);

export default router;
