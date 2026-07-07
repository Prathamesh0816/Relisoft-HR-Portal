import express from 'express';
import {
  getWorkspace, createEmployee, updateEmployee,
  getProjects, createProject, updateProject, createTeam, updateTeam,
  getHrPolicy, updateHrPolicy,
} from '../controllers/workspaceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWorkspace);
router.get('/projects', protect, getProjects);
router.post('/projects', protect, authorize('superadmin', 'admin', 'hr'), createProject);
router.put('/projects/:id', protect, authorize('superadmin', 'admin', 'hr'), updateProject);
router.post('/teams', protect, authorize('superadmin', 'admin', 'hr'), createTeam);
router.put('/teams/:id', protect, authorize('superadmin', 'admin', 'hr'), updateTeam);
router.get('/hr-policy', protect, getHrPolicy);
router.put('/hr-policy', protect, authorize('superadmin', 'admin', 'hr'), updateHrPolicy);
router.post('/employees', protect, authorize('superadmin', 'admin', 'hr'), createEmployee);
router.put('/employees/:id', protect, authorize('superadmin', 'admin', 'hr', 'manager'), updateEmployee);

export default router;
