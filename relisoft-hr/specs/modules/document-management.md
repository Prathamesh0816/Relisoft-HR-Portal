# Document Management Module Specification

## Overview

The Document Management module handles generation, storage, versioning, and e-signature of HR documents including offer letters, appointment letters, experience letters, and policy documents.

**Scope**: Document templates, generation, e-signatures, version control, employee document repository.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Document Templates | Configurable templates with merge fields | P0 |
| Document Generation | Auto-generate letters (offer, appointment, experience, confirmation) | P0 |
| E-Signatures | Digital signature integration (DocuSign/ESign) | P1 |
| Version Control | Document revision history | P1 |
| Employee Repository | Centralized employee document store | P0 |
| Bulk Generation | Generate documents in bulk | P1 |
| Document Expiry Alerts | Track passport, visa, contract expiry | P1 |

---

## Data Model

### Document Template Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Template name |
| `type` | Enum | Yes | OfferLetter, AppointmentLetter, ConfirmationLetter, ExperienceLetter, AppraisalLetter, PolicyDocument, NDA, Others |
| `content` | String | Yes | HTML/Markdown template with merge fields |
| `mergeFields` | Array | Yes | Available merge field names |
| `version` | Number | Yes | Current version |
| `isActive` | Boolean | Yes | Active flag |

### Employee Document Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `documentType` | Enum | Yes | OfferLetter, AppointmentLetter, ExperienceLetter, Payslip, Form16, PolicyAcknowledgment, Others |
| `title` | String | Yes | Document title |
| `fileUrl` | String | Yes | File storage path |
| `fileSize` | Number | No | File size in bytes |
| `mimeType` | String | No | File type |
| `version` | Number | Yes | Version number |
| `isSigned` | Boolean | No | E-signed |
| `signedAt` | Date | No | Signature date |
| `expiryDate` | Date | No | Document expiry |
| `tags` | Array | No | Search tags |
| `createdBy` | ObjectId (User) | Yes | Creator |

---

## API Endpoints

### `GET /api/v1/documents/templates`
List templates.

### `POST /api/v1/documents/generate`
Generate document from template.

**Request Body**:
```json
{
  "templateId": "664...",
  "employeeId": "664...",
  "mergeData": {
    "employeeName": "John Doe",
    "designation": "Senior Software Engineer",
    "department": "Engineering",
    "dateOfJoining": "15 January 2024",
    "ctc": "₹18,00,000 per annum"
  },
  "format": "PDF"
}
```

### `GET /api/v1/documents/employee/:employeeId`
Get employee's document repository.

### `POST /api/v1/documents/upload`
Upload document to employee repository.

### `POST /api/v1/documents/:id/esign`
Send for e-signature.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `TemplateEditor` | Rich text editor with merge field insertion |
| `DocumentGenerator` | Select template, preview, generate |
| `EmployeeDocumentRepo` | Organized document list with search |
| `ESignWidget` | Embedded e-signature interface |
| `DocumentExpiryDashboard` | Upcoming expiry alerts |

---

## Business Rules

1. All official letters auto-generated from templates with approved content
2. Generated documents stored permanently; cannot be deleted (only archived)
3. E-signature required for offer letter acceptance and policy acknowledgments
4. Document versioning: major version on content change, minor on merge field updates
5. Employee can download own documents; HR controls upload/delete of others

---

## Permissions

| Role | Templates | Generate | Upload | Download | Delete | E-Sign |
|------|-----------|----------|--------|----------|--------|--------|
| SuperAdmin | Full | Full | Full | All | Yes | All |
| Admin | Full | Full | Full | All | Yes | All |
| HR | CRUD | All | All | All | Yes | All |
| Manager | Read | Team | No | Team | No | No |
| Employee | No | No | Own | Own | No | Own |
