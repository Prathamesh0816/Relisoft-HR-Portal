import express from 'express';
import {
  startFeature,
  getWorkflowStatus,
  getWorkflowTimeline,
  listWorkflows,
  approveSpec,
  rejectSpec,
  generateCode,
  reviewAndApprove,
  requestChanges,
  cancelWorkflow,
  validateSpec,
  generateSpecTemplate,
  checkSpecCompleteness,
  suggestSpecImprovements,
  generateFromSpec,
  reviewCode,
  getReviewQueueStats,
  getPendingReviews,
  assignReviewer,
  listModules,
  executeModuleAIAction,
  autoGenerateFullModule,
  generateModuleCodeFromSpec,
  reviewModuleCodeEndpoint,
  generateModuleTestsEndpoint,
  generateSpecFromDesc,
  registerReviewer,
} from '../controllers/sddPipelineController.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'SDD Pipeline operational', version: '2.0.0' }));

router.post('/features', startFeature);
router.get('/features', listWorkflows);
router.get('/features/:id', getWorkflowStatus);
router.get('/features/:id/timeline', getWorkflowTimeline);
router.post('/features/:id/approve-spec', approveSpec);
router.post('/features/:id/reject-spec', rejectSpec);
router.post('/features/:id/generate-code', generateCode);
router.post('/features/:id/request-changes', requestChanges);
router.post('/features/:id/cancel', cancelWorkflow);

router.post('/review/:codeReviewId/approve', reviewAndApprove);

router.post('/spec/validate', validateSpec);
router.get('/spec/template', generateSpecTemplate);
router.post('/spec/completeness', checkSpecCompleteness);
router.post('/spec/suggestions', suggestSpecImprovements);

router.post('/generate/from-spec', generateFromSpec);
router.post('/review/code', reviewCode);

router.get('/review-queue/stats', getReviewQueueStats);
router.get('/review-queue/pending', getPendingReviews);
router.post('/review-queue/:reviewId/assign', assignReviewer);
router.post('/review-queue/register-reviewer', registerReviewer);

router.get('/modules', listModules);
router.post('/modules/execute', executeModuleAIAction);
router.post('/modules/auto-generate', autoGenerateFullModule);
router.post('/modules/generate-spec', generateSpecFromDesc);
router.post('/modules/generate-code', generateModuleCodeFromSpec);
router.post('/modules/review-code', reviewModuleCodeEndpoint);
router.post('/modules/generate-tests', generateModuleTestsEndpoint);

export default router;
