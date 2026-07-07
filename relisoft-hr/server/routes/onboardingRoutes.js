import express from 'express';
import multer from 'multer';
import {
  getOnboardings, getOnboarding, createOnboarding, updateDocumentStatus,
  updateITSetup, updateAssetAllocation, updateOnboardingStatus, completeOnboarding,
} from '../controllers/onboardingController.js';
import {
  getProfile, saveProfile, downloadDocument,
} from '../controllers/onboardingController.js';
import { protect, authorize } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const router = express.Router();

// Existing routes
router.get('/', protect, getOnboardings);
router.get('/:id', protect, getOnboarding);
router.post('/', protect, authorize('admin', 'hr'), createOnboarding);
router.put('/:id/document-status', protect, authorize('admin', 'hr'), updateDocumentStatus);
router.put('/:id/it-setup', protect, authorize('admin', 'hr', 'it'), updateITSetup);
router.put('/:id/asset-allocation', protect, authorize('admin', 'hr'), updateAssetAllocation);
router.put('/:id/stage', protect, authorize('admin', 'hr'), updateOnboardingStatus);
router.put('/:id/complete', protect, authorize('admin', 'hr'), completeOnboarding);

// New .NET-aligned onboarding profile routes
router.get('/profile/:employeeId', protect, getProfile);
router.post('/profile',
  protect,
  upload.fields([
    { name: 'experienceLetter', maxCount: 1 },
    { name: 'salarySlips', maxCount: 5 },
    { name: 'additionalDocuments', maxCount: 10 },
  ]),
  saveProfile
);
router.get('/documents/:documentId', protect, downloadDocument);

export default router;
