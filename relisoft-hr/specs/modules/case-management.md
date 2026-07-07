# Case Management (Employee Relations) Module Specification

## Overview

The Case Management module handles employee relations cases including grievances, disciplinary actions, investigations, and conflict resolution. It provides a structured workflow with confidentiality controls and audit trails.

**Scope**: Grievance filing, investigation management, disciplinary proceedings, resolution tracking, case analytics.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Grievance Filing | Confidential employee grievance submission | P0 |
| Case Classification | Categorize cases (Harassment, Discrimination, Policy Violation, Conflict) | P0 |
| Investigation Tracking | Assign investigators, track findings | P0 |
| Disciplinary Workflow | Warning, suspension, termination proceedings | P0 |
| Document Evidence | Upload and manage case documents | P1 |
| Case Resolution | Resolution notes, closure, follow-up | P0 |
| Confidentiality Controls | Role-based access to sensitive cases | P0 |
| Case Analytics | Case volume, resolution time, trends | P1 |

---

## Data Model

### Case Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `caseNumber` | String | Yes | Auto-generated (CAS-XXXXX) |
| `title` | String | Yes | Case title |
| `type` | Enum | Yes | Grievance, Disciplinary, Investigation, Conflict, Whistleblower |
| `category` | Enum | Yes | Harassment, Discrimination, PolicyViolation, Misconduct, Performance, Attendance, Others |
| `severity` | Enum | Yes | Low, Medium, High, Critical |
| `reportedBy` | ObjectId (Employee) | Yes | Reporter (anonymous if flag set) |
| `reportedEmployee` | ObjectId (Employee) | No | Employee being reported |
| `description` | String | Yes | Case details |
| `status` | Enum | Yes | Open, UnderInvestigation, PendingDecision, Resolved, Closed, Dismissed |
| `assignedInvestigator` | ObjectId (Employee) | No | Investigator |
| `priority` | Enum | Yes | Low, Medium, High, Urgent |
| `findings` | String | No | Investigation findings |
| `resolution` | String | No | Resolution details |
| `action` | Enum | No | VerbalWarning, WrittenWarning, Suspension, Termination, Training, NoAction |
| `confidential` | Boolean | Yes | Confidentiality flag |
| `allowAnonymous` | Boolean | No | Allow anonymous reporting |
| `documents` | Array | No | Evidence documents |
| `timeline` | Array | No | Case activity timeline |
| `resolvedAt` | Date | No | Resolution date |
| `resolvedBy` | ObjectId (Employee) | No | Resolver |

---

## API Endpoints

### `POST /api/cases`
File new case.

### `GET /api/cases`
List cases (role-based visibility).

### `GET /api/cases/:id`
Get case details.

### `PUT /api/cases/:id`
Update case.

### `PUT /api/cases/:id/assign`
Assign investigator.

### `PUT /api/cases/:id/resolve`
Resolve case.

### `POST /api/cases/:id/documents`
Upload evidence.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `CaseFilingForm` | Confidential grievance submission form |
| `CaseListView` | Role-filtered case list with severity indicators |
| `CaseDetailPanel` | Full case view with timeline, documents, actions |
| `InvestigationWorkspace` | Investigator workspace with findings log |
| `DisciplinaryActionPanel` | Action selection with policy references |
| `CaseAnalyticsDashboard` | Volume, trends, resolution SLA metrics |

---

## Permissions

| Role | Create | View | Investigate | Resolve | View All Confidential |
|------|--------|------|-------------|---------|----------------------|
| SuperAdmin | Yes | All | Yes | Yes | Yes |
| Admin | Yes | All | Yes | Yes | Yes |
| HR (ER) | Yes | All | Yes | Yes | Yes |
| Investigator | No | Assigned | Yes | No | Assigned only |
| Manager | Yes | Own team | No | No | No |
| Employee | Yes | Own | No | No | No |
