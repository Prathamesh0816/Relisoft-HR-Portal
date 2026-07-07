import express from 'express';
const router = express.Router();
import {
  getMatrix,
  getSegments,
  getFlightRisk,
  getSuccession,
  getBenchStrength,
  createReview,
  getReviews,
  getReview,
  updateReviewStatus,
  addReviewDecision,
} from '../controllers/talentAnalyticsController.js';

router.get('/matrix', getMatrix);
router.get('/segments', getSegments);
router.get('/flight-risk', getFlightRisk);
router.get('/succession', getSuccession);
router.get('/bench-strength', getBenchStrength);
router.post('/reviews', createReview);
router.get('/reviews', getReviews);
router.get('/reviews/:id', getReview);
router.put('/reviews/:id', updateReviewStatus);
router.post('/reviews/:id/decisions', addReviewDecision);

export default router;
