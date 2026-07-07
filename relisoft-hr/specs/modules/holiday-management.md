# Holiday Management Module Specification

## Overview

The Holiday Management module manages company holidays, location-wise holiday calendars, and public holiday observations. Holiday data is consumed by Attendance, Leave, and Payroll modules for accurate processing.

**Scope**: Holiday calendar, location-based holidays, optional holidays, holiday attendance rules.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Holiday Calendar | Company-wide and location-wise holiday lists | P0 |
| Location-wise Holidays | Separate holiday lists per office location | P0 |
| Optional Holidays | Employee can choose from optional holiday list | P1 |
| Holiday Import | Bulk import national/regional holiday lists | P1 |
| Holiday Tags | Tag holidays as National, Regional, Company, Festival | P0 |

---

## Data Model

### Holiday Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Holiday name |
| `date` | Date | Yes | Date |
| `year` | Number | Yes | Year |
| `type` | Enum | Yes | National, Regional, Company, Festival, Optional |
| `locations` | Array of String | Yes | Applicable locations |
| `isOptional` | Boolean | No | Optional holiday flag |
| `isPaid` | Boolean | Yes | Paid holiday |
| `description` | String | No | Description |
| `color` | String | No | Calendar color code |

---

## API Endpoints

### `GET /api/v1/holidays?year=2024&location=Bangalore`
Get holidays list.

### `POST /api/v1/holidays`
Add holiday.

### `DELETE /api/v1/holidays/:id`
Remove holiday.

### `POST /api/v1/holidays/bulk`
Bulk import holidays.

**Request Body**:
```json
{
  "year": 2025,
  "location": "Bangalore",
  "holidays": [
    { "name": "Republic Day", "date": "2025-01-26", "type": "National" },
    { "name": "Ugadi", "date": "2025-03-30", "type": "Regional" }
  ]
}
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `HolidayCalendarView` | Annual calendar with holiday markers |
| `HolidayForm` | Add/edit holiday form |
| `HolidayImportWizard` | CSV/bulk import with preview |
| `OptionalHolidaySelector` | Employee selection of optional holidays |
| `LocationHolidayComparison` | Compare holidays across locations |

---

## Business Rules

1. Holidays override regular shift attendance — no attendance required
2. If employee works on holiday, it is paid as overtime (double rate)
3. Optional holidays — employee must select in advance (by Jan 31); max 2 per year
4. Holiday falling on weekend may be observed on adjacent working day (company policy)
5. Holiday count and list published minimum 30 days before year start

---

## Permissions

| Role | View | Create | Edit | Delete | Bulk Import |
|------|------|--------|------|--------|-------------|
| SuperAdmin | Yes | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes | Yes |
| HR | Yes | Yes | Yes | Yes | Yes |
| Manager | Yes | No | No | No | No |
| Employee | Yes | No | No | No | No |
