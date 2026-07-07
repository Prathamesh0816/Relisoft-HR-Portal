import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const specDirStructure = [
  'specs/modules',
  'specs/api',
  'specs/database',
  'specs/workflows',
  'specs/ai',
];

const moduleTemplates = {
  'leave-management': {
    title: 'Leave Management Module',
    sections: {
      Overview: 'The Leave Management module handles employee leave requests, approvals, balances, and tracking across multiple leave types including earned leave, sick leave, casual leave, and compensatory leave.',
      Features: [
        'Apply for leave with type, dates, and reason',
        'Multi-level approval workflow',
        'Leave balance tracking per employee',
        'Holiday calendar integration',
        'Leave calendar view',
        'Comp-off and carry-forward rules',
        'Email notifications for leave events',
      ],
      'Data Model': {
        LeaveRequest: {
          fields: {
            employee: { type: 'ObjectId', ref: 'Employee', required: true },
            leaveType: { type: 'String', enum: ['EL', 'SL', 'CL', 'CO', 'LWP'], required: true },
            fromDate: { type: 'Date', required: true },
            toDate: { type: 'Date', required: true },
            totalDays: { type: 'Number', required: true },
            reason: { type: 'String', required: true },
            status: { type: 'String', enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
            approvers: [{ user: { type: 'ObjectId', ref: 'Employee' }, status: { type: 'String', enum: ['pending', 'approved', 'rejected'] } }],
            appliedAt: { type: 'Date' },
            reviewedAt: { type: 'Date' },
            reviewedBy: { type: 'ObjectId', ref: 'Employee' },
            comments: { type: 'String' },
          },
        },
        LeaveBalance: {
          fields: {
            employee: { type: 'ObjectId', ref: 'Employee', required: true, unique: true },
            EL: { total: { type: 'Number' }, used: { type: 'Number' }, pending: { type: 'Number' } },
            SL: { total: { type: 'Number' }, used: { type: 'Number' }, pending: { type: 'Number' } },
            CL: { total: { type: 'Number' }, used: { type: 'Number' }, pending: { type: 'Number' } },
            CO: { total: { type: 'Number' }, used: { type: 'Number' }, pending: { type: 'Number' } },
            year: { type: 'Number' },
          },
        },
      },
      'API Endpoints': [
        { method: 'GET', path: '/api/leaves', description: 'List leaves with filters', auth: true },
        { method: 'POST', path: '/api/leaves', description: 'Apply for leave', auth: true },
        { method: 'GET', path: '/api/leaves/:id', description: 'Get leave details', auth: true },
        { method: 'PUT', path: '/api/leaves/:id', description: 'Update leave request', auth: true },
        { method: 'DELETE', path: '/api/leaves/:id', description: 'Cancel leave request', auth: true },
        { method: 'PUT', path: '/api/leaves/:id/approve', description: 'Approve leave', auth: true, roles: ['admin', 'hr', 'manager'] },
        { method: 'PUT', path: '/api/leaves/:id/reject', description: 'Reject leave', auth: true, roles: ['admin', 'hr', 'manager'] },
        { method: 'GET', path: '/api/leaves/balance', description: 'Get my leave balance', auth: true },
        { method: 'GET', path: '/api/leaves/balance/:employeeId', description: 'Get employee leave balance', auth: true, roles: ['admin', 'hr'] },
      ],
      'Business Rules': [
        'Employees can only apply for leave if they have sufficient balance',
        'Leave requests spanning holidays should not count holidays as leave days',
        'Sick leave requires a medical certificate if exceeding 3 days',
        'Consecutive leave above 5 days requires manager approval',
        'Leave can be cancelled only if status is pending',
        'Comp-off leave must be used within 90 days of accrual',
        'Maximum continuous leave is 30 days per request',
      ],
    },
  },
  'attendance-management': {
    title: 'Attendance Management Module',
    sections: {
      Overview: 'The Attendance Management module tracks employee check-in/check-out times, handles late marks, overtime calculations, and provides attendance reports.',
      Features: [
        'Daily check-in and check-out with geo-tagging',
        'Late arrival and early departure tracking',
        'Overtime calculation and approval',
        'Monthly attendance reports',
        'Attendance regularization requests',
        'Integration with leave and shift management',
      ],
      'Data Model': {
        Attendance: {
          fields: {
            employee: { type: 'ObjectId', ref: 'Employee', required: true },
            date: { type: 'Date', required: true },
            checkIn: { type: 'DateTime' },
            checkOut: { type: 'DateTime' },
            status: { type: 'String', enum: ['present', 'absent', 'half-day', 'late', 'holiday', 'leave'], required: true },
            lateMinutes: { type: 'Number', default: 0 },
            earlyDepartureMinutes: { type: 'Number', default: 0 },
            overtimeMinutes: { type: 'Number', default: 0 },
            regularization: { type: 'ObjectId', ref: 'Regularization' },
            location: { checkIn: { lat: 'Number', lng: 'Number' }, checkOut: { lat: 'Number', lng: 'Number' } },
            notes: { type: 'String' },
          },
        },
      },
      'API Endpoints': [
        { method: 'POST', path: '/api/attendance/check-in', description: 'Employee check-in', auth: true },
        { method: 'POST', path: '/api/attendance/check-out', description: 'Employee check-out', auth: true },
        { method: 'GET', path: '/api/attendance', description: 'List attendance records', auth: true },
        { method: 'GET', path: '/api/attendance/my', description: 'My attendance records', auth: true },
        { method: 'GET', path: '/api/attendance/report', description: 'Attendance report', auth: true, roles: ['admin', 'hr'] },
        { method: 'POST', path: '/api/attendance/regularize', description: 'Request regularization', auth: true },
        { method: 'PUT', path: '/api/attendance/regularize/:id', description: 'Approve/reject regularization', auth: true, roles: ['admin', 'hr', 'manager'] },
      ],
      'Business Rules': [
        'Check-in before 9:30 AM is on-time, after 9:30 AM is late',
        'Minimum 4 hours of presence counts as half-day',
        'Overtime requires prior approval for eligibility',
        'Regularization requests must be submitted within 7 days',
        'Weekly off and holidays are auto-marked as holiday',
      ],
    },
  },
  'payroll-management': {
    title: 'Payroll Management Module',
    sections: {
      Overview: 'The Payroll Management module handles salary processing, deductions, tax calculations, payslip generation, and bank file exports.',
      Features: [
        'Monthly salary processing and calculation',
        'Configurable salary components (basic, HRA, allowances, deductions)',
        'Tax calculation and TDS deduction',
        'PF, ESI, and other statutory deductions',
        'Payslip generation and distribution',
        'Bank file generation for salary disbursement',
        'Arrears and retrospective adjustments',
      ],
      'Data Model': {
        Payroll: {
          fields: {
            employee: { type: 'ObjectId', ref: 'Employee', required: true },
            month: { type: 'Number', required: true },
            year: { type: 'Number', required: true },
            earnings: { basic: { type: 'Number' }, hra: { type: 'Number' }, allowances: { type: 'Map' }, bonus: { type: 'Number' }, overtime: { type: 'Number' } },
            deductions: { pf: { type: 'Number' }, esi: { type: 'Number' }, tax: { type: 'Number' }, loan: { type: 'Number' }, advance: { type: 'Number' }, other: { type: 'Map' } },
            grossPay: { type: 'Number', required: true },
            netPay: { type: 'Number', required: true },
            status: { type: 'String', enum: ['draft', 'processed', 'approved', 'paid'], default: 'draft' },
            processedBy: { type: 'ObjectId', ref: 'User' },
            processedAt: { type: 'Date' },
            paidAt: { type: 'Date' },
          },
        },
      },
      'API Endpoints': [
        { method: 'GET', path: '/api/payroll', description: 'List payroll records', auth: true, roles: ['admin', 'hr', 'finance'] },
        { method: 'POST', path: '/api/payroll/process', description: 'Process monthly payroll', auth: true, roles: ['admin', 'hr', 'finance'] },
        { method: 'GET', path: '/api/payroll/:id', description: 'Get payroll details', auth: true, roles: ['admin', 'hr', 'finance'] },
        { method: 'PUT', path: '/api/payroll/:id/approve', description: 'Approve payroll', auth: true, roles: ['admin', 'finance'] },
        { method: 'GET', path: '/api/payroll/payslip/:id', description: 'Generate payslip', auth: true },
        { method: 'GET', path: '/api/payroll/my-payslips', description: 'My payslips', auth: true },
        { method: 'POST', path: '/api/payroll/bank-file', description: 'Generate bank file', auth: true, roles: ['admin', 'finance'] },
      ],
      'Business Rules': [
        'Payroll must be processed between 1st and 5th of each month',
        'New joiners get salary calculated from date of joining',
        'Separated employees get final settlement within 30 days',
        'PF is deducted for salary below 15,000/month',
        'ESI is deducted for salary below 21,000/month',
        'TDS is calculated based on IT declaration submitted',
      ],
    },
  },
  'recruitment-management': {
    title: 'Recruitment Management Module',
    sections: {
      Overview: 'The Recruitment Management module manages the entire hiring lifecycle from job requisition creation through offer acceptance and onboarding.',
      Features: [
        'Job requisition creation and approval',
        'Job posting on multiple platforms',
        'Candidate application tracking',
        'Resume parsing and skill extraction',
        'Interview scheduling and feedback collection',
        'Offer letter generation and tracking',
        'Candidate communication templates',
      ],
      'Data Model': {
        JobRequisition: {
          fields: {
            title: { type: 'String', required: true },
            department: { type: 'String', required: true },
            location: { type: 'String' },
            positions: { type: 'Number', required: true },
            employmentType: { type: 'String', enum: ['permanent', 'contract', 'intern'] },
            minExperience: { type: 'Number' },
            maxExperience: { type: 'Number' },
            skillsRequired: [{ type: 'String' }],
            description: { type: 'String' },
            status: { type: 'String', enum: ['draft', 'open', 'in-progress', 'closed', 'cancelled'] },
            priority: { type: 'String', enum: ['low', 'medium', 'high', 'critical'] },
            createdBy: { type: 'ObjectId', ref: 'Employee' },
            approvedBy: { type: 'ObjectId', ref: 'Employee' },
          },
        },
        Candidate: {
          fields: {
            name: { type: 'String', required: true },
            email: { type: 'String', required: true },
            phone: { type: 'String' },
            resumeUrl: { type: 'String' },
            parsedData: { type: 'Mixed' },
            skills: [{ type: 'String' }],
            experience: { type: 'Number' },
            currentCompany: { type: 'String' },
            currentDesignation: { type: 'String' },
            noticePeriod: { type: 'Number' },
            expectedSalary: { type: 'Number' },
            status: { type: 'String', enum: ['sourced', 'applied', 'screened', 'interviewed', 'offered', 'hired', 'rejected'] },
            appliedFor: { type: 'ObjectId', ref: 'JobRequisition' },
          },
        },
      },
      'API Endpoints': [
        { method: 'GET', path: '/api/recruitment/requisitions', description: 'List job requisitions', auth: true },
        { method: 'POST', path: '/api/recruitment/requisitions', description: 'Create requisition', auth: true, roles: ['admin', 'hr', 'manager'] },
        { method: 'GET', path: '/api/recruitment/candidates', description: 'List candidates', auth: true, roles: ['admin', 'hr'] },
        { method: 'POST', path: '/api/recruitment/candidates', description: 'Add candidate', auth: true, roles: ['admin', 'hr'] },
        { method: 'POST', path: '/api/recruitment/candidates/:id/parse-resume', description: 'Parse resume', auth: true, roles: ['admin', 'hr'] },
        { method: 'POST', path: '/api/recruitment/match', description: 'Match candidates to job', auth: true, roles: ['admin', 'hr'] },
        { method: 'PUT', path: '/api/recruitment/candidates/:id/status', description: 'Update candidate status', auth: true, roles: ['admin', 'hr'] },
      ],
      'Business Rules': [
        'Requisitions above 5 positions require VP approval',
        'Candidates cannot be marked hired without offer acceptance',
        'Resume parsing extracts skills, experience, and education automatically',
        'Duplicate candidates are detected by email match',
        'Offers expire after 7 days if not accepted',
      ],
    },
  },
};

const aiConfigTemplate = {
  AI_PROVIDER: 'openai',
  AI_API_KEY: '',
  AI_MODEL: 'gpt-4',
  AI_BASE_URL: 'https://api.openai.com/v1',
  AI_ENABLED: false,
  AI_MOCK_MODE: true,
  HUMAN_REVIEW_REQUIRED: true,
};

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created: ${dirPath}`);
  } else {
    console.log(`  Exists: ${dirPath}`);
  }
}

function writeSpecFile(moduleName, template) {
  const filePath = path.join(rootDir, 'specs/modules', `${moduleName}.md`);
  if (fs.existsSync(filePath)) {
    console.log(`  Skipped (exists): specs/modules/${moduleName}.md`);
    return;
  }

  const lines = [];
  lines.push(`# ${template.title}`);
  lines.push('');

  for (const [sectionName, content] of Object.entries(template.sections)) {
    lines.push(`## ${sectionName}`);
    lines.push('');

    if (typeof content === 'string') {
      lines.push(content);
      lines.push('');
    } else if (Array.isArray(content)) {
      content.forEach(item => {
        if (typeof item === 'string') {
          lines.push(`- ${item}`);
        } else if (item.method && item.path) {
          lines.push(`- \`${item.method}\` ${item.path} - ${item.description}${item.auth ? ' [Auth: Required]' : ''}${item.roles ? ` [Roles: ${item.roles.join(', ')}]` : ''}`);
        }
      });
      lines.push('');
    } else if (typeof content === 'object') {
      for (const [modelName, modelDef] of Object.entries(content)) {
        lines.push(`### ${modelName}`);
        lines.push('');
        lines.push('| Field | Type | Description |');
        lines.push('|-------|------|-------------|');
        const fields = modelDef.fields || {};
        for (const [fieldName, fieldDef] of Object.entries(fields)) {
          const typeStr = typeof fieldDef === 'object' ? JSON.stringify(fieldDef.type || fieldDef) : String(fieldDef);
          lines.push(`| ${fieldName} | ${typeStr} | ${fieldDef.description || ''} |`);
        }
        lines.push('');
      }
    }
  }

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  console.log(`  Created: specs/modules/${moduleName}.md`);
}

function setupGitHooks() {
  const gitHooksDir = path.join(rootDir, '.githooks');
  createDirectory(gitHooksDir);

  const preCommitHook = path.join(gitHooksDir, 'pre-commit');
  if (!fs.existsSync(preCommitHook)) {
    const hookContent = `#!/bin/sh
# SDD Spec Validation Hook
# Automatically validates spec files before commit

CHANGED_SPECS=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^specs/')

if [ -n "$CHANGED_SPECS" ]; then
  echo "Validating SDD spec files..."
  node scripts/validate-specs.js
  if [ $? -ne 0 ]; then
    echo "ERROR: Spec validation failed. Fix specs before committing."
    exit 1
  fi
fi
`;
    fs.writeFileSync(preCommitHook, hookContent, 'utf-8');
    console.log(`  Created: .githooks/pre-commit`);
  } else {
    console.log(`  Skipped (exists): .githooks/pre-commit`);
  }

  console.log('  Run: git config core.hooksPath .githooks');
}

function updateEnvFile() {
  const envPath = path.join(rootDir, 'server/.env');
  if (!fs.existsSync(envPath)) {
    console.log('  Skipped: server/.env not found');
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf-8');
  let updated = false;

  for (const [key, value] of Object.entries(aiConfigTemplate)) {
    if (!envContent.includes(`${key}=`)) {
      const valStr = typeof value === 'boolean' ? String(value) : String(value);
      envContent += `\n${key}=${valStr}`;
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(envPath, envContent, 'utf-8');
    console.log('  Updated: server/.env with AI configuration');
  } else {
    console.log('  Skipped: server/.env already has AI configuration');
  }
}

function initSDD() {
  console.log('Initializing SDD for ReliSoft HR...\n');

  console.log('Creating directory structure...');
  specDirStructure.forEach(dir => createDirectory(path.join(rootDir, dir)));

  console.log('\nGenerating spec templates...');
  for (const [moduleName, template] of Object.entries(moduleTemplates)) {
    writeSpecFile(moduleName, template);
  }

  console.log('\nSetting up AI configuration...');
  updateEnvFile();

  console.log('\nSetting up git hooks...');
  setupGitHooks();

  console.log('\nSDD initialization complete!');
  console.log('\nNext steps:');
  console.log('  1. Edit spec files in specs/modules/ to match your requirements');
  console.log('  2. Add AI_API_KEY to server/.env for real AI features');
  console.log('  3. Run node scripts/validate-specs.js to validate specs');
  console.log('  4. Run node scripts/generate-from-spec.js --spec=<spec-file> to generate code');
}

initSDD();
