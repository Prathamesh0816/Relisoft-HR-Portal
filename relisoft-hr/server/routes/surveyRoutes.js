import express from 'express';
import {
  getSurveys, getSurvey, createSurvey, updateSurvey,
  submitResponse, getSurveyResults, closeSurvey,
} from '../controllers/surveyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSurveys);
router.get('/:id', protect, getSurvey);
router.get('/:id/results', protect, authorize('admin', 'hr'), getSurveyResults);
router.post('/', protect, authorize('admin', 'hr'), createSurvey);
router.put('/:id', protect, authorize('admin', 'hr'), updateSurvey);
router.post('/:id/respond', protect, submitResponse);
router.put('/:id/close', protect, authorize('admin', 'hr'), closeSurvey);

export default router;
