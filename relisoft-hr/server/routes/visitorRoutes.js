import express from 'express';
const router = express.Router();
import {
  registerVisitor,
  getVisitors,
  updateVisitor,
  scheduleVisit,
  getPendingVisits,
  approveVisit,
  checkIn,
  checkOut,
  getVisitHistory,
} from '../controllers/visitorController.js';

router.post('/register', registerVisitor);
router.get('/', getVisitors);
router.put('/:id', updateVisitor);
router.post('/visits', scheduleVisit);
router.get('/visits/pending', getPendingVisits);
router.put('/visits/:id/approve', approveVisit);
router.put('/visits/:id/check-in', checkIn);
router.put('/visits/:id/check-out', checkOut);
router.get('/history/:visitorId', getVisitHistory);

export default router;
