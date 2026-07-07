# Attendance Module Specification

## Overview

The Attendance module manages employee time tracking including punch in/out, daily attendance records, overtime calculation, late/early rules, and attendance regularization. It integrates with the Payroll module for salary calculation and the Shift module for roster-based attendance.

**Scope**: Daily attendance marking, biometric integration, manual entry, overtime, lateness tracking, regularization requests, attendance reports.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Punch In/Out | Clock in/out via biometric, web, mobile app | P0 |
| Attendance Log | Daily record with first punch, last punch, total hours | P0 |
| Late/Early Tracking | Configurable late arrival and early departure rules | P0 |
| Overtime Calculation | Automatic OT calculation based on configured rules | P1 |
| Missing Punch | Mark missing punch-ins or punch-outs | P1 |
| Attendance Regularization | Employee request to correct attendance records | P1 |
| Geo-fencing | Location-based attendance for remote/field employees | P2 |
| Auto Clock-out | Auto clock-out after max working hours | P2 |
| Attendance Reports | Daily/ monthly attendance, late list, OT report | P0 |
| Biometric Integration | Integration with biometric devices (RFID, fingerprint, face) | P1 |
| Web Check-in | QR code based check-in via web interface | P1 |
| Grace Period | Configurable grace period for late arrivals | P0 |
| Half-Day Rules | Auto half-day marking based on minimum hours | P0 |

---

## Data Model

### Attendance Record Collection

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | — | Employee reference |
| `date` | Date | Yes | — | Attendance date |
| `dayType` | Enum | Yes | Weekday | Weekday, Weekend, Holiday |
| `shiftId` | ObjectId (Shift) | No | — | Assigned shift for the day |
| `punchIn` | DateTime | No | — | First punch time |
| `punchOut` | DateTime | No | — | Last punch time |
| `totalHours` | Number | No | — | Total hours worked |
| `netWorkingHours` | Number | No | — | Total minus break hours |
| `breakDuration` | Number | No | — | Total break time in minutes |
| `status` | Enum | Yes | Absent | Present, Absent, HalfDay, Late, Holiday, OnLeave, WeekOff |
| `lateMinutes` | Number | No | 0 | Minutes late after shift start |
| `earlyMinutes` | Number | No | 0 | Minutes early before shift end |
| `overtimeMinutes` | Number | No | 0 | OT minutes (approved) |
| `overtimeEligible` | Boolean | No | false | Whether OT is eligible |
| `isRegularized` | Boolean | No | false | Regularized via request |
| `regularizationId` | ObjectId (Regularization) | No | — | Linked regularization request |
| `attendanceSource` | Enum | Yes | Biometric | Biometric, Web, Mobile, Manual, API |
| `deviceId` | String | No | — | Device identifier |
| `ipAddress` | String | No | — | IP address of check-in |
| `geoLocation` | Object | No | — | GPS coordinates |
| `geoLocation.latitude` | Number | No | — | Latitude |
| `geoLocation.longitude` | Number | No | — | Longitude |
| `geoLocation.address` | String | No | — | Resolved address |
| `punches` | Array | No | [] | All punch events |
| `punches[].time` | DateTime | Yes | — | Punch timestamp |
| `punches[].type` | Enum | Yes | In | In, Out, BreakIn, BreakOut |
| `punches[].source` | Enum | Yes | — | Source device/method |
| `punches[].deviceId` | String | No | — | Device identifier |
| `remarks` | String | No | — | Notes |
| `createdBy` | ObjectId (User) | Yes | — | Creator |
| `updatedBy` | ObjectId (User) | Yes | — | Last updater |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

### Regularization Request Collection

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | — | Employee reference |
| `attendanceDate` | Date | Yes | — | Date to regularize |
| `currentPunchIn` | DateTime | No | — | Current recorded punch-in |
| `currentPunchOut` | DateTime | No | — | Current recorded punch-out |
| `requestedPunchIn` | DateTime | No | — | Requested correction |
| `requestedPunchOut` | DateTime | No | — | Requested correction |
| `reason` | String | Yes | — | Reason for regularization |
| `status` | Enum | Yes | Pending | Pending, Approved, Rejected |
| `reviewedBy` | ObjectId (Employee) | No | — | Approver |
| `reviewedAt` | Date | No | — | Review timestamp |
| `reviewerRemarks` | String | No | — | Approver comments |

### Overtime Request Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee reference |
| `date` | Date | Yes | OT date |
| `otStartTime` | DateTime | Yes | OT start |
| `otEndTime` | DateTime | Yes | OT end |
| `totalOTMinutes` | Number | Yes | Total OT minutes |
| `otType` | Enum | Yes | Weekday, Weekend, Holiday |
| `reason` | String | Yes | Reason for overtime |
| `status` | Enum | Yes | Pending, Approved, Rejected |
| `approvedOTMinutes` | Number | No | Approved OT amount |
| `approvedBy` | ObjectId (Employee) | No | Approver |

---

## API Endpoints

### `POST /api/v1/attendance/punch`
Record a punch event.

**Request Body**:
```json
{
  "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
  "type": "In",
  "source": "Web",
  "deviceId": "web-qr-scanner-01",
  "geoLocation": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "ReliSoft Office, Bangalore"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "punchId": "664a1b2c3d4e5f6a7b8c9d20",
    "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
    "punchTime": "2024-05-20T09:05:00.000Z",
    "punchType": "In",
    "totalHoursToday": null,
    "status": "Late",
    "lateMinutes": 5
  }
}
```

### `GET /api/v1/attendance/:employeeId?date=2024-05-20`
Get attendance for a specific employee and date.

### `GET /api/v1/attendance/monthly/:employeeId?month=2024-05&year=2024`
Get monthly attendance summary.

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
    "month": "May",
    "year": 2024,
    "summary": {
      "present": 20,
      "absent": 2,
      "halfDay": 1,
      "late": 3,
      "holiday": 1,
      "weekOff": 4,
      "onLeave": 2
    },
    "totalHoursWorked": 176,
    "totalOvertimeMinutes": 240,
    "records": [
      {
        "date": "2024-05-01",
        "dayType": "Weekday",
        "punchIn": "09:02",
        "punchOut": "18:05",
        "totalHours": 9.05,
        "status": "Present",
        "lateMinutes": 2,
        "overtimeMinutes": 0
      }
    ]
  }
}
```

### `POST /api/v1/attendance/regularize`
Submit regularization request.

### `GET /api/v1/attendance/regularize/my`
Get employee's regularization requests.

### `GET /api/v1/attendance/regularize/pending`
Get pending regularization requests (for HR/Manager).

### `PUT /api/v1/attendance/regularize/:id`
Approve/reject regularization request.

### `POST /api/v1/attendance/overtime`
Submit overtime request.

### `GET /api/v1/attendance/reports/daily?date=2024-05-20`
Daily attendance report.

### `GET /api/v1/attendance/reports/monthly?month=2024-05`
Monthly attendance report.

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2024-05-20",
    "totalEmployees": 150,
    "present": 135,
    "absent": 10,
    "onLeave": 5,
    "late": 8,
    "halfDay": 2,
    "attendancePercentage": 90
  }
}
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `PunchInOutWidget` | Dashboard widget with large punch button, shows current status and time |
| `AttendanceCalendar` | Monthly calendar view with color-coded attendance status |
| `DailyAttendanceList` | Day-wise attendance table with filters by department/status |
| `RegularizationForm` | Form to request attendance correction with reason |
| `RegularizationApprovalQueue` | Manager/HR queue to approve/reject regularization |
| `OvertimeRequestForm` | OT request form with date, time, reason |
| `OvertimeApprovalPanel` | OT approval list for managers |
| `AttendanceReportViewer` | Report generation with date range, department, format selection |
| `MonthlySummaryCard` | Employee's monthly attendance summary widget |
| `MissingPunchDetector` | Auto-flag missing punches for employees |

---

## Business Rules

1. **Auto Status Determination**: System determines attendance status based on punch times vs. shift timings after grace period
2. **Grace Period**: Configurable grace period (default 15 minutes); punches within grace period are marked "Present" not "Late"
3. **Half-Day Logic**: If employee works <4 hours, marked HalfDay; <2 hours, marked Absent
4. **Overtime Eligibility**: OT only for approved overtime requests; auto OT for specific designations; OT capped at 4 hours/day, 12 hours/week
5. **Missing Punch Rule**: If only punch-in or punch-out is missing, treated as half-day; regularization required
6. **Weekly Off**: Auto-marked as WeekOff for non-working days based on shift schedule
7. **Holiday Override**: Marked as Holiday for company holidays; punches on holidays marked separately
8. **Duplicate Prevention**: Cannot punch twice within 1 minute; second punch treated as break-in/break-out
9. **Regularization Window**: Request must be submitted within 7 days of attendance date; requires manager approval
10. **Consecutive Absence Alert**: Auto-trigger notification after 3 consecutive unmarked absences

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Anomaly Detection | Analyzer | Flag unusual attendance patterns (buddy punching, irregular timings) |
| Attendance Prediction | Predictor | Predict attendance trends for capacity planning |
| Smart Regularization | Assistant | Auto-suggest likely corrections based on historical patterns |
| OT Optimization | Optimizer | Suggest optimal OT allocation based on workload |

---

## Permissions

| Role | View Own | View Team | View All | Regularize | Approve Regularization | OT Approve |
|------|----------|-----------|----------|------------|------------------------|------------|
| SuperAdmin | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes |
| HR | Yes | Yes | Yes | Yes | Yes | Yes |
| Manager | Yes | Yes | No | Yes | Yes (team) | Yes (team) |
| Employee | Yes | No | No | Yes | No | No |
