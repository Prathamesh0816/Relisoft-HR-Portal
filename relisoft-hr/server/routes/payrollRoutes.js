import express from 'express';
import {
  getPayrolls, getPayroll, processPayroll, getMyPayroll, generatePayslip,
  updatePayrollStatus, getPayrollSummary,
  createSalaryStructure, getSalaryStructures, getSalaryStructure,
  updateSalaryStructure, deleteSalaryStructure, setDefaultStructure,
  generatePayslipForEmployee, getPayslips, getPayslip,
  bulkGeneratePayslips, approvePayslip, getPayslipPDF,
  generateForm16, getForm16PDF,
  submitTaxDeclaration, getMyTaxDeclaration, getTaxDeclarations,
  verifyTaxDeclaration, preProcessPayroll,
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-payroll', protect, getMyPayroll);
router.get('/summary', protect, authorize('admin', 'hr', 'finance'), getPayrollSummary);
router.post('/process', protect, authorize('admin', 'hr'), processPayroll);
router.post('/pre-process', protect, authorize('admin', 'hr'), preProcessPayroll);
router.get('/', protect, getPayrolls);
router.get('/:id', protect, getPayroll);
router.get('/:id/payslip', protect, generatePayslip);
router.put('/:id/status', protect, authorize('admin', 'finance'), updatePayrollStatus);

router.get('/salary-structures', protect, getSalaryStructures);
router.post('/salary-structures', protect, authorize('admin', 'hr'), createSalaryStructure);
router.get('/salary-structures/:id', protect, getSalaryStructure);
router.put('/salary-structures/:id', protect, authorize('admin', 'hr'), updateSalaryStructure);
router.delete('/salary-structures/:id', protect, authorize('admin'), deleteSalaryStructure);
router.put('/salary-structures/:id/set-default', protect, authorize('admin', 'hr'), setDefaultStructure);

router.post('/payslips/generate', protect, authorize('admin', 'hr'), generatePayslipForEmployee);
router.post('/payslips/bulk-generate', protect, authorize('admin', 'hr'), bulkGeneratePayslips);
router.get('/payslips', protect, getPayslips);
router.get('/payslips/:id', protect, getPayslip);
router.put('/payslips/:id/approve', protect, authorize('admin', 'hr', 'finance'), approvePayslip);
router.get('/payslips/:id/pdf', protect, getPayslipPDF);

router.get('/form16/:employeeId', protect, generateForm16);
router.get('/form16/:employeeId/pdf', protect, getForm16PDF);

router.post('/tax-declaration', protect, submitTaxDeclaration);
router.get('/tax-declaration/my', protect, getMyTaxDeclaration);
router.get('/tax-declarations', protect, authorize('admin', 'hr', 'finance'), getTaxDeclarations);
router.put('/tax-declaration/:id/verify', protect, authorize('admin', 'hr'), verifyTaxDeclaration);

export default router;
