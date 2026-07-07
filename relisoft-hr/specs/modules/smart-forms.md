# Smart Forms Module Specification

## Overview

The Smart Forms module provides a no-code form builder for creating dynamic forms with validations, conditional logic, and workflow integration. Forms can be used for data collection, surveys, applications, and approvals across modules.

**Scope**: Form builder, field types, conditional logic, validation rules, form submissions, response analytics.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Drag-and-Drop Builder | Visual form builder with field palette | P0 |
| Field Types | Text, Number, Date, Dropdown, Checkbox, File Upload, Signature, Rich Text | P0 |
| Conditional Logic | Show/hide fields based on previous answers | P0 |
| Validations | Required, regex, range, custom validation rules | P0 |
| Form Templates | Reusable form templates with versioning | P1 |
| Submission Management | View, export, and manage form responses | P0 |
| Workflow Integration | Trigger workflows on form submission | P1 |
| Response Analytics | Aggregate responses with charts and export | P1 |

---

## Data Model

### FormDefinition Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Form title |
| `description` | String | No | Form description |
| `fields` | Array | Yes | Field definitions |
| `fields[].type` | Enum | Yes | text, number, date, dropdown, checkbox, radio, textarea, file, signature, email, phone |
| `fields[].label` | String | Yes | Field label |
| `fields[].key` | String | Yes | Unique field key |
| `fields[].required` | Boolean | No | Required flag |
| `fields[].placeholder` | String | No | Placeholder text |
| `fields[].options` | Array | No | Dropdown/radio options |
| `fields[].validation` | Object | No | Regex, min, max, custom rules |
| `fields[].condition` | Object | No | Conditional visibility logic |
| `fields[].order` | Number | Yes | Display order |
| `status` | Enum | Yes | Draft, Published, Archived |
| `version` | Number | Yes | Version number |
| `createdBy` | ObjectId (Employee) | Yes | Creator |

### FormSubmission Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `form` | ObjectId (FormDefinition) | Yes | Form reference |
| `employee` | ObjectId (Employee) | Yes | Submitter |
| `responses` | Map | Yes | Field key → value pairs |
| `status` | Enum | Yes | Draft, Submitted, Reviewed, Approved, Rejected |
| `submittedAt` | Date | No | Submission timestamp |

---

## API Endpoints

### `POST /api/forms`
Create form definition.

### `GET /api/forms`
List forms.

### `GET /api/forms/:id`
Get form with fields.

### `PUT /api/forms/:id`
Update form.

### `POST /api/forms/:id/submit`
Submit form response.

### `GET /api/forms/:id/responses`
Get form responses.

### `GET /api/forms/:id/analytics`
Response analytics.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `FormBuilder` | Drag-and-drop form designer |
| `FieldPalette` | Available field types |
| `FormRenderer` | Dynamic form rendering engine |
| `SubmissionViewer` | Response table with filters |
| `FormAnalytics` | Charts and aggregation of responses |
| `TemplateLibrary` | Pre-built form templates |
