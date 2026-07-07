# Employee Management Module Specification

## Overview

The Employee Management module is the core module handling all employee data, organizational hierarchy, employment lifecycle events, and employee self-service (ESS) capabilities. Every other module in the system references employees from this module.

**Scope**: Employee CRUD, profile management, organizational hierarchy, document management within profile, ESS dashboard, employee lifecycle events (join, transfer, promotion, separation).

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Employee CRUD | Create, read, update, deactivate employee records | P0 |
| Profile Management | Personal info, contact, emergency contacts, education, experience, documents | P0 |
| Organization Hierarchy | Department, team, reporting manager, matrix reporting | P0 |
| Employee Search | Search by name, ID, department, skill, location with filters | P0 |
| Bulk Operations | Import/export employees via CSV/Excel, bulk updates | P1 |
| Employee Lifecycle | Track status changes: active, terminated, on-leave, suspended | P0 |
| Transfer Management | Inter-department and inter-location transfers with history | P1 |
| Promotion Management | Title changes, grade changes, salary revisions | P1 |
| ESS Dashboard | Self-service view for employees to manage their data | P0 |
| Document Management | Upload/store/verify identity, education, experience documents | P1 |
| Employee Reports | Headcount, attrition, demographic, diversity reports | P1 |
| Skill Management | Skill tagging, proficiency levels, skill gap analysis | P2 |

---

## Data Model

### Employee Collection

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `employeeId` | String | Yes | Auto-generated | Unique employee code (EMP-XXXXX) |
| `firstName` | String | Yes | — | Legal first name |
| `middleName` | String | No | — | Middle name |
| `lastName` | String | Yes | — | Legal last name |
| `preferredName` | String | No | — | Preferred display name |
| `gender` | Enum | Yes | — | Male/Female/Other/PreferNotToSay |
| `dateOfBirth` | Date | Yes | — | Date of birth |
| `personalEmail` | String | Yes | — | Personal email address |
| `workEmail` | String | Yes | — | Company email address |
| `phoneNumber` | String | Yes | — | Primary phone number |
| `alternatePhone` | String | No | — | Alternate phone number |
| `address` | Object | Yes | — | Residential address |
| `address.line1` | String | Yes | — | Address line 1 |
| `address.line2` | String | No | — | Address line 2 |
| `address.city` | String | Yes | — | City |
| `address.state` | String | Yes | — | State/province |
| `address.zipCode` | String | Yes | — | Postal code |
| `address.country` | String | Yes | — | Country |
| `emergencyContacts` | Array | No | [] | Emergency contact list |
| `emergencyContacts[].name` | String | Yes | — | Contact person name |
| `emergencyContacts[].relationship` | String | Yes | — | Relationship |
| `emergencyContacts[].phone` | String | Yes | — | Contact phone |
| `departmentId` | ObjectId (Dept) | Yes | — | Current department reference |
| `designationId` | ObjectId (Designation) | Yes | — | Job title reference |
| `gradeId` | ObjectId (Grade) | Yes | — | Grade/level reference |
| `employmentType` | Enum | Yes | Permanent | Permanent, Contract, Probation, Intern, Trainee |
| `employmentStatus` | Enum | Yes | Active | Active, Inactive, Terminated, Resigned, Suspended, OnLeave |
| `dateOfJoining` | Date | Yes | — | Date of joining |
| `dateOfConfirmation` | Date | No | — | Probation confirmation date |
| `probationEndDate` | Date | No | — | End of probation period |
| `noticePeriodDays` | Number | Yes | 30 | Notice period in days as per contract |
| `workLocation` | String | Yes | — | Office location/city |
| `workMode` | Enum | Yes | Office | Office, Remote, Hybrid |
| `managerId` | ObjectId (Employee) | No | — | Reporting manager |
| `hrId` | ObjectId (Employee) | No | — | Assigned HR business partner |
| `skills` | Array | No | [] | Skills with proficiency |
| `skills[].skillName` | String | Yes | — | Skill name |
| `skills[].proficiency` | Enum | Yes | — | Beginner, Intermediate, Advanced, Expert |
| `skills[].yearsOfExperience` | Number | No | — | Years in this skill |
| `education` | Array | No | [] | Education history |
| `education[].degree` | String | Yes | — | Degree name |
| `education[].institution` | String | Yes | — | Institution name |
| `education[].yearOfPassing` | Number | Yes | — | Graduation year |
| `education[].percentage` | Number | No | — | Marks/grade |
| `workExperience` | Array | No | [] | Previous employment |
| `workExperience[].company` | String | Yes | — | Company name |
| `workExperience[].designation` | String | Yes | — | Job title |
| `workExperience[].fromDate` | Date | Yes | — | Start date |
| `workExperience[].toDate` | Date | Yes | — | End date |
| `workExperience[].isCurrent` | Boolean | No | false | Currently working here |
| `bankDetails` | Object | No | — | Salary account info |
| `bankDetails.accountNumber` | String | Yes | — | Masked account number |
| `bankDetails.ifscCode` | String | Yes | — | IFSC code |
| `bankDetails.bankName` | String | Yes | — | Bank name |
| `bankDetails.branchName` | String | No | — | Branch name |
| `statutoryInfo` | Object | No | — | Statutory details |
| `statutoryInfo.panNumber` | String | No | — | PAN card number (India) |
| `statutoryInfo.aadhaarNumber` | String | No | — | Masked Aadhaar number |
| `statutoryInfo.uanNumber` | String | No | — | PF UAN number |
| `statutoryInfo.esicNumber` | String | No | — | ESIC number |
| `profileImageUrl` | String | No | — | Profile photo URL |
| `customFields` | Map | No | {} | Client-specific custom fields |
| `createdBy` | ObjectId (User) | Yes | — | Record creator |
| `updatedBy` | ObjectId (User) | Yes | — | Last updater |
| `createdAt` | Date | Auto | — | Timestamp |
| `updatedAt` | Date | Auto | — | Timestamp |

### Department Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Department name |
| `code` | String | Yes | Unique department code |
| `headId` | ObjectId (Employee) | No | Department head |
| `parentDepartmentId` | ObjectId (Dept) | No | Parent department |
| `costCenter` | String | No | Cost center code |
| `location` | String | No | Primary location |
| `isActive` | Boolean | Yes | Active flag |

### Designation Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Designation/job title |
| `code` | String | Yes | Unique code |
| `gradeId` | ObjectId (Grade) | Yes | Associated grade |
| `departmentId` | ObjectId (Dept) | No | Department scope |
| `level` | Number | Yes | Hierarchy level (higher = senior) |
| `isActive` | Boolean | Yes | Active flag |

### Grade Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Grade name (e.g., "E3", "M2") |
| `level` | Number | Yes | Numeric level |
| `minSalary` | Number | No | Minimum salary for this grade |
| `maxSalary` | Number | No | Maximum salary for this grade |
| `isActive` | Boolean | Yes | Active flag |

---

## API Endpoints

### Employee CRUD

#### `GET /api/v1/employees`
List employees with pagination, search, and filters.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) — Search name, email, employeeId
- `department` (ObjectId) — Filter by department
- `employmentStatus` (enum) — Filter by status
- `employmentType` (enum) — Filter by type
- `managerId` (ObjectId) — Filter by manager
- `location` (string) — Filter by work location
- `sortBy` (string) — Field to sort by
- `sortOrder` (asc/desc) — Sort direction

**Response**:
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "_id": "664a1b2c3d4e5f6a7b8c9d0e",
        "employeeId": "EMP-00001",
        "firstName": "John",
        "lastName": "Doe",
        "workEmail": "john.doe@relisofttechnologies.com",
        "departmentId": {
          "_id": "664a1b2c3d4e5f6a7b8c9d0f",
          "name": "Engineering"
        },
        "designationId": {
          "_id": "664a1b2c3d4e5f6a7b8c9d10",
          "title": "Senior Software Engineer"
        },
        "employmentStatus": "Active",
        "dateOfJoining": "2023-01-15T00:00:00.000Z",
        "profileImageUrl": "https://cdn.relisofttechnologies.com/profiles/emp-00001.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### `GET /api/v1/employees/:id`
Get detailed employee profile.

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d0e",
    "employeeId": "EMP-00001",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "workEmail": "john.doe@relisofttechnologies.com",
    "phoneNumber": "+91-9876543210",
    "address": {
      "line1": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "emergencyContacts": [
      {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phone": "+91-9876543211"
      }
    ],
    "departmentId": {
      "_id": "664a1b2c3d4e5f6a7b8c9d0f",
      "name": "Engineering",
      "headId": {
        "_id": "664a1b2c3d4e5f6a7b8c9d11",
        "firstName": "Alice",
        "lastName": "Smith"
      }
    },
    "designationId": { "_id": "...", "title": "Senior Software Engineer" },
    "gradeId": { "_id": "...", "name": "E3", "level": 3 },
    "employmentType": "Permanent",
    "employmentStatus": "Active",
    "dateOfJoining": "2023-01-15T00:00:00.000Z",
    "probationEndDate": "2023-07-15T00:00:00.000Z",
    "managerId": {
      "_id": "664a1b2c3d4e5f6a7b8c9d11",
      "firstName": "Alice",
      "lastName": "Smith",
      "employeeId": "EMP-00002"
    },
    "skills": [
      { "skillName": "JavaScript", "proficiency": "Expert", "yearsOfExperience": 6 },
      { "skillName": "React", "proficiency": "Advanced", "yearsOfExperience": 4 }
    ],
    "education": [
      {
        "degree": "B.Tech Computer Science",
        "institution": "IIT Bombay",
        "yearOfPassing": 2012,
        "percentage": 85
      }
    ],
    "createdAt": "2023-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
}
```

#### `POST /api/v1/employees`
Create new employee.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "dateOfBirth": "1990-05-15",
  "personalEmail": "john.doe@gmail.com",
  "phoneNumber": "+91-9876543210",
  "address": {
    "line1": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  },
  "departmentId": "664a1b2c3d4e5f6a7b8c9d0f",
  "designationId": "664a1b2c3d4e5f6a7b8c9d10",
  "gradeId": "664a1b2c3d4e5f6a7b8c9d12",
  "employmentType": "Permanent",
  "dateOfJoining": "2023-01-15",
  "workLocation": "Bangalore",
  "workMode": "Hybrid",
  "managerId": "664a1b2c3d4e5f6a7b8c9d11"
}
```

**Response** (201 Created): Full employee object

#### `PUT /api/v1/employees/:id`
Update employee details.

#### `PATCH /api/v1/employees/:id/status`
Update employment status.

**Request Body**:
```json
{
  "employmentStatus": "Terminated",
  "effectiveDate": "2024-06-30",
  "reason": "Resignation - Career Growth",
  "remarks": "Serving notice period till July 30"
}
```

#### `GET /api/v1/employees/:id/hierarchy`
Get reporting hierarchy (upward and downward).

**Response**:
```json
{
  "success": true,
  "data": {
    "employee": { "_id": "...", "firstName": "John", "lastName": "Doe" },
    "reportingTo": [
      { "_id": "...", "firstName": "Alice", "lastName": "Smith", "level": 1 },
      { "_id": "...", "firstName": "Bob", "lastName": "Johnson", "level": 2 }
    ],
    "directReports": [
      { "_id": "...", "firstName": "Charlie", "lastName": "Brown" },
      { "_id": "...", "firstName": "Diana", "lastName": "Prince" }
    ],
    "peers": [
      { "_id": "...", "firstName": "Eve", "lastName": "Adams" }
    ]
  }
}
```

#### `POST /api/v1/employees/bulk/import`
Bulk import from CSV/Excel.

#### `GET /api/v1/employees/export`
Export employees to CSV/Excel.

### Department Endpoints

#### `GET /api/v1/departments`
#### `POST /api/v1/departments`
#### `PUT /api/v1/departments/:id`
#### `GET /api/v1/departments/:id/hierarchy`
Get department tree structure.

### Designation Endpoints

#### `GET /api/v1/designations`
#### `POST /api/v1/designations`
#### `PUT /api/v1/designations/:id`

---

## UI Components

| Component | Description | Behavior |
|-----------|-------------|----------|
| `EmployeeListPage` | Paginated employee table | Search, filter, sort, bulk select, export |
| `EmployeeProfilePage` | Full employee profile view | Tabbed sections (personal, employment, documents, history) |
| `EmployeeCreatePage` | Multi-step employee creation form | Step 1: Personal, Step 2: Employment, Step 3: Documents |
| `EmployeeEditPage` | Edit employee details | Inline editing, section-by-section update |
| `OrganizationChart` | Interactive org chart | D3.js based, zoom/pan, click to drill down |
| `DepartmentTree` | Department hierarchy tree | Expandable tree view with employee count |
| `EmployeeSearchBar` | Global employee search | Typeahead with avatar, department, designation |
| `EmployeeCard` | Mini profile card | Hover/click to show quick info |
| `BulkImportModal` | CSV/Excel import wizard | Column mapping, validation preview, error report |
| `EmploymentTimeline` | Lifecycle event timeline | Visual timeline of join, promotion, transfer events |

---

## Business Rules

1. **Employee ID Generation**: Auto-generated format `EMP-{5-digit sequential}` with optional prefix configuration
2. **Email Uniqueness**: Both `personalEmail` and `workEmail` must be unique across active employees
3. **Manager Validation**: Cannot report to oneself; no circular reporting chains; manager must be active employee
4. **Date Validation**: `dateOfJoining` must be >= 18 years after `dateOfBirth`; `probationEndDate` > `dateOfJoining`
5. **Deactivation Rules**: Cannot deactivate employee with active leave/asset/helpdesk tickets; pending approvals must be resolved
6. **Bulk Import Validation**: Validate all rows before importing; reject entire file if >5% errors; provide detailed error report
7. **Skill Tagging**: Skills from standardized skill taxonomy; proficiency levels validated against years of experience
8. **Transfer Rules**: Cannot transfer employee to same department; HR approval required; notification to old and new manager
9. **Promotion Rules**: Minimum 12 months in current grade (unless exceptional); manager recommendation required; compensation committee approval for grade changes

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Profile Photo Validation | Image Analyzer | Auto-detect inappropriate/duplicate profile photos |
| Skill Recommendations | Skill Engine | Suggest skills based on job title, industry trends, team gaps |
| Employee Matching | Matcher | Find mentors, project team members based on skills and experience |
| Profile Completeness | Analyzer | AI-powered profile completeness score with suggestions |
| Org Chart Optimization | Analyzer | Suggest optimal reporting structures based on workload analysis |
| Document Verification | OCR + Analyzer | Auto-extract and validate data from uploaded documents |
| Onboarding Recommendations | Recommender | Suggest equipment, training, and introductions for new hires |

---

## Permissions

| Role | Employees | Departments | Designations | Reports | Bulk Ops |
|------|-----------|-------------|--------------|---------|----------|
| SuperAdmin | Full CRUD | Full CRUD | Full CRUD | All | Yes |
| Admin | Full CRUD | Full CRUD | Full CRUD | All | Yes |
| HR | CRUD (all) | Read | Read | All | Yes |
| Manager | Read (dept) | Read | Read | Own team | No |
| Employee | Read (self), Edit (limited self) | None | None | None | No |

**Self-Service Edit Permissions** (Employee role):
- Can edit: phone, address, emergency contacts, education, experience, skills, profile image
- Cannot edit: employeeId, department, designation, grade, manager, employmentType, employmentStatus, dateOfJoining, salary info
- Changes to contact info require HR verification (flagged for review)
