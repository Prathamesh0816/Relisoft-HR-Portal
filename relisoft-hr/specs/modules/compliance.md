# Compliance Management Module Specification

## Overview

The Compliance module tracks statutory and regulatory compliance requirements including labour law filings, statutory registers, license renewals, and audit management. It ensures the organization meets all legal obligations.

**Scope**: Statutory registers, labour law compliance, license tracking, audit management, regulatory filings, compliance calendar.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Statutory Registers | Maintain statutory registers (Attendance, wages, etc.) | P0 |
| Labour Law Compliance | Factory Act, Shops & Establishments, Contract Labour | P0 |
| License Tracking | Track business licenses and renewals | P1 |
| Compliance Calendar | Key compliance due dates and reminders | P0 |
| Audit Management | Internal/external compliance audit tracking | P1 |
| Regulatory Filing | Generate compliance reports for authorities | P1 |
| POSH Compliance | Sexual harassment policy and committee tracking | P1 |

---

## Data Model

### Compliance Record Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `complianceType` | Enum | Yes | PF, ESI, PT, TDS, LWF, Bonus, Gratuity, ShopsAndEstablishment, FactoryAct, ContractLabour, POSH, Others |
| `description` | String | Yes | Description |
| `frequency` | Enum | Yes | Monthly, Quarterly, HalfYearly, Yearly, OneTime |
| `dueDate` | Date | Yes | Next due date |
| `completedDate` | Date | No | Last completed |
| `status` | Enum | Yes | Upcoming, Due, Overdue, Completed, Filed |
| `assignedTo` | ObjectId (Employee) | Yes | Responsible person |
| `notes` | String | No | Notes |
| `referenceNumber` | String | No | Filing reference |
| `documentUrls` | Array | No | Filed documents |

### License Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | License name |
| `authority` | String | Yes | Issuing authority |
| `licenseNumber` | String | Yes | License number |
| `issueDate` | Date | Yes | Issue date |
| `expiryDate` | Date | Yes | Expiry date |
| `reminderDays` | Number | No | Days before expiry to remind |
| `status` | Enum | Yes | Active, Expiring, Expired, Renewed |
| `documentUrl` | String | No | License document |

---

## API Endpoints

### `GET /api/v1/compliance`
List compliance records.

### `POST /api/v1/compliance`
Add compliance record.

### `PUT /api/v1/compliance/:id/complete`
Mark as completed/filed.

### `GET /api/v1/compliance/licenses`
List licenses.

### `POST /api/v1/compliance/licenses`
Add license.

### `GET /api/v1/compliance/calendar`
Compliance calendar with due dates.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `ComplianceDashboard` | Overview of compliance status, overdue items |
| `ComplianceCalendar` | Annual calendar with due dates |
| `LicenseTracker` | License expiry monitoring |
| `StatutoryRegisterViewer` | Generate and view statutory register reports |
| `AuditManagementPanel` | Audit schedule, findings, closure tracking |
| `POSHCommitteeDashboard` | Committee members, cases, training status |

---

## Business Rules

1. Auto-reminder at 30, 15, 7, 1 day(s) before compliance due date
2. Escalation to compliance head if overdue by 7 days
3. Expired license auto-blocks related operations (e.g., expired factory license blocks shift creation)
4. Statutory registers generated monthly and stored for minimum 5 years
5. POSH training mandatory for all employees annually; completion tracked

---

## Permissions

| Role | View | Create | Edit | File | Delete |
|------|------|--------|------|------|--------|
| SuperAdmin | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes |
| HR (Compliance) | Yes | Yes | Yes | Yes | Yes |
| HR (General) | Read | No | No | No | No |
| Manager | Read | No | No | No | No |
