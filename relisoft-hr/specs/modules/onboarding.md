# Onboarding Module Specification

## Overview

The Onboarding module manages the new hire onboarding process from offer acceptance through Day 1 and first 90 days. It includes pre-onboarding tasks, document collection, background verification, IT setup coordination, asset allocation, and structured onboarding plans.

**Scope**: Pre-onboarding checklist, document collection, BGV, IT setup, asset management, onboarding plan, buddy assignment, orientation, feedback collection.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Pre-onboarding Portal | Candidate-facing portal for document upload and form filling | P0 |
| Onboarding Checklist | Configurable checklist of tasks per role/location | P0 |
| Document Collection | Upload and verify identity, education, experience documents | P0 |
| Background Verification | Initiate and track BGV process | P0 |
| IT Setup Automation | Trigger IT account creation, email, system access | P1 |
| Asset Allocation | Allocate laptop, peripherals, access cards | P1 |
| Buddy Assignment | Auto-assign onboarding buddy based on role | P1 |
| Orientation Schedule | Configure and manage induction programs | P1 |
| Onboarding Plan | 30-60-90 day plan with milestones | P1 |
| Onboarding Feedback | Collect feedback at 30/60/90 day milestones | P2 |

---

## Data Model

### Onboarding Record Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicantId` | ObjectId (Applicant) | No | Source applicant (from recruitment) |
| `employeeId` | ObjectId (Employee) | Yes | New employee record |
| `offerId` | ObjectId (Offer) | No | Offer reference |
| `joiningDate` | Date | Yes | Scheduled joining date |
| `status` | Enum | Yes | NotStarted, PreOnboarding, InProgress, Completed, Rescheduled, Cancelled |
| `preOnboardingComplete` | Boolean | No | Pre-joining tasks done |
| `onboardingPlanId` | ObjectId (Plan) | No | Assigned onboarding plan |

### Onboarding Task Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `onboardingId` | ObjectId (Onboarding) | Yes | Parent record |
| `taskName` | String | Yes | Task name |
| `category` | Enum | Yes | Document, ITSetup, HR, Admin, Orientation, Training |
| `assignedTo` | ObjectId (Employee) | Yes | Task owner |
| `assignedDepartment` | String | No | IT, HR, Admin, Finance |
| `dueDate` | Date | Yes | Task deadline |
| `completedDate` | Date | No | Completion date |
| `status` | Enum | Yes | Pending, InProgress, Completed, Skipped, Overdue |
| `notes` | String | No | Task notes |
| `dependencies` | Array of ObjectId | No | Prerequisite tasks |

### BGV Record Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `onboardingId` | ObjectId (Onboarding) | Yes | Parent record |
| `vendorName` | String | No | BGV vendor |
| `vendorReferenceId` | String | No | Vendor reference |
| `checkTypes` | Array of Enum | Yes | Address, Education, Employment, Criminal, Reference, DrugTest |
| `initiatedDate` | Date | Yes | BGV start date |
| `completedDate` | Date | No | Completion date |
| `status` | Enum | Yes | Pending, InProgress, Clear, IssueFound, Disputed |
| `reportUrl` | String | No | BGV report document |
| `remarks` | String | No | HR remarks |

---

## API Endpoints

### `POST /api/v1/onboarding/initiate`
Initiate onboarding from accepted offer.

### `GET /api/v1/onboarding/:employeeId`
Get onboarding status and task list.

### `PUT /api/v1/onboarding/tasks/:id`
Update task status.

### `POST /api/v1/onboarding/documents`
Upload document.

### `GET /api/v1/onboarding/checklist`
Get pre-onboarding checklist template.

### `GET /api/v1/onboarding/pending-it-setup`
IT setup pending queue.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `OnboardingDashboard` | HR view of all active onboardings |
| `PreOnboardingPortal` | Candidate-facing task list and document upload |
| `OnboardingProgressBar` | Visual progress indicator |
| `TaskAssignmentPanel` | Assign tasks to departments |
| `ITSetupRequestForm` | Auto-generated ticket for IT department |
| `BGVTracker` | BGV status monitoring |
| `BuddyAssignmentWidget` | Assign onboarding buddy |
| `OnboardingPlanViewer` | 30-60-90 day plan display |

---

## Business Rules

1. All pre-onboarding documents must be submitted 5 days before joining
2. BGV must be initiated within 3 days of offer acceptance
3. IT setup request triggered automatically 3 days before joining
4. Employee record is created after joining date confirmation
5. Onboarding buddy must be same role/department and >1 year tenure

---

## Permissions

| Role | Actions |
|------|---------|
| HR | Full CRUD, assign tasks, manage BGV |
| Manager | View team onboarding progress |
| IT | View/receive IT setup tasks |
| Employee (new hire) | View pre-onboarding tasks, upload docs |
