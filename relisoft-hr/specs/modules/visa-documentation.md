# VISA Documentation Platform Module Specification

## Overview

The VISA Documentation Platform manages the end-to-end lifecycle of visa-related documentation for employees traveling internationally for business purposes. It handles visa applications, document uploads, expiry tracking, compliance with immigration laws, and coordination with travel agents or immigration consultants.

**Scope**: Visa application tracking, document management, expiry alerts, compliance checks, immigration consultant coordination.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Visa Application Tracking | Track visa applications from initiation to decision | P0 |
| Document Repository | Store passport, photo, supporting docs per application | P0 |
| Expiry Management | Alert on passport, visa, and permit expirations | P0 |
| Country Requirements | Configurable document checklist per country | P1 |
| Immigration Consultant Portal | Share documents securely with external consultants | P1 |
| Travel History | Maintain employee travel and visa history | P1 |
| Bulk Visa Processing | Handle group travel visas | P2 |
| Compliance Reporting | Generate immigration compliance reports | P1 |

---

## Data Model

### VisaApplication Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Traveling employee |
| `visaType` | Enum | Yes | Business, Tourist, WorkPermit, Transit, Diplomatic |
| `country` | String | Yes | Destination country |
| `purpose` | String | Yes | Purpose of travel |
| `travelDates` | Object | Yes | Travel date range |
| `travelDates.departure` | Date | Yes | Departure date |
| `travelDates.return` | Date | No | Return date |
| `status` | Enum | Yes | Draft, DocumentsPending, Submitted, UnderProcessing, Approved, Rejected, Collected |
| `submittedAt` | Date | No | Date submitted to embassy |
| `decisionDate` | Date | No | Visa decision date |
| `validFrom` | Date | No | Visa validity start |
| `validUntil` | Date | No | Visa expiry date |
| `entryType` | Enum | No | Single, Double, Multiple |
| `durationOfStay` | Number | No | Max days per visit |
| `consultantId` | ObjectId | No | Immigration consultant reference |
| `documents` | Array | No | Uploaded documents |
| `notes` | String | No | Internal notes |
| `rejectionReason` | String | No | If rejected |
| `createdBy` | ObjectId (Employee) | Yes | Created by |

### VisaDocument Sub-Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `docType` | Enum | Yes | Passport, Photograph, InvitationLetter, BankStatement, Itinerary, Insurance, EmploymentLetter, PreviousVisa, Other |
| `title` | String | Yes | Document name |
| `fileUrl` | String | Yes | Document file path |
| `uploadedAt` | Date | Auto | Upload timestamp |
| `expiryDate` | Date | No | Document expiry (e.g., passport) |
| `verified` | Boolean | No | Document verified flag |

### PassportDetail Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `passportNumber` | String | Yes | Passport number |
| `fullName` | String | Yes | Full name as on passport |
| `nationality` | String | Yes | Nationality |
| `dateOfBirth` | Date | Yes | Date of birth |
| `gender` | String | Yes | Gender |
| `placeOfIssue` | String | Yes | Issuing authority |
| `issueDate` | Date | Yes | Issue date |
| `expiryDate` | Date | Yes | Expiry date |
| `fileUrl` | String | No | Scanned copy URL |

---

## API Endpoints

### `POST /api/visa/applications`
Create visa application.

### `GET /api/visa/applications`
List visa applications with filters.

### `GET /api/visa/applications/:id`
Get application details.

### `PUT /api/visa/applications/:id`
Update application.

### `POST /api/visa/applications/:id/documents`
Upload document.

### `PUT /api/visa/applications/:id/status`
Update application status.

### `GET /api/visa/passports`
List employee passports.

### `POST /api/visa/passports`
Add passport details.

### `PUT /api/visa/passports/:id`
Update passport.

### `GET /api/visa/expiry-alerts`
Get upcoming passport/visa expirations.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `VisaApplicationForm` | Multi-step application form |
| `DocumentUploadPanel` | Drag-and-drop document upload with OCR |
| `ApplicationTracker` | Status timeline for each application |
| `PassportManager` | Employee passport details and expiry alerts |
| `ExpiryDashboard` | Calendar view of upcoming expirations |
| `CountryRequirementGuide` | Configurable per-country document checklist |
| `ConsultantPortal` | Secure file sharing with immigration consultants |
| `TravelHistoryTimeline` | Visual timeline of employee travel/visa history |

---

## Business Rules

1. Passport must have at least 6 months validity before visa application submission
2. Document checklist is dynamically generated based on destination country and visa type
3. Expiry alerts triggered 90, 60, 30, and 7 days before passport/visa expiry
4. Visa applications require manager approval before submission for business visas
5. All documents stored encrypted; access limited to HR, employee, and authorized consultants
6. Rejected visa applications auto-create a helpdesk ticket for HR follow-up
7. Bulk visa processing supported for group events (conferences, offshore assignments)

---

## Permissions

| Role | Applications | Documents | Passports | Expiry Alerts | Consultant Access |
|------|-------------|-----------|-----------|---------------|-------------------|
| SuperAdmin | Full | Full | Full | Full | Yes |
| Admin | Full | Full | Full | Full | Yes |
| HR | CRUD | CRUD | View | Full | Yes |
| Manager | View Team | View Team | No | View Team | No |
| Employee | Own CRUD | Own CRUD | Own CRUD | Own | No |
| Consultant | View Assigned | View Assigned | No | No | Limited |
