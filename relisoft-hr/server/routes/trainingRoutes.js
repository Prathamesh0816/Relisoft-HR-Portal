import express from 'express';
import {
  getTrainings, getTraining, createTraining, updateTraining,
  registerParticipant, updateParticipantStatus, addFeedback, getTrainingCalendar,
} from '../controllers/trainingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/calendar', protect, getTrainingCalendar);
router.get('/', protect, getTrainings);
router.get('/:id', protect, getTraining);
router.post('/', protect, authorize('admin', 'hr', 'manager'), createTraining);
router.put('/:id', protect, authorize('admin', 'hr'), updateTraining);
router.post('/:id/register', protect, registerParticipant);
router.put('/:id/participant-status', protect, authorize('admin', 'hr'), updateParticipantStatus);
router.post('/:id/feedback', protect, addFeedback);

export default router;
