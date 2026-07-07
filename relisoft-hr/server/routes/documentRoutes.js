import express from 'express';
import {
  getDocuments, getDocument, createDocument, updateDocument,
  addSignature, archiveDocument, generateFromTemplate,
  uploadDocument, getEmployeeDocuments, getExpiringDocuments,
} from '../controllers/documentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/expiring', protect, getExpiringDocuments);
router.get('/employee/:employeeId', protect, getEmployeeDocuments);
router.post('/upload', protect, uploadDocument);
router.post('/from-template', protect, generateFromTemplate);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.post('/', protect, createDocument);
router.put('/:id', protect, updateDocument);
router.post('/:id/sign', protect, addSignature);
router.put('/:id/archive', protect, authorize('admin', 'hr'), archiveDocument);

export default router;
