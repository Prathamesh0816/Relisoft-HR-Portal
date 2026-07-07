# Benefits Administration Module Specification

## Overview

The Benefits Administration module manages employee benefits including insurance, wellness programs, reimbursements, and benefits enrollment. It provides self-service enrollment, eligibility management, and vendor integration.

**Scope**: Insurance plans, wellness benefits, reimbursements, benefits enrollment, dependent management.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Benefits Catalog | Configurable list of available benefits | P0 |
| Benefits Enrollment | Self-service enrollment during open enrollment | P0 |
| Insurance Plans | Health, dental, life, accident insurance | P0 |
| Wellness Benefits | Gym, health checkup, wellness program benefits | P1 |
| Reimbursements | Medical, travel, education reimbursements | P1 |
| Dependent Management | Add/manage dependents for insurance | P1 |
| Eligibility Rules | Role/grade/tenure-based benefit eligibility | P0 |
| Vendor Integration | Connect with insurance/benefits vendors | P1 |

---

## Data Model

### BenefitPlan Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Plan name |
| `type` | Enum | Yes | HealthInsurance, Dental, Life, Accidental, Wellness, Reimbursement, Others |
| `provider` | String | No | Vendor/insurer name |
| `description` | String | Yes | Plan details |
| `coverageAmount` | Number | No | Sum insured |
| `premium` | Number | No | Premium amount |
| `eligibilityRules` | Object | No | Grade, tenure, employment type rules |
| `isActive` | Boolean | Yes | Active flag |
| `enrollmentPeriod` | Object | No | Open enrollment dates |

### EmployeeBenefit Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employee` | ObjectId (Employee) | Yes | Employee |
| `plan` | ObjectId (BenefitPlan) | Yes | Benefit plan |
| `status` | Enum | Yes | Enrolled, Waived, Pending, Inactive |
| `enrolledAt` | Date | Yes | Enrollment date |
| `dependents` | Array | No | Covered dependents |
| `nominees` | Array | No | Nominee details |
| `coverageStart` | Date | No | Coverage effective date |
| `coverageEnd` | Date | No | Coverage end date |

---

## API Endpoints

### `GET /api/benefits/plans`
List available benefit plans.

### `POST /api/benefits/enroll`
Enroll in a benefit plan.

### `GET /api/benefits/my-benefits`
Get employee's enrolled benefits.

### `PUT /api/benefits/plans/:id`
Update plan configuration.

### `POST /api/benefits/dependents`
Add dependent.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `BenefitsCatalog` | Browse available benefit plans |
| `EnrollmentWizard` | Step-by-step enrollment process |
| `MyBenefitsCard` | Currently enrolled benefits summary |
| `DependentManager` | Add/edit dependents |
| `BenefitsDashboard` | Admin view of enrollment stats |
