import express from 'express';
import {
  getNotifications, markRead, markAllRead, getUnreadCount, createNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markRead);
router.put('/mark-all-read', protect, markAllRead);
router.post('/', protect, authorize('admin', 'hr'), createNotification);

export default router;
