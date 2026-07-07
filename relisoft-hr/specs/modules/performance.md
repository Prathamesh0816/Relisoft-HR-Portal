# Performance Management Module Specification

## Overview

The Performance Management module handles goal setting (KPI/KRA), performance appraisals, ratings, feedback, and performance reviews. It supports continuous performance management alongside periodic appraisal cycles.

**Scope**: KPI/KRA definitions, goal setting, appraisal cycles, self-assessment, manager review, ratings, performance improvement plans (PIP).

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| KPI/KRA Library | Predefined KPI/KRA templates per role/department | P0 |
| Goal Setting | Employee-manager joint goal setting for cycle | P0 |
| Appraisal Cycles | Configure appraisal periods (annual, half-yearly, quarterly) | P0 |
| Self Assessment | Employee self-rating and comments | P0 |
| Manager Review | Manager evaluation and rating | P0 |
| 360 Feedback | Peer, subordinate, and stakeholder feedback collection | P1 |
| Rating System | Configurable rating scales (1-5, 1-10, etc.) | P0 |
| Performance Ratings | Overall rating with calibration | P0 |
| Performance Improvement Plan | PIP creation and tracking | P1 |
| Appraisal Documents | Generate appraisal summary PDF | P1 |
| Calibration | Manager calibration meetings support | P1 |

---

## Data Model

### Performance Cycle Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Cycle name (H1 2024, Annual 2023-24) |
| `type` | Enum | Yes | Annual, HalfYearly, Quarterly, Monthly |
| `startDate` | Date | Yes | Cycle start |
| `endDate` | Date | Yes | Cycle end |
| `phases` | Object | Yes | Phase timings |
| `phases.goalSettingStart` | Date | Yes | Goal setting period |
| `phases.goalSettingEnd` | Date | Yes | Goal setting deadline |
| `phases.selfAssessmentStart` | Date | Yes | Self-assessment period |
| `phases.midYearReviewStart` | Date | No | Mid-year review |
| `phases.managerReviewStart` | Date | Yes | Manager review period |
| `phases.managerReviewEnd` | Date | Yes | Manager review deadline |
| `phases.calibrationStart` | Date | No | Calibration period |
| `phases.resultPublishDate` | Date | Yes | Results published |
| `status` | Enum | Yes | Draft, Active, GoalSetting, SelfReview, ManagerReview, Calibration, Completed |

### Goal/KRA Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `cycleId` | ObjectId (PerformanceCycle) | Yes | Appraisal cycle |
| `goals` | Array | Yes | Individual goals |
| `goals[].title` | String | Yes | Goal title |
| `goals[].description` | String | Yes | Detailed description |
| `goals[].kpiType` | Enum | No | Quantitative, Qualitative, Project, Behavioral |
| `goals[].weightage` | Number | Yes | Weightage percentage |
| `goals[].targetValue` | Mixed | No | Target metric |
| `goals[].actualValue` | Mixed | No | Achieved value |
| `goals[].selfRating` | Number | No | Self rating (1-5) |
| `goals[].selfComment` | String | No | Self comments |
| `goals[].managerRating` | Number | No | Manager rating |
| `goals[].managerComment` | String | No | Manager comments |
| `status` | Enum | Yes | Draft, Submitted, Reviewed, Agreed |

### Performance Review Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `cycleId` | ObjectId (PerformanceCycle) | Yes | Cycle |
| `managerId` | ObjectId (Employee) | Yes | Reviewing manager |
| `overallSelfRating` | Number | No | Overall self rating |
| `overallManagerRating` | Number | No | Overall manager rating |
| `calibratedRating` | Number | No | Post-calibration rating |
| `overallComments` | String | No | Manager overall comments |
| `developmentAreas` | Array | No | Areas for improvement |
| `strengths` | Array | No | Key strengths |
| `trainingNeeds` | Array | No | Recommended training |
| `promotionRecommendation` | Boolean | No | Promotion recommended |
| `status` | Enum | Yes | Pending, SelfSubmitted, ManagerReviewed, Calibrated, Completed |

---

## API Endpoints

### `POST /api/v1/performance/cycles`
Create performance cycle.

### `GET /api/v1/performance/cycles/active`
Get active cycle.

### `POST /api/v1/performance/goals`
Set goals for employee.

**Request Body**:
```json
{
  "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
  "cycleId": "664a1b2c3d4e5f6a7b8c9d60",
  "goals": [
    {
      "title": "Reduce production incidents by 30%",
      "description": "Implement monitoring and automated alerting to reduce P1 incidents",
      "kpiType": "Quantitative",
      "weightage": 30,
      "targetValue": "30% reduction"
    },
    {
      "title": "Complete 2 major feature releases",
      "description": "Deliver payroll module and attendance module on schedule",
      "kpiType": "Project",
      "weightage": 40,
      "targetValue": "2 releases"
    },
    {
      "title": "Mentor 2 junior developers",
      "description": "Guide junior team members through code reviews and pair programming",
      "kpiType": "Behavioral",
      "weightage": 15
    }
  ]
}
```

### `PUT /api/v1/performance/goals/:id/submit`
Submit goals for review.

### `PUT /api/v1/performance/goals/:id/review`
Manager reviews employee goals.

### `POST /api/v1/performance/reviews/self-submit`
Submit self-assessment.

### `PUT /api/v1/performance/reviews/:id/manager-review`
Manager submits final review.

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeId": { "_id": "...", "name": "John Doe" },
    "overallManagerRating": 4.2,
    "overallComments": "John has exceeded expectations this cycle...",
    "strengths": ["Technical leadership", "Problem solving", "Team collaboration"],
    "developmentAreas": ["Cloud architecture skills", "Stakeholder communication"],
    "trainingNeeds": ["AWS Solution Architect certification"],
    "promotionRecommendation": true
  }
}
```

---

## Business Rules

1. Goals must be set within first 30 days of cycle; auto-reminder at 15 days
2. Combined goal weightage must equal 100%
3. Maximum 8 goals per employee per cycle
4. Self-assessment must be submitted before manager review begins
5. Manager cannot change self-rating on individual goals without commenting
6. Ratings calibrated across department to ensure distribution (forced curve if configured)
7. PIP automatically triggered if overall rating < 2.0 (on 5-point scale)
8. Promotion recommendation requires minimum 4.0 rating and 18 months in current grade
9. Employees with <3 months tenure in cycle are excluded from formal rating
10. All reviews archived for minimum 5 years for compliance

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Goal Suggestion | Generator | Suggest relevant KPIs/KRAs based on role and industry |
| Feedback Analysis | NLP | Analyze sentiment and themes in review comments |
| Bias Detection | Auditor | Flag potential bias in ratings (gender, tenure, location) |
| Performance Trends | Analyzer | Identify performance patterns over multiple cycles |
| Training Recommendations | Recommender | Suggest training programs based on development areas |
| Summary Generation | Generator | Auto-generate performance review summary |

---

## Permissions

| Role | Goals | Self Review | Manager Review | All Reviews | Cycles Config |
|------|-------|-------------|----------------|-------------|---------------|
| SuperAdmin | All | Own | All | All | Yes |
| Admin | All | Own | All | All | Yes |
| HR | View All | Own | No | Read All | Yes |
| Manager | Own + Team | Own | Team | Team | No |
| Employee | Own | Own | No | No | No |
