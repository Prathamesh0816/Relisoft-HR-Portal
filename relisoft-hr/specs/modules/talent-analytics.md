# Talent Analytics Module Specification

## Overview

The Talent Analytics module provides deep workforce insights including performance vs potential analysis, talent segmentation, flight risk assessment, and succession readiness. It helps leadership identify top talent, address gaps, and make data-driven people decisions.

**Scope**: Talent segmentation, performance vs potential matrix, flight risk scoring, succession readiness, talent review dashboards.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Performance vs Potential Matrix | 9-box grid for talent segmentation | P0 |
| Talent Segmentation | Categorize employees into High Potential, Core, Underperformers, etc. | P0 |
| Flight Risk Scoring | ML-based probability of voluntary attrition | P0 |
| Succession Readiness | Identify ready-now and ready-future successors | P0 |
| Talent Review Dashboard | Quarterly talent review with heatmaps | P1 |
| Bench Strength Analysis | Depth of talent by role and department | P1 |
| Leadership Pipeline | Track leadership readiness across levels | P1 |
| Key Person Dependency | Identify single points of failure | P1 |

---

## Data Model

### TalentProfile Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employee` | ObjectId (Employee) | Yes | Employee reference |
| `performanceRating` | Number | No | Latest performance rating (1-5) |
| `potentialRating` | Number | No | Potential assessment (1-5) |
| `talentSegment` | Enum | No | HighPotential, Core, Underperformer, Emerging, Specialist |
| `flightRiskScore` | Number | No | 0-100 flight risk probability |
| `successionReadiness` | Enum | No | ReadyNow, ReadyFuture, NotReady |
| `criticalRoleFlag` | Boolean | No | Key person indicator |
| `leadershipTier` | Enum | No | Entry, Mid, Senior, Executive |
| `developmentNeeds` | Array | No | Skill development areas |
| `lastReviewDate` | Date | No | Last talent review date |
| `notes` | String | No | Reviewer notes |

### TalentReview Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reviewCycle` | String | Yes | e.g., Q1-2026 |
| `participants` | Array | Yes | Employees in this review |
| `facilitator` | ObjectId (Employee) | Yes | Talent review lead |
| `status` | Enum | Yes | Scheduled, InProgress, Completed |
| `decisions` | Array | No | Promotion, Development, Rotation decisions |
| `completedAt` | Date | No | Completion date |

---

## API Endpoints

### `GET /api/talent-analytics/matrix`
Get 9-box performance vs potential matrix.

### `GET /api/talent-analytics/segments`
Get talent segment distribution.

### `GET /api/talent-analytics/flight-risk`
Get flight risk scores.

### `GET /api/talent-analytics/succession`
Get succession pipeline.

### `GET /api/talent-analytics/bench-strength`
Get bench strength by department.

### `POST /api/talent-analytics/reviews`
Create talent review cycle.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `NineBoxMatrix` | Interactive 9-box performance vs potential chart |
| `TalentHeatMap` | Department-wise talent distribution heatmap |
| `FlightRiskList` | Ranked list of at-risk employees |
| `SuccessionPipeline` | Visual succession readiness chart |
| `BenchStrengthChart` | Depth chart by role and department |
| `TalentReviewWorkspace` | Facilitated talent review session interface |
