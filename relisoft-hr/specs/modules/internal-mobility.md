# Internal Mobility Module Specification

## Overview

The Internal Mobility module enables employees to discover and apply for internal job opportunities. It promotes talent retention by providing career growth paths within the organization through a transparent job marketplace.

**Scope**: Internal job postings, employee applications, transfer management, skills matching.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Internal Job Postings | HR publishes roles open for internal candidates | P0 |
| Job Marketplace | Searchable dashboard of all internal openings | P0 |
| Employee Applications | Apply with profile, resume, and cover note | P0 |
| Manager Notification | Notify current manager of application | P1 |
| Transfer Workflow | Approval workflow: current manager → new manager → HR | P0 |
| Skills Matching | Auto-match employee skills to job requirements | P1 |
| Mobility History | Track employee movement across roles | P1 |
| Talent Marketplace Analytics | Internal fill rate, mobility trends | P1 |

---

## Data Model

### InternalJobPosting Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Job title |
| `department` | String | Yes | Department |
| `location` | String | Yes | Work location |
| `employmentType` | Enum | Yes | Permanent, Contract, Secondment |
| `description` | String | Yes | Role description |
| `requirements` | String | Yes | Eligibility criteria |
| `grade` | String | No | Grade level |
| `postedDate` | Date | Yes | Posting date |
| `closingDate` | Date | No | Application deadline |
| `status` | Enum | Yes | Open, Closed, Filled, Cancelled |
| `postedBy` | ObjectId (Employee) | Yes | HR publisher |

### InternalApplication Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `posting` | ObjectId (InternalJobPosting) | Yes | Job reference |
| `employee` | ObjectId (Employee) | Yes | Applicant |
| `resume` | String | No | Resume URL |
| `coverNote` | String | No | Cover letter |
| `status` | Enum | Yes | Applied, UnderReview, Shortlisted, Interviewed, Offered, Accepted, Rejected |
| `currentManagerApproved` | Boolean | No | Manager consent |
| `newManagerApproved` | Boolean | No | New manager approval |
| `approvedBy` | ObjectId (Employee) | No | HR approver |
| `proposedStartDate` | Date | No | Transfer date |

---

## API Endpoints

### `POST /api/internal-mobility/postings`
Create internal job posting.

### `GET /api/internal-mobility/postings`
List open postings.

### `POST /api/internal-mobility/applications`
Apply to internal job.

### `GET /api/internal-mobility/applications/:employeeId`
Get employee applications.

### `PUT /api/internal-mobility/applications/:id/status`
Update application status.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `JobMarketplace` | Searchable grid of internal openings |
| `JobDetailCard` | Role details with eligibility and apply button |
| `ApplicationForm` | Apply with profile data and cover note |
| `ApplicationTracker` | Track application status timeline |
| `MobilityDashboard` | Internal fill rates and trends |
