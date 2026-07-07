import express from 'express';
import {
  getTickets, getTicket, createTicket, updateTicketStatus,
  addComment, assignTicket, getMyTickets,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-tickets', protect, getMyTickets);
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicket);
router.post('/', protect, createTicket);
router.put('/:id/status', protect, updateTicketStatus);
router.post('/:id/comments', protect, addComment);
router.put('/:id/assign', protect, authorize('admin', 'it'), assignTicket);

export default router;
