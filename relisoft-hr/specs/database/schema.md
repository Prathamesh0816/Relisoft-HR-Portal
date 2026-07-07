# Database Schema Specification

## Overview

This document defines the complete MongoDB database schema for ReliSoft HR. All collections, fields, indexes, relationships, and validation rules are documented below.

**Database**: MongoDB 7.0
**ODM**: Mongoose 8.x
**Naming Convention**: snake_case for fields, camelCase for JavaScript references

---

## Collection: users

Stores system user accounts mapped to employee records.

### Fields

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | — | Primary key |
| `employee_id` | ObjectId (employees) | Yes | Yes | — | Linked employee |
| `username` | String (3-50) | Yes | Yes | — | Login username |
| `email` | String | Yes | Yes | — | Login email (lowercase) |
| `password_hash` | String | Yes | — | — | bcrypt hash (60 chars) |
| `roles` | [ObjectId (roles)] | Yes | — | [] | Assigned roles |
| `is_active` | Boolean | Yes | — | true | Account enabled |
| `is_locked` | Boolean | No | — | false | Account locked |
| `locked_until` | Date | No | — | null | Lock expiration |
| `mfa_enabled` | Boolean | No | — | false | MFA active |
| `mfa_secret` | String | No | — | null | Encrypted TOTP secret |
| `mfa_method` | String | No | — | null | "totp" or "sms" |
| `password_changed_at` | Date | No | — | null | Last password change |
| `last_login_at` | Date | No | — | null | Last login timestamp |
| `failed_login_attempts` | Number | No | — | 0 | Consecutive failures |
| `refresh_tokens` | [{token: String, expires_at: Date}] | No | — | [] | Active refresh tokens |
| `ip_whitelist` | [String] | No | — | [] | Allowed IP list |
| `created_at` | Date | Auto | — | now | Timestamp |
| `updated_at` | Date | Auto | — | now | Timestamp |

### Indexes

| Index | Fields | Options |
|-------|--------|---------|
| Primary | `_id` | Unique |
| Email unique | `email` | Unique, sparse |
| Username unique | `username` | Unique, sparse |
| Employee ref | `employee_id` | Unique |
| Active users | `is_active` | Partial filter |

### Validation Rules

- `email`: Must be valid email format; stored lowercase
- `password_hash`: Min 60 chars (bcrypt output)
- `failed_login_attempts`: Max 5 before auto-lock
- `locked_until`: Reset on successful login after lock period

---

## Collection: employees

Core employee records — the central entity referenced by all modules.

### Fields

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | — | Primary key |
| `employee_id` | String | Yes | Yes | — | Format: EMP-XXXXX |
| `first_name` | String (1-100) | Yes | — | — | Legal first name |
| `middle_name` | String (0-100) | No | — | "" | Middle name |
| `last_name` | String (1-100) | Yes | — | — | Legal last name |
| `preferred_name` | String (0-100) | No | — | null | Display name |
| `gender` | String | Yes | — | — | Enum: Male, Female, Other, PreferNotToSay |
| `date_of_birth` | Date | Yes | — | — | ISO date |
| `personal_email` | String | Yes | — | — | Personal email |
| `work_email` | String | Yes | Yes | — | Company email |
| `phone_number` | String | Yes | — | — | Primary phone |
| `alternate_phone` | String | No | — | null | Alternate phone |
| `address` | Object | Yes | — | — | See Address sub-schema |
| `emergency_contacts` | [Object] | No | — | [] | See EC sub-schema |
| `department_id` | ObjectId (departments) | Yes | — | — | Department ref |
| `designation_id` | ObjectId (designations) | Yes | — | — | Designation ref |
| `grade_id` | ObjectId (grades) | Yes | — | — | Grade ref |
| `employment_type` | String | Yes | — | "Permanent" | Enum |
| `employment_status` | String | Yes | — | "Active" | Enum |
| `date_of_joining` | Date | Yes | — | — | ISO date |
| `date_of_confirmation` | Date | No | — | null | Confirmation date |
| `probation_end_date` | Date | No | — | null | Probation end |
| `notice_period_days` | Number | Yes | — | 30 | Contractual notice |
| `work_location` | String | Yes | — | — | Office location |
| `work_mode` | String | Yes | — | "Office" | Enum: Office, Remote, Hybrid |
| `manager_id` | ObjectId (employees) | No | — | null | Reporting manager |
| `hr_id` | ObjectId (employees) | No | — | null | HRBP |
| `skills` | [Object] | No | — | [] | See Skills sub-schema |
| `education` | [Object] | No | — | [] | See Education sub-schema |
| `work_experience` | [Object] | No | — | [] | See Experience sub-schema |
| `bank_details` | Object | No | — | null | See Bank sub-schema |
| `statutory_info` | Object | No | — | null | See Statutory sub-schema |
| `profile_image_url` | String | No | — | null | S3 URL |
| `custom_fields` | Map | No | — | {} | Client-specific |
| `created_by` | ObjectId (users) | Yes | — | — | Creator |
| `updated_by` | ObjectId (users) | Yes | — | — | Updater |
| `created_at` | Date | Auto | — | now | Timestamp |
| `updated_at` | Date | Auto | — | now | Timestamp |

### Sub-schemas

**Address**: `{ line1: String (req), line2: String, city: String (req), state: String (req), zip_code: String (req), country: String (req, default: "India") }`

**EmergencyContact**: `{ name: String (req), relationship: String (req), phone: String (req) }`

**Skills**: `{ skill_name: String (req), proficiency: String (enum: Beginner/Intermediate/Advanced/Expert), years_of_experience: Number }`

**Education**: `{ degree: String (req), institution: String (req), year_of_passing: Number (req), percentage: Number }`

**WorkExperience**: `{ company: String (req), designation: String (req), from_date: Date (req), to_date: Date, is_current: Boolean (default: false) }`

**BankDetails**: `{ account_number: String (masked), ifsc_code: String, bank_name: String, branch_name: String }`

**StatutoryInfo**: `{ pan_number: String, aadhaar_number: String (masked), uan_number: String, esic_number: String }`

### Indexes

| Index | Fields | Options |
|-------|--------|---------|
| Primary | `_id` | Unique |
| Employee ID | `employee_id` | Unique |
| Work email | `work_email` | Unique |
| Department | `department_id` | — |
| Manager | `manager_id` | — |
| Status | `employment_status` | — |
| Full-text search | `first_name`, `last_name`, `employee_id`, `work_email` | Text index |
| Composite: dept + status | `department_id`, `employment_status` | Compound |
| Created at | `created_at` | Descending |

### Validation Rules

- `date_of_birth`: Must be at least 18 years before date_of_joining
- `probation_end_date`: Must be > date_of_joining
- `manager_id`: Cannot reference self; must be active employee
- `work_email`: Must match company domain pattern
- `phone_number`: Must match E.164 format

---

## Collection: departments

### Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Auto | Yes | Primary key |
| `name` | String | Yes | Yes | Department name |
| `code` | String | Yes | Yes | Unique code (DEPT-XXX) |
| `head_id` | ObjectId (employees) | No | — | Department head |
| `parent_department_id` | ObjectId (departments) | No | — | Parent dept |
| `cost_center` | String | No | — | Cost center code |
| `location` | String | No | — | Primary location |
| `is_active` | Boolean | Yes | — | Active flag (default: true) |
| `created_at` | Date | Auto | — | Timestamp |

---

## Collection: designations

### Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Auto | Yes | Primary key |
| `title` | String | Yes | — | Job title |
| `code` | String | Yes | Yes | Unique code |
| `grade_id` | ObjectId (grades) | Yes | — | Grade ref |
| `department_id` | ObjectId (departments) | No | — | Department scope |
| `level` | Number | Yes | — | Hierarchy level |
| `is_active` | Boolean | Yes | — | Active flag |

---

## Collection: grades

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Grade name (E1, M2, etc.) |
| `level` | Number | Yes | Numeric level |
| `min_salary` | Number | No | Minimum salary |
| `max_salary` | Number | No | Maximum salary |
| `is_active` | Boolean | Yes | Active flag |

---

## Collection: leave_types

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | — | Primary key |
| `name` | String (3-100) | Yes | — | Leave type name |
| `code` | String (3-20) | Yes | — | Unique code |
| `is_paid` | Boolean | Yes | true | Paid leave |
| `is_statutory` | Boolean | No | false | Statutory leave |
| `color` | String | Yes | — | Calendar hex color |
| `min_days_per_request` | Number | No | 1 | Minimum days |
| `max_days_per_request` | Number | No | 365 | Maximum days |
| `requires_documentation` | Boolean | No | false | Medical cert etc. |
| `allows_half_day` | Boolean | No | true | Half-day allowed |
| `gender_restriction` | String | No | null | Male, Female, All |
| `carry_forward_allowed` | Boolean | No | false | Carry forward |
| `max_carry_forward` | Number | No | 0 | Max carry days |
| `encashable` | Boolean | No | false | Encashable |
| `max_encashment` | Number | No | 0 | Max encash days |

---

## Collection: leave_policies

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `leave_type_id` | ObjectId (leave_types) | Yes | Leave type ref |
| `applicable_grades` | [ObjectId (grades)] | Yes | Grades |
| `applicable_employment_types` | [String] | Yes | Employment types |
| `entitlement_days` | Number | Yes | Days per cycle |
| `accrual_frequency` | String | Yes | Monthly, Quarterly, Yearly, Upfront |
| `max_accumulation` | Number | No | Max balance |
| `min_service_days` | Number | No | Min service |
| `probation_eligible` | Boolean | No | true | Probationers allowed |

---

## Collection: leave_balances

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `employee_id` | ObjectId (employees) | Yes | Employee ref |
| `leave_type_id` | ObjectId (leave_types) | Yes | Leave type ref |
| `financial_year` | String | Yes | "2024-2025" |
| `opening_balance` | Number | Yes | Start of year balance |
| `total_credited` | Number | Yes | Total credited |
| `total_availed` | Number | Yes | Total used |
| `total_encashed` | Number | No | Total encashed |
| `total_lapsed` | Number | No | Total lapsed |
| `closing_balance` | Number | Yes | Computed balance |
| `pending_applications` | Number | No | Pending approval days |
| `last_credited_date` | Date | No | Last credit |

**Indexes**: `{ employee_id: 1, leave_type_id: 1, financial_year: 1 }` (unique compound)

---

## Collection: leave_applications

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | — | Primary key |
| `employee_id` | ObjectId | Yes | — | Employee ref |
| `leave_type_id` | ObjectId | Yes | — | Leave type ref |
| `from_date` | Date | Yes | — | Start date |
| `to_date` | Date | Yes | — | End date |
| `total_days` | Number | Yes | — | Leave days count |
| `is_half_day` | Boolean | No | false | Half day flag |
| `half_day_type` | String | No | null | FirstHalf/SecondHalf |
| `reason` | String (10-500) | Yes | — | Reason |
| `contact_number` | String | No | null | Contact during leave |
| `alternate_arrangement` | String | No | null | Work coverage |
| `document_urls` | [String] | No | [] | Supporting docs |
| `status` | String | Yes | "Pending" | Enum |
| `current_approval_level` | Number | No | 1 | Workflow level |
| `approval_logs` | [Object] | No | [] | Approval history |
| `applied_on` | Date | Yes | now | Application date |
| `cancelled_on` | Date | No | null | Cancel date |

**Indexes**: `{ employee_id: 1, from_date: -1 }`, `{ status: 1 }`, `{ from_date: 1, to_date: 1 }`

---

## Collection: attendance_records

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | — | Primary key |
| `employee_id` | ObjectId | Yes | — | Employee ref |
| `date` | Date | Yes | — | Date (date-only) |
| `day_type` | String | Yes | "Weekday" | Enum |
| `shift_id` | ObjectId | No | null | Shift ref |
| `punch_in` | Date | No | null | First punch |
| `punch_out` | Date | No | null | Last punch |
| `total_hours` | Number | No | null | Hours worked |
| `net_working_hours` | Number | No | null | Minus breaks |
| `break_duration` | Number | No | 0 | Break minutes |
| `status` | String | Yes | "Absent" | Enum |
| `late_minutes` | Number | No | 0 | Late minutes |
| `early_minutes` | Number | No | 0 | Early minutes |
| `overtime_minutes` | Number | No | 0 | OT minutes |
| `overtime_eligible` | Boolean | No | false | OT eligible |
| `is_regularized` | Boolean | No | false | Regularized |
| `regularization_id` | ObjectId | No | null | Regularization ref |
| `attendance_source` | String | Yes | "Biometric" | Enum |
| `device_id` | String | No | null | Device ID |
| `ip_address` | String | No | null | IP address |
| `geo_location` | Object | No | null | GPS coords |
| `punches` | [Object] | No | [] | All punch events |
| `remarks` | String | No | null | Notes |

**Indexes**: `{ employee_id: 1, date: -1 }` (unique compound), `{ date: 1, status: 1 }`

---

## Collection: payroll_runs

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | — | Primary key |
| `month` | Number (1-12) | Yes | — | Month |
| `year` | Number | Yes | — | Year |
| `run_name` | String | Yes | — | Run name |
| `status` | String | Yes | "Draft" | Enum |
| `total_employees` | Number | Yes | 0 | Count |
| `total_earnings` | Number | Yes | 0 | Gross earnings |
| `total_deductions` | Number | Yes | 0 | Gross deductions |
| `total_net_pay` | Number | Yes | 0 | Net payout |
| `processing_started_at` | Date | No | null | Start time |
| `processing_completed_at` | Date | No | null | End time |
| `locked_at` | Date | No | null | Lock time |
| `locked_by` | ObjectId | No | null | Who locked |
| `created_by` | ObjectId | Yes | — | Creator |

**Indexes**: `{ month: 1, year: 1 }` (unique), `{ status: 1 }`

---

## Collection: payslips

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `employee_id` | ObjectId | Yes | Employee ref |
| `payroll_run_id` | ObjectId | Yes | Payroll run ref |
| `salary_structure_id` | ObjectId | Yes | Structure used |
| `month` | Number | Yes | Month |
| `year` | Number | Yes | Year |
| `attendance_summary` | Object | Yes | Days breakdown |
| `earnings` | [Object] | Yes | Earnings components |
| `deductions` | [Object] | Yes | Deductions components |
| `gross_earnings` | Number | Yes | Total earnings |
| `gross_deductions` | Number | Yes | Total deductions |
| `net_pay` | Number | Yes | Net payable |
| `total_days_in_month` | Number | Yes | Calendar days |
| `paid_days` | Number | Yes | Paid days |
| `lop_days` | Number | No | LOP days |
| `arrears` | Number | No | Arrear amount |
| `payslip_url` | String | No | PDF URL |
| `is_final_settlement` | Boolean | No | FnF flag |
| `status` | String | Yes | Generated, Sent, etc. |

**Indexes**: `{ employee_id: 1, year: -1, month: -1 }`, `{ payroll_run_id: 1 }`

---

## Collection: recruitments (requisitions)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `requisition_id` | String | Yes | REQ-XXXXX |
| `title` | String | Yes | Job title |
| `department_id` | ObjectId | Yes | Dept ref |
| `designation_id` | ObjectId | Yes | Designation ref |
| `grade_id` | ObjectId | Yes | Grade ref |
| `employment_type` | String | Yes | Enum |
| `vacancies` | Number | Yes | Open positions |
| `location` | String | Yes | Location |
| `min_experience` | Number | Yes | Min years |
| `max_experience` | Number | Yes | Max years |
| `budgeted_salary_min` | Number | No | Min budget |
| `budgeted_salary_max` | Number | No | Max budget |
| `description` | String | Yes | Job description |
| `requirements` | [String] | Yes | Requirements |
| `responsibilities` | [String] | Yes | Responsibilities |
| `status` | String | Yes | Enum |
| `priority` | String | Yes | High/Medium/Low |
| `requested_by` | ObjectId | Yes | Requester |
| `approved_by` | ObjectId | No | Approver |

**Indexes**: `{ status: 1 }`, `{ department_id: 1, status: 1 }`

---

## Collection: applicants

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `requisition_id` | ObjectId | Yes | Job ref |
| `first_name` | String | Yes | First name |
| `last_name` | String | Yes | Last name |
| `email` | String | Yes | Email |
| `phone` | String | Yes | Phone |
| `current_company` | String | No | Current employer |
| `current_designation` | String | No | Current title |
| `total_experience` | Number | No | Years |
| `skills` | [String] | No | Skills |
| `education` | Object | No | Education details |
| `resume_url` | String | Yes | Resume file |
| `parsed_data` | Object | No | AI parsed data |
| `source` | String | Yes | Source enum |
| `referred_by` | ObjectId | No | Ref employee |
| `status` | String | Yes | Pipeline status |
| `stage_history` | [Object] | No | Status log |
| `applied_date` | Date | Yes | Application date |

**Indexes**: `{ requisition_id: 1, status: 1 }`, `{ email: 1 }`

---

## Collection: onboarding_records

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `applicant_id` | ObjectId | No | Applicant ref |
| `employee_id` | ObjectId | Yes | Employee ref |
| `offer_id` | ObjectId | No | Offer ref |
| `joining_date` | Date | Yes | Joining date |
| `status` | String | Yes | Enum |
| `pre_onboarding_complete` | Boolean | No | Pre-onboarding done |
| `onboarding_plan_id` | ObjectId | No | Plan ref |

---

## Collection: shifts_templates

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Shift name |
| `code` | String | Yes | Unique code |
| `start_time` | String | Yes | HH:mm |
| `end_time` | String | Yes | HH:mm |
| `grace_period` | Number | No | Late grace minutes |
| `half_day_hours` | Number | No | Half-day threshold |
| `full_day_hours` | Number | No | Full-day threshold |
| `break_duration` | Number | No | Break minutes |
| `type` | String | Yes | Fixed/Rotating/Split/Flexible |
| `applicable_departments` | [ObjectId] | No | Dept scope |

---

## Collection: holidays

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Holiday name |
| `date` | Date | Yes | Date |
| `year` | Number | Yes | Year |
| `type` | String | Yes | National/Regional/Company/Festival/Optional |
| `locations` | [String] | Yes | Applicable locations |
| `is_optional` | Boolean | No | Optional holiday |
| `is_paid` | Boolean | Yes | Paid holiday |
| `color` | String | No | Calendar color |

**Indexes**: `{ year: 1, location: 1 }`, `{ date: 1 }`

---

## Collection: performance_cycles

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Cycle name |
| `type` | String | Yes | Annual/HalfYearly/Quarterly |
| `start_date` | Date | Yes | Start |
| `end_date` | Date | Yes | End |
| `phases` | Object | Yes | Phase timings |
| `status` | String | Yes | Enum |

---

## Collection: training_courses

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Course title |
| `description` | String | Yes | Description |
| `category` | String | Yes | Category enum |
| `duration` | Object | Yes | Duration object |
| `mode` | String | Yes | Classroom/Virtual/ELearning |
| `skills` | [String] | No | Skills |
| `certification_offered` | Boolean | No | Cert available |
| `certification_validity_months` | Number | No | Cert validity |

---

## Collection: assets

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `asset_tag` | String | Yes | AST-XXXXX |
| `type` | String | Yes | Asset type |
| `category` | String | Yes | Category |
| `brand` | String | Yes | Brand |
| `model` | String | Yes | Model |
| `serial_number` | String | Yes | Serial number |
| `purchase_date` | Date | Yes | Purchase date |
| `purchase_cost` | Number | Yes | Cost |
| `warranty_expiry` | Date | No | Warranty |
| `status` | String | Yes | Available/Allocated/etc. |
| `current_allocation` | ObjectId | No | Active allocation |

---

## Collection: tickets (helpdesk)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `ticket_id` | String | Yes | TK-XXXXX |
| `subject` | String | Yes | Subject |
| `description` | String | Yes | Description |
| `category` | String | Yes | HR/IT/Admin/etc. |
| `priority` | String | Yes | Low/Medium/High/Critical |
| `status` | String | Yes | Open/InProgress/Resolved/Closed |
| `requestor_id` | ObjectId | Yes | Creator |
| `assigned_to` | ObjectId | No | Assigned agent |
| `sla_deadline` | Date | No | SLA time |
| `sla_breached` | Boolean | No | SLA breached |
| `resolution` | String | No | Resolution notes |

**Indexes**: `{ status: 1, priority: -1 }`, `{ requestor_id: 1 }`, `{ assigned_to: 1, status: 1 }`

---

## Collection: travel_requests

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `employee_id` | ObjectId | Yes | Traveler |
| `purpose` | String | Yes | Purpose |
| `travel_type` | String | Yes | Domestic/International |
| `from_location` | String | Yes | Origin |
| `to_location` | String | Yes | Destination |
| `departure_date` | Date | Yes | Departure |
| `return_date` | Date | Yes | Return |
| `estimated_cost` | Number | Yes | Estimated cost |
| `status` | String | Yes | Enum |

---

## Collection: expense_claims

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `employee_id` | ObjectId | Yes | Claimant |
| `travel_request_id` | ObjectId | No | Linked travel |
| `title` | String | Yes | Claim title |
| `total_amount` | Number | Yes | Total |
| `currency` | String | Yes | Currency code |
| `status` | String | Yes | Enum |
| `expense_items` | [Object] | Yes | Line items |

---

## Collection: assets_allocations

See asset management module for details.

## Collection: bgv_records

See onboarding module for details.

## Collection: onboarding_tasks

See onboarding module for details.

## Collection: shift_rosters

See shift management module for details.

## Collection: shift_swap_requests

See shift management module for details.

## Collection: overtime_requests

See attendance module for details.

## Collection: regularization_requests

See attendance module for details.

## Collection: offers (recruitment)

See recruitment module for details.

## Collection: interviews

See recruitment module for details.

## Collection: separation_records

See separation module for details.

## Collection: clearance_checklist

See separation module for details.

## Collection: fnf_settlements

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `employee_id` | ObjectId | Yes | Employee ref |
| `separation_id` | ObjectId | Yes | Separation ref |
| `initiated_date` | Date | Yes | Initiation |
| `last_working_date` | Date | Yes | LWD |
| `status` | String | Yes | Enum |
| `earnings` | Object | Yes | Payable breakdown |
| `deductions` | Object | Yes | Recovery breakdown |
| `net_settlement_amount` | Number | Yes | Net payable |
| `clearance_status` | Object | Yes | Dept clearances |

---

## Collection: documents (employee documents)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `employee_id` | ObjectId | Yes | Employee ref |
| `document_type` | String | Yes | Document type |
| `title` | String | Yes | Title |
| `file_url` | String | Yes | S3 URL |
| `file_size` | Number | No | Bytes |
| `version` | Number | Yes | Version |
| `is_signed` | Boolean | No | E-signed |
| `expiry_date` | Date | No | Expiry |

---

## Collection: surveys (engagement)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Survey title |
| `type` | String | Yes | Survey type |
| `questions` | [Object] | Yes | Questions |
| `target_audience` | Object | Yes | Audience filter |
| `start_date` | Date | Yes | Start |
| `end_date` | Date | Yes | End |
| `is_anonymous` | Boolean | No | Anonymous |
| `status` | String | Yes | Draft/Active/Closed |

---

## Collection: roles

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Yes | Role name |
| `description` | String | No | Description |
| `permissions` | [Object] | Yes | Permission matrix |
| `is_system` | Boolean | Yes | System role |

---

## Collection: audit_logs

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `actor_id` | ObjectId | Yes | User who acted |
| `actor_name` | String | Yes | Display name |
| `action` | String | Yes | Action performed |
| `resource` | String | Yes | Resource type |
| `resource_id` | ObjectId | No | Resource ID |
| `module` | String | Yes | Module name |
| `changes` | Object | No | Before/after diff |
| `ip_address` | String | Yes | Request IP |
| `user_agent` | String | No | Browser info |
| `status` | String | Yes | Success/Failure |
| `timestamp` | Date | Auto | Event time |

**Indexes**: `{ timestamp: -1 }`, `{ actor_id: 1, timestamp: -1 }`, `{ resource: 1, resource_id: 1 }`, `{ module: 1, timestamp: -1 }`

---

## Collection: settings

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Primary key |
| `key` | String | Yes | Setting key |
| `value` | Mixed | Yes | Setting value |
| `type` | String | Yes | String/Number/Boolean/JSON |
| `module` | String | No | Module scope |
| `description` | String | No | Description |
| `is_encrypted` | Boolean | No | Sensitive flag |

---

## Relationships Diagram

```
users ──1:1──> employees
employees ──N:1──> departments
employees ──N:1──> designations
employees ──N:1──> grades
employees ──N:1──> employees (manager)

leave_applications ──N:1──> employees
leave_applications ──N:1──> leave_types
leave_balances ──N:1──> employees

attendance_records ──N:1──> employees

payslips ──N:1──> employees
payslips ──N:1──> payroll_runs

recruitments (requisitions) ──N:1──> departments
applicants ──N:1──> recruitments
interviews ──N:1──> applicants

onboarding_records ──1:1──> employees

assets ──N:1──> employees (via allocations)

tickets ──N:1──> employees (requestor)
tickets ──N:1──> employees (assignee)

travel_requests ──N:1──> employees
expense_claims ──N:1──> employees

separation_records ──1:1──> employees
fnf_settlements ──1:1──> employees

performance_cycles ──N:N──> employees (via reviews/goals)

training_sessions ──N:N──> employees (via enrollment)

audit_logs ──N:1──> users
```

---

## Data Type Mapping

| MongoDB Type | Mongoose Type | Usage |
|--------------|---------------|-------|
| ObjectId | Schema.Types.ObjectId | References |
| String | String | Text fields, enums |
| Number | Number | Numeric values |
| Date | Date | Timestamps, dates |
| Boolean | Boolean | Flags |
| Array | [] | Lists |
| Object | {} | Nested data |
| Map | Schema.Types.Map | Dynamic fields |
| Mixed | Schema.Types.Mixed | Flexible data |
| Decimal128 | Schema.Types.Decimal128 | Monetary values |

---

## Naming Conventions

- **Collections**: snake_case, plural (e.g., `leave_applications`)
- **Fields**: snake_case (e.g., `employee_id`, `date_of_joining`)
- **Indexes**: Named as `{field}_{direction}` (e.g., `employee_id_1_date_-1`)
- **Foreign Keys**: `{referenced_collection}_id` (e.g., `employee_id`)
- **Timestamps**: `created_at`, `updated_at`
- **Enums**: PascalCase for values (e.g., "Pending", "Approved")
