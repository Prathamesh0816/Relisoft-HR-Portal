import express from 'express';
import {
  getReviews, getReview, createReview, updateReview,
  addSelfRating, addManagerRating, completeReview, getMyReviews,
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-reviews', protect, getMyReviews);
router.get('/', protect, getReviews);
router.get('/:id', protect, getReview);
router.post('/', protect, authorize('admin', 'hr', 'manager'), createReview);
router.put('/:id', protect, authorize('admin', 'hr'), updateReview);
router.put('/:id/self-rating', protect, addSelfRating);
router.put('/:id/manager-rating', protect, authorize('admin', 'manager'), addManagerRating);
router.put('/:id/complete', protect, authorize('admin', 'hr'), completeReview);

export default router;
