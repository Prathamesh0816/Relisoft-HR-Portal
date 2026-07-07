# Employee Engagement Module Specification

## Overview

The Employee Engagement module manages surveys, feedback collection, employee recognition, and engagement analytics to measure and improve workplace satisfaction and culture.

**Scope**: Surveys (pulse, engagement, NPS), feedback, employee recognition, kudos, engagement analytics.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Pulse Surveys | Short frequent surveys (weekly/bi-weekly) | P0 |
| Engagement Surveys | Comprehensive annual/bi-annual engagement surveys | P0 |
| eNPS | Employee Net Promoter Score tracking | P0 |
| Kudos & Recognition | Peer-to-peer recognition with points/badges | P1 |
| Feedback Channels | Anonymous feedback, suggestion box | P1 |
| Survey Analytics | Results dashboard, trend analysis | P0 |
| Manager Feedback | Skip-level feedback collection | P2 |

---

## Data Model

### Survey Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Survey title |
| `type` | Enum | Yes | Pulse, Engagement, eNPS, Exit, OnboardingFeedback, TrainingFeedback, Custom |
| `description` | String | No | Description |
| `questions` | Array | Yes | Questions |
| `questions[].id` | String | Yes | Question ID |
| `questions[].text` | String | Yes | Question text |
| `questions[].type` | Enum | Yes | Rating1to5, Rating1to10, YesNo, MultipleChoice, Text, NPS |
| `questions[].options` | Array | No | MCQ options |
| `questions[].required` | Boolean | No | Required |
| `targetAudience` | Object | Yes | Audience filter |
| `targetAudience.departments` | Array | No | Department filter |
| `targetAudience.locations` | Array | No | Location filter |
| `targetAudience.employmentTypes` | Array | No | Employment type |
| `startDate` | Date | Yes | Survey start |
| `endDate` | Date | Yes | Survey end |
| `isAnonymous` | Boolean | No | Anonymous responses |
| `status` | Enum | Yes | Draft, Scheduled, Active, Closed, Archived |

### Survey Response Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `surveyId` | ObjectId (Survey) | Yes | Survey |
| `employeeId` | ObjectId (Employee) | No | Nullable if anonymous |
| `answers` | Array | Yes | Response answers |
| `submittedAt` | Date | Yes | Submission time |
| `isAnonymous` | Boolean | Yes | Anonymous flag |

### Recognition Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fromEmployeeId` | ObjectId (Employee) | Yes | Who gave recognition |
| `toEmployeeId` | ObjectId (Employee) | Yes | Who received |
| `type` | Enum | Yes | Kudos, ThankYou, AboveAndBeyond, ValuesAligned, PeerAward |
| `message` | String | Yes | Recognition message |
| `badge` | String | No | Badge type |
| `points` | Number | No | Points awarded |
| `isPublic` | Boolean | No | Visible on feed |

---

## API Endpoints

### `POST /api/v1/engagement/surveys`
Create survey.

### `GET /api/v1/engagement/surveys/pending`
Get pending surveys for current user.

### `POST /api/v1/engagement/surveys/:id/respond`
Submit survey response.

### `GET /api/v1/engagement/surveys/:id/results`
Survey results and analytics.

### `POST /api/v1/engagement/recognition`
Give recognition.

**Request Body**:
```json
{
  "toEmployeeId": "664...",
  "type": "Kudos",
  "message": "Great job on the critical production fix last night!",
  "badge": "Hero"
}
```

### `GET /api/v1/engagement/recognition/feed`
Public recognition feed.

### `GET /api/v1/engagement/dashboard`
Engagement metrics and trend.

---

## Business Rules

1. Pulse surveys limited to 5 questions, <2 min completion time
2. Survey results visible after min 10 responses or 50% participation
3. Anonymous surveys: HR cannot identify individual respondents
4. Participation rate must be >70% for engagement survey to be valid
5. Recognition points can be redeemed for rewards (if configured)
6. Quarterly engagement review with CHRO

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Sentiment Analysis | NLP | Analyze open-ended survey responses for sentiment |
| Engagement Prediction | Predictor | Predict disengagement risk based on response patterns |
| Trend Analysis | Analyzer | Detect engagement trends across departments/time |
| Suggestion Analysis | NLP | Categorize and prioritize employee suggestions |
| Chatbot Feedback | Chatbot | Collect quick feedback via conversational interface |

---

## Permissions

| Role | Surveys | Respond | Results | Recognition | Manage |
|------|---------|---------|---------|-------------|--------|
| SuperAdmin | Full | Yes | All | Full | Full |
| Admin | Full | Yes | All | Full | Full |
| HR | CRUD | Yes | All | Full | Yes |
| Manager | No | Yes | Team | Give | No |
| Employee | No | Yes | Own | Give/Receive | No |
