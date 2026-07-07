# Training Module Specification

## Overview

The Training Management module handles training program setup, session scheduling, participant enrollment, certification tracking, and training effectiveness evaluation. It integrates with Performance Management for skill gap analysis.

**Scope**: Training calendar, course catalog, enrollment, attendance, certifications, feedback, training budget.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Course Catalog | Training courses with descriptions, duration, prerequisites | P0 |
| Training Calendar | Schedule training sessions, workshops, webinars | P0 |
| Enrollment | Self/manager/nominative enrollment | P0 |
| Attendance Tracking | Record training attendance | P1 |
| Certifications | Track certifications, expiry, renewals | P1 |
| Feedback & Evaluation | Post-training feedback collection | P1 |
| Training Budget | Department-wise training budget tracking | P2 |
| Skill Gap Mapping | Map training to skills, identify gaps | P2 |

---

## Data Model

### Training Course Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Course title |
| `description` | String | Yes | Course description |
| `category` | Enum | Yes | Technical, SoftSkills, Compliance, Leadership, Domain |
| `duration` | Object | Yes | Duration details |
| `duration.hours` | Number | Yes | Total hours |
| `duration.type` | Enum | Yes | Hours, Days, Weeks |
| `mode` | Enum | Yes | Classroom, Virtual, ELearning, Blended |
| `skills` | Array | No | Skills this course covers |
| `prerequisites` | Array | No | Prerequisite course IDs |
| `certificationOffered` | Boolean | No | Certification awarded |
| `certificationValidityMonths` | Number | No | Cert validity period |
| `maxParticipants` | Number | No | Max class size |
| `cost` | Number | No | Cost per participant |

### Training Session Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `courseId` | ObjectId (Course) | Yes | Course reference |
| `trainerName` | String | Yes | Trainer/instructor |
| `trainerEmail` | String | No | Trainer contact |
| `startDate` | Date | Yes | Session start |
| `endDate` | Date | Yes | Session end |
| `location` | String | No | Physical/Virtual location |
| `meetingLink` | String | No | Virtual meeting link |
| `status` | Enum | Yes | Scheduled, InProgress, Completed, Cancelled |
| `participants` | Array | No | Enrolled participants |
| `participants[].employeeId` | ObjectId (Employee) | Yes | Attendee |
| `participants[].enrollmentDate` | Date | Yes | Enrolled on |
| `participants[].enrollmentType` | Enum | Yes | Self, Manager, HR, Mandatory |
| `participants[].attendance` | Enum | No | NotMarked, Present, Absent, Partial |
| `participants[].completionStatus` | Enum | No | Enrolled, InProgress, Completed, Dropped |
| `participants[].certificateUrl` | String | No | Certificate URL |

### Training Feedback Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | ObjectId (Session) | Yes | Session reference |
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `rating` | Number | Yes | 1-5 rating |
| `contentRelevance` | Number | No | Content rating |
| `trainerEffectiveness` | Number | No | Trainer rating |
| `comments` | String | No | Open feedback |

---

## API Endpoints

### `GET /api/v1/training/courses`
Browse course catalog.

### `POST /api/v1/training/sessions`
Create training session.

**Request Body**:
```json
{
  "courseId": "664...",
  "trainerName": "Dr. Rajesh Kumar",
  "trainerEmail": "rajesh@training.com",
  "startDate": "2024-08-15",
  "endDate": "2024-08-16",
  "mode": "Classroom",
  "location": "Training Room 3, Bangalore",
  "maxParticipants": 20
}
```

### `POST /api/v1/training/enroll`
Enroll in training session.

### `PUT /api/v1/training/sessions/:id/attendance`
Mark attendance.

### `POST /api/v1/training/feedback`
Submit training feedback.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `TrainingCatalog` | Browse/search course catalog |
| `TrainingCalendar` | Scheduled training sessions view |
| `EnrollmentForm` | Self/manager enrollment |
| `CertificationTracker` | Employee certification status |
| `TrainingDashboard` | Training hours, completion rates, budget |
| `FeedbackForm` | Post-training feedback survey |
| `TrainerAssignmentPanel` | Admin training scheduling |

---

## Business Rules

1. Mandatory trainings auto-enrolled for all employees (compliance, POSH, etc.)
2. Minimum 5 participants required for classroom session to run
3. Certification renewal reminder sent 90 days before expiry
4. Budget check before enrollment; department head approval required if over budget
5. Training hours tracked per employee per year; minimum training hour requirement enforced

---

## Permissions

| Role | Courses | Sessions | Enroll | Feedback | Certifications |
|------|---------|----------|--------|----------|----------------|
| SuperAdmin | Full | Full | Full | Own | All |
| Admin | Full | Full | Full | Own | All |
| HR | CRUD | CRUD | All | Own | All |
| Manager | Read | Read | Team | Own | Team View |
| Employee | Read | Read | Self | Own | Own View |
