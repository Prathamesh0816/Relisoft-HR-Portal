# Separation Management Module Specification

## Overview

The Separation module manages employee exits including resignation, termination, retirement, and the complete clearance process. It integrates with Asset Management, Finance, IT, and Document Management for seamless offboarding.

**Scope**: Resignation, acceptance/rejection, notice period tracking, exit interviews, clearance checklist, final settlement.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Resignation | Employee submits resignation with reason and LWD | P0 |
| Separation Types | Resignation, Termination, Retirement, Abandonment, Death | P0 |
| Notice Period Tracking | Track notice period, buyout, waiver | P0 |
| Clearance Checklist | Multi-department clearance process | P0 |
| Exit Interview | Collect exit feedback and reason | P1 |
| FnF Trigger | Auto-initiate Full & Final settlement | P0 |
| Counter Offer | Process counter offer if applicable | P1 |

---

## Data Model

### Separation Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `separationType` | Enum | Yes | Resignation, Termination, Retirement, Abandonment, Death, Mutual |
| `submittedDate` | Date | Yes | Resignation date |
| `reason` | String | Yes | Reason for leaving |
| `reasonCategory` | Enum | No | CareerGrowth, Compensation, Personal, Relocation, Health, Retirement, Others |
| `lastWorkingDate` | Date | Yes | Employee's proposed LWD |
| `approvedLastWorkingDate` | Date | No | Approved LWD |
| `noticePeriodDays` | Number | Yes | Notice period as per contract |
| `noticePeriodStart` | Date | Yes | Notice period start |
| `noticePeriodEnd` | Date | Yes | Notice period end |
| `noticeBuyoutAmount` | Number | No | Buyout amount if waived |
| `noticeWaived` | Boolean | No | Notice waived |
| `status` | Enum | Yes | Submitted, UnderReview, CounterOffered, Approved, Rejected, Withdrawn, Completed |
| `exitInterviewDone` | Boolean | No | Interview completed |
| `clearanceStatus` | Enum | No | NotStarted, InProgress, Completed |
| `isEligibleForRehire` | Boolean | No | Rehire eligibility |
| `approvedBy` | ObjectId (Employee) | No | Approver |

### Clearance Checklist Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `separationId` | ObjectId (Separation) | Yes | Separation reference |
| `department` | Enum | Yes | IT, Admin, Finance, HR, Operations |
| `task` | String | Yes | Clearance task |
| `assignedTo` | ObjectId (Employee) | Yes | Department representative |
| `status` | Enum | Yes | Pending, Cleared, NotApplicable |
| `clearedDate` | Date | No | Cleared on |
| `remarks` | String | No | Remarks |

---

## API Endpoints

### `POST /api/v1/separation/resign`
Submit resignation.

**Request Body**:
```json
{
  "reason": "Relocating to another city for family reasons",
  "reasonCategory": "Relocation",
  "lastWorkingDate": "2024-07-31",
  "comments": "I have really enjoyed my time at ReliSoft. Requesting to relieve me on July 31."
}
```

### `GET /api/v1/separation/my`
Get my separation status.

### `GET /api/v1/separation/pending`
Pending separation requests (HR/Manager view).

### `PUT /api/v1/separation/:id/approve`
Approve separation.

### `PUT /api/v1/separation/:id/counter-offer`
Initiate counter offer.

### `GET /api/v1/separation/:id/clearance`
Get clearance checklist.

### `PUT /api/v1/separation/clearance/:id/clear`
Mark clearance task complete.

### `POST /api/v1/separation/:id/exit-interview`
Submit exit interview.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `ResignationForm` | Separation type selection, reason, LWD |
| `SeparationTracker` | Real-time status of clearance progress |
| `ClearanceChecklist` | Department-by-department clearance view |
| `ExitInterviewForm` | Structured questionnaire with ratings |
| `NoticePeriodCalculator` | Automatic LWD calculation based on leave balance |
| `SeparationDashboard` | Active separations, clearance overdue alerts |

---

## Business Rules

1. Notice period as per employment contract; unserved days deducted from settlement
2. Clearance must be obtained from all departments before FnF processing
3. Exit interview must be completed before LWD; optional for terminated employees
4. Counter offer auto-rejects resignation; employee has 7 days to respond
5. Garden leave: employee may be asked to serve notice from home (for sensitive roles)
6. Non-compete and NDA reminders sent during separation
7. Rehire eligibility determined based on separation reason and performance

---

## Permissions

| Role | Actions |
|------|---------|
| SuperAdmin | Full |
| Admin | Full |
| HR | Manage all separations, exit interviews, clearance |
| Manager | View team separations, approve/reject, counter offer |
| Employee | Submit resignation, view own status, exit interview |
