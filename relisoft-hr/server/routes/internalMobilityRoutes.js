import express from 'express';
const router = express.Router();
import {
  createPosting,
  getPostings,
  getPosting,
  updatePosting,
  deletePosting,
  createApplication,
  getApplications,
  updateApplicationStatus,
} from '../controllers/internalMobilityController.js';

router.get('/postings', getPostings);
router.post('/postings', createPosting);
router.get('/postings/:id', getPosting);
router.put('/postings/:id', updatePosting);
router.delete('/postings/:id', deletePosting);
router.post('/applications', createApplication);
router.get('/applications/:employeeId', getApplications);
router.put('/applications/:id/status', updateApplicationStatus);

export default router;
