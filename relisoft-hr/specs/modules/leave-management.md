# Leave Management Module Specification

## Overview

The Leave Management module handles all leave-related operations including leave types and policies, balance accrual, leave applications, approval workflows, and leave calendar views. It integrates with Attendance and Payroll modules for accurate salary processing.

**Scope**: Leave types, policies, balances, applications, approvals, carry-forward, encashment, attendance integration.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Leave Types | Configurable leave categories with unique rules | P0 |
| Leave Policies | Per-leave-type rules: entitlement, accrual, max carry-forward | P0 |
| Leave Application | Submit, modify, cancel leave requests | P0 |
| Leave Balance | Real-time balance with pending deductions | P0 |
| Leave Approval | Multi-level configurable approval workflow | P0 |
| Leave Calendar | Team/department leave calendar view | P0 |
| Carry Forward | Auto carry-forward of unused leave at year-end | P1 |
| Leave Encashment | Request and process leave encashment | P1 |
| Comp-off | Compensatory off for overtime work | P2 |
| Sick Leave | Medical leave with optional document attachment | P0 |
| Maternity/Paternity Leave | Statutory leave types with special rules | P0 |
| LOP (Loss of Pay) | Mark unpaid leave days | P0 |
| Holiday Clash | Handle leave overlapping with holidays | P1 |
| Team Availability | View team availability for planning | P1 |

---

## Data Model

### Leave Type Collection

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | String | Yes | — | Leave type name (Annual, Sick, Casual, etc.) |
| `code` | String | Yes | — | Unique code (ANNUAL, SICK, etc.) |
| `isPaid` | Boolean | Yes | true | Paid or unpaid |
| `isStatutory` | Boolean | No | false | Statutory leave (maternity, etc.) |
| `color` | String | Yes | — | Display color for calendar |
| `minDaysPerRequest` | Number | No | 1 | Minimum days per application |
| `maxDaysPerRequest` | Number | No | — | Maximum days per application |
| `requiresDocumentation` | Boolean | No | false | Requires medical certificate etc. |
| `allowsHalfDay` | Boolean | No | true | Half-day leave allowed |
| `genderRestriction` | Enum | No | — | Male, Female, All |
| `carryForwardAllowed` | Boolean | No | false | Can be carried forward |
| `maxCarryForward` | Number | No | 0 | Maximum days that can carry forward |
| `encashable` | Boolean | No | false | Can be encashed |
| `maxEncashment` | Number | No | 0 | Maximum encashable days |

### Leave Policy Collection (per leave type per grade/employment type)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `leaveTypeId` | ObjectId (LeaveType) | Yes | Reference to leave type |
| `applicableGrades` | Array of ObjectId (Grade) | Yes | Grades this policy applies to |
| `applicableEmploymentTypes` | Array of Enum | Yes | Employment types |
| `entitlementDays` | Number | Yes | Days credited per cycle |
| `accrualFrequency` | Enum | Yes | Monthly, Quarterly, Yearly, Upfront |
| `maxAccumulation` | Number | No | Maximum accumulated balance |
| `minServiceDays` | Number | No | Minimum service days before eligibility |
| `probationEligible` | Boolean | No | true | Allow leave during probation |
| `noticePeriodRestricted` | Boolean | No | false | Restrict during notice period |

### Leave Balance Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee reference |
| `leaveTypeId` | ObjectId (LeaveType) | Yes | Leave type reference |
| `financialYear` | String | Yes | FY (e.g., "2024-2025") |
| `openingBalance` | Number | Yes | Balance at start of year |
| `totalCredited` | Number | Yes | Total credited this year |
| `totalAvailed` | Number | Yes | Total availed this year |
| `totalEncashed` | Number | No | Total encashed this year |
| `totalLapsed` | Number | No | Total lapsed this year |
| `closingBalance` | Number | Yes | Computed: opening + credited - availed - encashed - lapsed |
| `pendingApplications` | Number | No | Days pending approval |
| `lastCreditedDate` | Date | No | Last credit date |

### Leave Application Collection

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | — | Employee reference |
| `leaveTypeId` | ObjectId (LeaveType) | Yes | — | Leave type reference |
| `fromDate` | Date | Yes | — | Leave start date |
| `toDate` | Date | Yes | — | Leave end date |
| `totalDays` | Number | Yes | — | Number of leave days |
| `isHalfDay` | Boolean | No | false | Half-day leave |
| `halfDayType` | Enum | No | — | FirstHalf, SecondHalf |
| `reason` | String | Yes | — | Leave reason |
| `contactNumber` | String | No | — | Contact during leave |
| `alternateArrangement` | String | No | — | Work coverage details |
| `documentUrls` | Array | No | [] | Supporting documents |
| `status` | Enum | Yes | Pending | Pending, Approved, Rejected, Cancelled, Withdrawn |
| `currentApprovalLevel` | Number | No | 1 | Current workflow level |
| `approvalLogs` | Array | No | [] | Approval history |
| `approvalLogs[].approverId` | ObjectId (Employee) | Yes | — | Approver |
| `approvalLogs[].action` | Enum | Yes | — | Approved, Rejected, Pending |
| `approvalLogs[].remarks` | String | No | — | Comments |
| `approvalLogs[].level` | Number | Yes | — | Approval level |
| `approvalLogs[].timestamp` | Date | Yes | — | Action time |
| `appliedOn` | Date | Yes | — | Application date |
| `cancelledOn` | Date | No | — | Cancellation date |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

---

## API Endpoints

### `GET /api/v1/leaves/types`
List all leave types.

### `POST /api/v1/leaves/types`
Create leave type (Admin only).

### `POST /api/v1/leaves/apply`
Submit leave application.

**Request Body**:
```json
{
  "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
  "leaveTypeId": "664a1b2c3d4e5f6a7b8c9d30",
  "fromDate": "2024-06-10",
  "toDate": "2024-06-12",
  "isHalfDay": false,
  "reason": "Family function",
  "contactNumber": "+91-9876543210",
  "alternateArrangement": "Handed over to Priya for coverage"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d31",
    "employeeId": {
      "_id": "664a1b2c3d4e5f6a7b8c9d0e",
      "firstName": "John",
      "lastName": "Doe",
      "employeeId": "EMP-00001"
    },
    "leaveTypeId": {
      "_id": "664a1b2c3d4e5f6a7b8c9d30",
      "name": "Annual Leave",
      "code": "ANNUAL"
    },
    "fromDate": "2024-06-10T00:00:00.000Z",
    "toDate": "2024-06-12T00:00:00.000Z",
    "totalDays": 3,
    "status": "Pending",
    "appliedOn": "2024-06-01T10:30:00.000Z",
    "balanceAfterApplication": {
      "totalCredited": 18,
      "totalAvailed": 5,
      "pendingApplications": 3,
      "availableBalance": 10
    }
  }
}
```

### `GET /api/v1/leaves/my`
Get current user's leave applications.

**Query Parameters**: status, fromDate, toDate, page, limit

### `GET /api/v1/leaves/team`
Get team members' leave applications (Manager).

### `GET /api/v1/leaves/pending-approvals`
Get pending leave approvals for the current user.

### `PUT /api/v1/leaves/:id/approve`
Approve leave application.

**Request Body**:
```json
{
  "remarks": "Approved. Ensure handover is complete."
}
```

### `PUT /api/v1/leaves/:id/reject`
Reject leave application.

**Request Body**:
```json
{
  "remarks": "Team has critical deliverable during this period. Please reschedule."
}
```

### `GET /api/v1/leaves/balance/:employeeId`
Get leave balance for an employee.

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
    "financialYear": "2024-2025",
    "balances": [
      {
        "leaveTypeId": { "_id": "...", "name": "Annual Leave", "code": "ANNUAL" },
        "openingBalance": 15,
        "totalCredited": 18,
        "totalAvailed": 8,
        "pendingApplications": 3,
        "availableBalance": 10,
        "encashableBalance": 5
      },
      {
        "leaveTypeId": { "_id": "...", "name": "Sick Leave", "code": "SICK" },
        "openingBalance": 12,
        "totalCredited": 12,
        "totalAvailed": 2,
        "pendingApplications": 0,
        "availableBalance": 10,
        "encashableBalance": 0
      },
      {
        "leaveTypeId": { "_id": "...", "name": "Casual Leave", "code": "CASUAL" },
        "openingBalance": 8,
        "totalCredited": 8,
        "totalAvailed": 4,
        "pendingApplications": 1,
        "availableBalance": 4,
        "encashableBalance": 0
      }
    ],
    "totalLeavesTaken": 14,
    "totalLeavesRemaining": 24
  }
}
```

### `GET /api/v1/leaves/calendar?departmentId=&month=2024-06`
Get leave calendar for a department.

### `POST /api/v1/leaves/:id/cancel`
Cancel leave application.

### `POST /api/v1/leaves/encashment`
Request leave encashment.

### `GET /api/v1/leaves/reports/monthly?month=2024-05`
Monthly leave report.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `LeaveDashboard` | Overview with balance cards, pending approvals, upcoming leaves |
| `LeaveBalanceCard` | Visual balance indicator per leave type (used/remaining) |
| `LeaveApplicationForm` | Form with date picker, type selector, reason, document upload |
| `LeaveCalendar` | Team calendar overlay showing who is on leave |
| `LeaveApprovalQueue` | Approval list with action buttons |
| `LeaveHistoryTable` | Sortable/filterable leave history |
| `LeavePolicyConfigurator` | Admin UI to configure leave types and policies |
| `EncashmentRequestForm` | Encashment request with balance display |
| `HolidayCalendar` | Combined holiday + leave calendar view |
| `TeamAvailabilityView` | Week/month grid showing available team members |

---

## Business Rules

1. **Balance Validation**: Cannot apply if insufficient balance (after deducting pending applications)
2. **Minimum Notice**: Annual leave requires minimum 3 days advance notice (configurable)
3. **Consecutive Leave**: Leaves of same type or different types are combined if dates are contiguous
4. **Weekend/Holiday Handling**: Weekends and holidays within leave period are NOT counted as leave days
5. **Max Continuous Leave**: Cannot apply for >15 continuous days (except medical/maternity)
6. **Approval Escalation**: Auto-escalate to next level if pending >48 hours (configurable)
7. **Leave During Notice**: Leave restricted during notice period; requires HR approval
8. **Probation Restriction**: Probationers may have limited leave types available
9. **Accrual Schedule**: Leaves credited on 1st of every month (for monthly accrual) or upfront on Apr 1
10. **Leave Cancellation**: Can cancel only if start date >24 hours away; admin can cancel anytime
11. **No Negative Balance**: System enforces non-negative balance; if insufficient balance, auto-LOP for excess days
12. **Team Coverage**: At least one member per role must be present; system warns if all team members apply on same dates

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Leave Pattern Prediction | Predictor | Predict peak leave periods and suggest coverage |
| Smart Approval | Assistant | Recommend approval/rejection based on team workload |
| Leave Reason Analysis | Analyzer | Flag unusual leave patterns (potential absenteeism) |
| Holiday Impact Analysis | Analyzer | Suggest optimal leave dates around holidays |
| Auto-Response | Chatbot | Answer leave balance queries, initiate leave application via chat |

---

## Permissions

| Role | Apply | View Own | View Team | View All | Approve Team | Approve Any | Configure Policies |
|------|-------|----------|-----------|----------|--------------|-------------|-------------------|
| SuperAdmin | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| HR | Yes | Yes | Yes | Yes | No | Yes | Yes |
| Manager | Yes | Yes | Yes | No | Yes | No | No |
| Employee | Yes | Yes | No | No | No | No | No |
