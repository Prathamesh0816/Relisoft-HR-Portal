# Shift Management Module Specification

## Overview

The Shift Management module handles shift definition, roster planning, shift assignment, shift swaps, and attendance integration. It supports flexible shift patterns including fixed shifts, rotating shifts, split shifts, and flexible timing.

**Scope**: Shift templates, roster planning, shift assignment, shift swap requests, shift attendance integration.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Shift Templates | Define shift types: General, Night, Split, Flexible | P0 |
| Shift Rostering | Weekly/monthly roster creation | P0 |
| Bulk Assignment | Assign shifts to teams/departments in bulk | P1 |
| Shift Swap | Employee-initiated shift swap with approval | P1 |
| Roster Calendar | Team/department roster view | P0 |
| Roster Templates | Reusable roster patterns | P1 |
| Shift Compliance | Check minimum rest hours between shifts | P2 |

---

## Data Model

### Shift Template Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Shift name (General, Night, etc.) |
| `code` | String | Yes | Unique code |
| `startTime` | String | Yes | Start time (HH:mm) |
| `endTime` | String | Yes | End time (HH:mm) |
| `gracePeriod` | Number | No | Late grace minutes |
| `halfDayHours` | Number | No | Hours for half-day |
| `fullDayHours` | Number | No | Hours for full day |
| `breakDuration` | Number | No | Break minutes |
| `type` | Enum | Yes | Fixed, Rotating, Split, Flexible |
| `applicableDepartments` | Array of ObjectId | No | Department scope |

### Roster Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `shiftId` | ObjectId (ShiftTemplate) | Yes | Assigned shift |
| `date` | Date | Yes | Date |
| `assignedBy` | ObjectId (User) | Yes | Who assigned |
| `isSwap` | Boolean | No | Swapped shift |
| `swapRequestId` | ObjectId | No | Swap reference |

### Shift Swap Request Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requestorId` | ObjectId (Employee) | Yes | Swap initiator |
| `targetId` | ObjectId (Employee) | Yes | Swap partner |
| `date` | Date | Yes | Swap date |
| `currentShiftId` | ObjectId (ShiftTemplate) | Yes | Current shift |
| `requestedShiftId` | ObjectId (ShiftTemplate) | Yes | Requested shift |
| `reason` | String | Yes | Reason |
| `status` | Enum | Yes | Pending, Approved, Rejected |
| `approvedBy` | ObjectId (Employee) | No | Approver |

---

## API Endpoints

### `GET /api/v1/shifts/templates`
List shift templates.

### `POST /api/v1/shifts/roster/bulk`
Bulk create/edit roster.

**Request Body**:
```json
{
  "departmentId": "664a1b2c3d4e5f6a7b8c9d0f",
  "fromDate": "2024-07-01",
  "toDate": "2024-07-07",
  "assignments": [
    { "employeeId": "...", "shiftId": "shift_gen", "dates": ["2024-07-01", "2024-07-02"] },
    { "employeeId": "...", "shiftId": "shift_ngt", "dates": ["2024-07-01"] }
  ]
}
```

### `GET /api/v1/shifts/roster/:employeeId?from=&to=`
Get employee roster.

### `POST /api/v1/shifts/swaps`
Submit shift swap request.

### `PUT /api/v1/shifts/swaps/:id/approve`
Approve shift swap.

---

## Business Rules

1. Minimum 12 hours gap between end of one shift and start of next
2. Night shift (ending after 11 PM) followed by next day off
3. Shift swaps require manager approval; peer-to-peer only within same department
4. No more than 6 consecutive night shifts

---

## UI Components

| Component | Description |
|-----------|-------------|
| `RosterGrid` | Weekly view grid with color-coded shifts |
| `ShiftTemplateForm` | Create/edit shift definitions |
| `BulkRosterUpload` | CSV upload for large teams |
| `SwapRequestPanel` | Employee swap request and approval |
| `RosterComplianceView` | Rest period alerts |
