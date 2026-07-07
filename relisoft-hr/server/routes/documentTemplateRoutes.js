import express from 'express';
import {
  getTemplates, getTemplate, generateDocument, generateWithAutoFill, getBranding, previewDocument,
} from '../controllers/documentTemplateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/branding', getBranding);
router.get('/', protect, getTemplates);
router.get('/:code', protect, getTemplate);
router.post('/generate', protect, generateDocument);
router.get('/employee/:employeeId/auto-fill', protect, generateWithAutoFill);
router.get('/preview', protect, previewDocument);

export default router;
