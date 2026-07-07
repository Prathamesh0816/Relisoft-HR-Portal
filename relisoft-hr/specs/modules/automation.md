# Automation Module Specification

## Overview

The Automation module provides intelligent automation capabilities including AI chatbot, scheduled reminders, document auto-generation, OCR processing, and rule-based automation across all HR modules.

**Scope**: AI chatbot, scheduled reminders and notifications, document auto-generation, OCR for document processing, business rule automation, auto-approvals.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| AI Chatbot | Natural language HR assistant for employees | P0 |
| Smart Reminders | Configurable reminders for events and deadlines | P0 |
| Document Auto-Generation | Auto-generate documents on lifecycle events | P1 |
| OCR Processing | Extract data from uploaded documents | P1 |
| Rule Engine | Configurable business rules with auto-actions | P1 |
| Auto-Approvals | Automatic approval for low-risk requests | P2 |
| Scheduled Jobs | Cron-based job scheduling | P0 |
| Event Triggers | Trigger automation on domain events | P1 |

---

## Automation Rules

| Trigger | Condition | Action | Module |
|---------|-----------|--------|--------|
| Employee Created | Always | Auto-generate welcome email | Onboarding |
| Employee Created | Always | Create IT setup ticket | Helpdesk |
| Leave Applied | Balance >= requested days | Auto-approve (if enabled) | Leave |
| Leave Applied | Balance < requested days | Route to manager | Leave |
| Attendance Missing | No punch by 11 AM | Send reminder notification | Attendance |
| Attendance Missing | 3 consecutive absences | Alert HR | Attendance |
| Ticket Created | Priority = Critical | Auto-assign to senior agent | Helpdesk |
| Ticket Created | Category = IT + New Hire | Route to IT onboarding group | Helpdesk |
| Document Expiry | 30 days before expiry | Send renewal reminder | Documents |
| Separation Approved | Always | Trigger clearance process | Separation |
| Separation Approved | Always | Disable M365 account | Integration |
| Payroll Month | 25th of month | Send payslip generation reminder | Payroll |
| Certificate Expiry | 90 days before expiry | Send renewal reminder | Training |
| Performance Review | Phase start date | Send notification to employees | Performance |

---

## Chatbot Intents

| Intent | Description | Response |
|--------|-------------|----------|
| Leave Balance | "How many leaves do I have?" | Fetch and display leave balance |
| Apply Leave | "I want to apply for leave" | Initiate leave application flow |
| Pay Slip | "Show my last payslip" | Fetch and display payslip |
| Attendance | "Am I marked present today?" | Show today's attendance status |
| Holiday List | "List upcoming holidays" | Fetch holiday calendar |
| Policy Query | "What is the notice period?" | Return policy information |
| Ticket Status | "Where is my IT ticket?" | Show ticket status |
| Team Leave | "Who is on leave today?" | Show team members on leave |
| Apply Expense | "I need to claim an expense" | Initiate expense claim flow |
| Recognition | "I want to recognize a colleague" | Initiate recognition form |
| Separation | "How do I resign?" | Provide resignation process info |
| Training | "What trainings are available?" | Show available training courses |
| HR Help | "I need help with..." | Route to helpdesk ticket creation |

---

## Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| Daily Attendance Sync | Every 5 min (work hours) | Sync biometric data |
| Nightly Payroll Check | 2:00 AM daily | Check for pending payroll actions |
| Leave Accrual | 1st of every month | Credit monthly leave balances |
| Compliance Reminder | 8:00 AM daily | Check and send compliance reminders |
| Session Cleanup | 3:00 AM daily | Clean expired sessions |
| Report Generation | As scheduled | Generate and email scheduled reports |
| Backup Database | 1:00 AM daily | Automated database backup |
| Sync M365 | Every 15 min | Sync user changes with Azure AD |

---

## API Endpoints

### `POST /api/v1/automation/rules`
Create automation rule.

**Request Body**:
```json
{
  "name": "Auto-approve leave for managers",
  "trigger": { "event": "leave.applied", "module": "leave" },
  "conditions": [
    { "field": "employee.designation.level", "operator": "gte", "value": 5 },
    { "field": "leave.totalDays", "operator": "lte", "value": 3 }
  ],
  "actions": [
    { "type": "auto_approve", "params": { "notify": true } }
  ],
  "isActive": true
}
```

### `GET /api/v1/automation/rules`
List automation rules.

### `POST /api/v1/automation/chatbot/query`
Query the AI chatbot.

**Request Body**:
```json
{
  "employeeId": "664...",
  "message": "How many annual leaves do I have remaining?",
  "conversationId": "conv_abc123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "You have 10 annual leave days remaining out of 18 credited for FY 2024-2025. You also have 3 pending applications that will be deducted upon approval.",
    "intent": "leave_balance_query",
    "confidence": 0.97,
    "suggestions": ["Apply for leave", "View leave policy", "Check leave history"],
    "data": {
      "leaveType": "Annual Leave",
      "remaining": 10,
      "pending": 3,
      "total": 18
    }
  }
}
```

### `POST /api/v1/automation/ocr`
Process document with OCR.

### `GET /api/v1/automation/jobs`
List scheduled jobs.

### `POST /api/v1/automation/jobs/trigger/:jobName`
Manually trigger a scheduled job.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `ChatbotWidget` | Floating chat widget integrated into ESS |
| `ChatbotAnalytics` | Query volume, intent distribution, satisfaction |
| `RuleEngineBuilder` | Visual if-this-then-that rule builder |
| `ScheduledJobManager` | View and trigger scheduled jobs |
| `OCRPreviewModal` | Preview extracted data from uploaded documents |
| `ReminderConfigPanel` | Create and manage reminders |
| `AutomationDashboard` | Overview of all automation rules and their triggers |
| `ApprovalRuleConfig` | Configure auto-approval thresholds (by amount, level, etc.) |

---

## Business Rules

1. Chatbot responses include disclaimer: "This is an AI-generated response. Please verify with HR for critical matters."
2. Auto-approval only for low-risk items (leave < 3 days, expense < ₹5,000)
3. All automation actions logged with before/after state for audit
4. OCR accuracy below 90% requires human verification
5. Scheduled jobs can be disabled per environment
6. Automation rules evaluated in priority order: highest priority rule fires first
7. If multiple rules match, all actions execute (unless rule is marked "exclusive")

---

## AI Integration

This module IS the AI integration hub. All AI services described in `ai/ai-integration.md` are orchestrated through this module's chatbot, automation engine, and event triggers.

---

## Permissions

| Role | Chatbot | Rules | Jobs | OCR | Config |
|------|---------|-------|------|-----|--------|
| SuperAdmin | Full | Full | Full | Full | Full |
| Admin | Full | Full | Full | Full | Yes |
| HR | Full | Read/Create | View | Yes | No |
| IT Admin | Full | No | Full | No | Yes |
| Manager | Full | Read | View | No | No |
| Employee | Full | No | No | No | No |
