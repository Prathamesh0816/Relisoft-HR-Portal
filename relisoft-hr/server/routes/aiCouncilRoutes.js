import express from 'express';
import {
  getMembers, createMember, updateMember, deleteMember,
  getMeetings, createMeeting, updateMeeting,
  getProposals, createProposal, castVote,
} from '../controllers/aiCouncilController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/members', protect, getMembers);
router.post('/members', protect, authorize('admin', 'hr'), createMember);
router.put('/members/:id', protect, authorize('admin', 'hr'), updateMember);
router.delete('/members/:id', protect, authorize('admin'), deleteMember);

router.get('/meetings', protect, getMeetings);
router.post('/meetings', protect, authorize('admin', 'hr'), createMeeting);
router.put('/meetings/:id', protect, authorize('admin', 'hr'), updateMeeting);

router.get('/proposals', protect, getProposals);
router.post('/proposals', protect, authorize('admin', 'hr'), createProposal);
router.post('/proposals/:id/vote', protect, castVote);

export default router;
