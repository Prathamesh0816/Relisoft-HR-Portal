# Recruitment Module Specification

## Overview

The Recruitment module (ATS - Applicant Tracking System) manages the entire hiring lifecycle from job requisition to offer acceptance. It includes job posting management, applicant tracking, interview scheduling, candidate evaluation, and offer management.

**Scope**: Job requisitions, job board posting, applicant tracking, resume parsing, interview management, candidate communication, offer letters, hiring analytics.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Job Requisition | Create and approve hiring requests with budget and headcount | P0 |
| Job Posting | Create and publish job descriptions to multiple boards | P0 |
| Applicant Tracking | Pipeline management: New → Screening → Interview → Offer → Hired | P0 |
| Resume Parsing | AI-powered auto-extraction of candidate details from resumes | P0 |
| Candidate Portal | External-facing career site for job applications | P1 |
| Interview Management | Schedule, manage feedback,评分 (rating) interviews | P0 |
| Offer Management | Generate, approve, and send offer letters | P0 |
| Background Check | Initiate and track background verification | P1 |
| Email Templates | Configurable email templates for candidate communication | P1 |
| Talent Pool | Database of past applicants for future roles | P1 |
| Hiring Dashboard | Metrics: time-to-hire, source effectiveness, pipeline health | P0 |
| Referral Management | Track employee referrals with rewards | P2 |

---

## Data Model

### Job Requisition Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requisitionId` | String | Yes | Auto-generated (REQ-XXXXX) |
| `title` | String | Yes | Job title |
| `departmentId` | ObjectId (Dept) | Yes | Department |
| `designationId` | ObjectId (Designation) | Yes | Target designation |
| `gradeId` | ObjectId (Grade) | Yes | Grade level |
| `employmentType` | Enum | Yes | Permanent, Contract, Intern |
| `vacancies` | Number | Yes | Number of positions |
| `location` | String | Yes | Work location |
| `minExperience` | Number | Yes | Minimum years of experience |
| `maxExperience` | Number | Yes | Maximum years of experience |
| `budgetedSalaryMin` | Number | No | Minimum budgeted salary |
| `budgetedSalaryMax` | Number | No | Maximum budgeted salary |
| `currency` | String | No | INR, USD, etc. |
| `description` | String | Yes | Full job description (HTML/Markdown) |
| `requirements` | Array | Yes | Key requirements/skills |
| `responsibilities` | Array | Yes | Key responsibilities |
| `status` | Enum | Yes | Draft, Open, InProgress, Filled, Cancelled, OnHold |
| `priority` | Enum | Yes | High, Medium, Low |
| `requestedBy` | ObjectId (Employee) | Yes | Requester |
| `approvedBy` | ObjectId (Employee) | No | Approver |
| `approvedAt` | Date | No | Approval date |
| `jobBoardIds` | Array | No | Published board IDs |
| `source` | Enum | No | Direct, Referral, Agency, Campus |

### Applicant Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requisitionId` | ObjectId (Requisition) | Yes | Applied job |
| `firstName` | String | Yes | First name |
| `lastName` | String | Yes | Last name |
| `email` | String | Yes | Email address |
| `phone` | String | Yes | Phone number |
| `currentCompany` | String | No | Current employer |
| `currentDesignation` | String | No | Current job title |
| `totalExperience` | Number | No | Years of experience |
| `skills` | Array | No | Skill tags |
| `education` | Object | No | Highest education details |
| `resumeUrl` | String | Yes | Uploaded resume path |
| `parsedData` | Object | No | AI-parsed resume data |
| `source` | Enum | Yes | CareerSite, LinkedIn, Naukri, Indeed, Referral, Agency, WalkIn |
| `referredBy` | ObjectId (Employee) | No | Employee who referred |
| `status` | Enum | Yes | New, Screening, Shortlisted, InterviewScheduled, Interviewed, Selected, Offered, Accepted, Hired, Rejected, Withdrawn |
| `stageHistory` | Array | No | Status change log |
| `ratings` | Array | No | Interview ratings |
| `notes` | Array | No | Recruiter notes |
| `appliedDate` | Date | Yes | Application date |
| `createdAt` | Date | Auto | Timestamp |

### Interview Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicantId` | ObjectId (Applicant) | Yes | Applicant reference |
| `requisitionId` | ObjectId (Requisition) | Yes | Job reference |
| `roundNumber` | Number | Yes | Interview round (1, 2, 3...) |
| `roundType` | Enum | Yes | Telephonic, Video, FaceToFace, Technical, HR, Managerial, GroupDiscussion, Assignment |
| `panelists` | Array of ObjectId (Employee) | Yes | Interviewers |
| `scheduledDate` | Date | Yes | Date |
| `startTime` | String | Yes | Start time (HH:mm) |
| `endTime` | String | Yes | End time (HH:mm) |
| `mode` | Enum | Yes | InPerson, VideoCall, Phone |
| `meetingLink` | String | No | Video meeting URL |
| `feedback` | Array | No | Panelist feedback |
| `feedback[].panelistId` | ObjectId (Employee) | Yes | Panelist |
| `feedback[].rating` | Number | Yes | 1-5 rating |
| `feedback[].strengths` | String | No | Key strengths |
| `feedback[].weaknesses` | String | No | Areas of improvement |
| `feedback[].recommendation` | Enum | Yes | StrongHire, Hire, Maybe, No |
| `feedback[].submittedAt` | Date | Yes | Submission time |
| `result` | Enum | No | Passed, Failed, OnHold |
| `nextRoundId` | ObjectId (Interview) | No | Next interview round |
| `status` | Enum | Yes | Scheduled, InProgress, Completed, Cancelled, Rescheduled |

### Offer Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicantId` | ObjectId (Applicant) | Yes | Applicant reference |
| `requisitionId` | ObjectId (Requisition) | Yes | Job reference |
| `offerDate` | Date | Yes | Offer date |
| `ctc` | Number | Yes | Total CTC |
| `breakup` | Object | Yes | Detailed compensation structure |
| `joiningDate` | Date | Yes | Expected joining date |
| `probationPeriod` | Number | Yes | Probation months |
| `status` | Enum | Yes | Draft, Approved, Sent, Accepted, Rejected, Countered, Expired |
| `offerLetterUrl` | String | No | Generated offer letter |
| `acceptanceDate` | Date | No | Date of acceptance |
| `counterDetails` | Object | No | Counter-offer details |
| `expiryDate` | Date | Yes | Offer expiry |

---

## API Endpoints

### `POST /api/v1/recruitment/requisitions`
Create job requisition.

**Request Body**:
```json
{
  "title": "Senior Software Engineer",
  "departmentId": "664a1b2c3d4e5f6a7b8c9d0f",
  "designationId": "664a1b2c3d4e5f6a7b8c9d10",
  "gradeId": "664a1b2c3d4e5f6a7b8c9d12",
  "employmentType": "Permanent",
  "vacancies": 3,
  "location": "Bangalore",
  "minExperience": 4,
  "maxExperience": 8,
  "budgetedSalaryMin": 1800000,
  "budgetedSalaryMax": 2500000,
  "description": "<h3>About the Role</h3><p>We are looking for...</p>",
  "requirements": ["Node.js", "React", "MongoDB", "AWS", "Microservices"],
  "responsibilities": ["Design and build scalable APIs", "Mentor junior developers"],
  "priority": "High"
}
```

### `GET /api/v1/recruitment/requisitions`
List job requisitions with filters.

### `GET /api/v1/recruitment/requisitions/:id`
Get requisition with applicant count and pipeline status.

### `GET /api/v1/recruitment/applicants?requisitionId=`
List applicants for a job with pipeline status.

### `POST /api/v1/recruitment/applicants/apply`
External candidate application.

**Request Body** (multipart):
```json
{
  "requisitionId": "664a1b2c3d4e5f6a7b8c9d40",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+91-9988776655",
  "currentCompany": "TechCorp",
  "currentDesignation": "Software Engineer",
  "totalExperience": 5,
  "skills": ["React", "Node.js", "Python"],
  "source": "LinkedIn"
}
// + resume file upload
```

### `PUT /api/v1/recruitment/applicants/:id/status`
Update applicant status (move pipeline stage).

**Request Body**:
```json
{
  "status": "Shortlisted",
  "remarks": "Strong technical background. Proceeding to tech screen.",
  "notifyCandidate": true
}
```

### `POST /api/v1/recruitment/interviews`
Schedule interview.

**Request Body**:
```json
{
  "applicantId": "664a1b2c3d4e5f6a7b8c9d50",
  "requisitionId": "664a1b2c3d4e5f6a7b8c9d40",
  "roundNumber": 1,
  "roundType": "Technical",
  "panelists": ["664a1b2c3d4e5f6a7b8c9d0e", "664a1b2c3d4e5f6a7b8c9d11"],
  "scheduledDate": "2024-06-05",
  "startTime": "10:00",
  "endTime": "11:00",
  "mode": "VideoCall",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}
```

### `POST /api/v1/recruitment/interviews/:id/feedback`
Submit interview feedback.

**Request Body**:
```json
{
  "panelistId": "664a1b2c3d4e5f6a7b8c9d0e",
  "rating": 4,
  "strengths": "Strong system design skills, good communication",
  "weaknesses": "Limited cloud experience",
  "recommendation": "Hire"
}
```

### `POST /api/v1/recruitment/offers`
Generate offer.

### `GET /api/v1/recruitment/dashboard`
Hiring metrics dashboard data.

**Response**:
```json
{
  "success": true,
  "data": {
    "openPositions": 12,
    "activeApplications": 245,
    "interviewsThisWeek": 18,
    "offersPending": 5,
    "offersAccepted": 3,
    "timeToHireAvg": 28.5,
    "sourceDistribution": {
      "LinkedIn": 35,
      "Naukri": 25,
      "Referral": 20,
      "CareerSite": 15,
      "Agency": 5
    },
    "pipelineFunnel": {
      "Applied": 245,
      "Screening": 120,
      "Shortlisted": 65,
      "Interviewed": 40,
      "Offered": 8,
      "Hired": 3
    }
  }
}
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `JobRequisitionForm` | Multi-section form for job creation |
| `JobBoardPublisher` | UI to publish jobs to LinkedIn, Naukri, Indeed |
| `KanbanPipeline` | Drag-and-drop pipeline board (New → Hired) |
| `ApplicantProfile` | Detailed candidate view with parsed resume, timeline |
| `InterviewScheduler` | Calendar-based scheduling with panelist availability |
| `InterviewFeedbackForm` | Structured feedback form with rating, recommendation |
| `OfferLetterGenerator` | Preview and approve offer letter |
| `CandidateCommunication` | Email/SMS composer with templates |
| `HiringDashboard` | Analytics dashboard with charts |
| `TalentPoolBrowser` | Search/browse past applicants |
| `ReferralPortal` | Employee referral submission form |
| `ResumeUploadZone` | Drag-and-drop resume upload with instant parsing |

---

## Business Rules

1. **Requisition Approval**: Requisitions > budget threshold require CFO approval; additional approver for C-level hires
2. **Pipeline Integrity**: Cannot skip pipeline stages; applicant must go through each stage sequentially
3. **Duplicate Detection**: System flags duplicate applicants (same email/phone) across open requisitions
4. **Interview Panel**: Minimum 2 panelists per interview; panelist cannot be from same department (if hiring for neutral assessment)
5. **Feedback Deadline**: Panelists must submit feedback within 24 hours of interview; auto-reminder at 12 hours
6. **Offer Validity**: Standard offer valid for 7 days; auto-expiry sends notification to recruiter
7. **Background Check**: Mandatory before final offer for senior positions; optional for other roles
8. **Data Retention**: Candidate data retained for 12 months in talent pool; consent required for extended storage
9. **Anti-Discrimination**: System enforces blind screening (hide name, photo, age) for initial review stage
10. **Rehire Eligibility**: Previous employees marked as "Not Eligible for Rehire" auto-rejected

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Resume Parsing | NLP Parser | Extract skills, experience, education, contact from resumes |
| Candidate Matching | Matcher | Score candidates against job requirements using semantic matching |
| Interview Question Generator | Generator | Suggest role-specific interview questions |
| Candidate Ranking | Ranker | Rank applicants by fit score for recruiter review |
| Skill Gap Analysis | Analyzer | Identify missing skills vs. job requirements |
| Offer Prediction | Predictor | Predict acceptance probability based on offer parameters |
| Email Drafting | Generator | Auto-draft personalized candidate communication |
| Chatbot Pre-screening | Chatbot | Automated initial screening questions via chat |

---

## Permissions

| Role | Requisitions | Applicants | Interviews | Offers | Dashboard |
|------|-------------|------------|------------|--------|-----------|
| SuperAdmin | Full | Full | Full | Full | Full |
| Admin | Full | Full | Full | Full | Full |
| HR | Create, Read All | Full | Full | Full | Full |
| Manager | Create, Read Own | View, Interview | Full (as panel) | View | View Own |
| Employee | View (open) | No | No | No | No |
| External (Candidate) | View (public) | Apply, View Own | View Own | View Own | No |
