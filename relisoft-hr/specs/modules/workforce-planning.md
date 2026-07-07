# Workforce Planning Module Specification

## Overview

The Workforce Planning module enables strategic manpower planning with budgeted vs actual headcount tracking, hiring forecasts, and gap analysis. It provides HR and leadership with data-driven insights for workforce optimization.

**Scope**: Manpower budgeting, headcount tracking, hiring forecasts, attrition modeling, scenario planning.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Manpower Budgeting | Define budgeted headcount by department, role, grade | P0 |
| Headcount Tracking | Track actual vs budgeted headcount in real-time | P0 |
| Hiring Forecast | Predict hiring needs based on attrition and growth | P0 |
| Gap Analysis | Identify surplus/deficit by department and role | P0 |
| Scenario Planning | Model what-if scenarios (growth, attrition, reorg) | P1 |
| Attrition Modeling | Predict attrition rates and plan replacements | P1 |
| Budget vs Actual Reports | Period-wise manpower cost reports | P1 |
| Workforce Dashboard | Executive view of workforce metrics | P0 |

---

## Data Model

### ManpowerPlan Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fiscalYear` | String | Yes | Fiscal year (e.g., FY2026-27) |
| `department` | String | Yes | Department name |
| `budgetedHeadcount` | Number | Yes | Approved headcount |
| `actualHeadcount` | Number | Yes | Current filled positions |
| `budgetedCost` | Number | Yes | Budgeted salary cost |
| `actualCost` | Number | Yes | Actual salary cost |
| `openPositions` | Number | Yes | Unfilled positions |
| `attritionRate` | Number | No | Department attrition % |
| `plannedHires` | Number | No | Planned new hires |
| `forecastedHeadcount` | Number | No | End-of-period forecast |
| `quarter` | String | No | Q1, Q2, Q3, Q4 |
| `notes` | String | No | Planning notes |

### HiringForecast Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `department` | String | Yes | Department |
| `role` | String | Yes | Job role |
| `priority` | Enum | Yes | Critical, High, Medium, Low |
| `estimatedCount` | Number | Yes | Positions to fill |
| `timeline` | Enum | Yes | Immediate, ThisQuarter, NextQuarter, NextYear |
| `estimatedBudget` | Number | No | Budget allocation |
| `justification` | String | No | Business justification |
| `status` | Enum | Yes | Approved, Pending, OnHold, Filled |
| `createdBy` | ObjectId (Employee) | Yes | Requisition creator |

---

## API Endpoints

### `POST /api/workforce/plans`
Create manpower plan.

### `GET /api/workforce/plans`
List plans with filters.

### `PUT /api/workforce/plans/:id`
Update plan.

### `GET /api/workforce/forecasts`
Get hiring forecasts.

### `POST /api/workforce/forecasts`
Create forecast.

### `GET /api/workforce/dashboard`
Executive workforce dashboard.

### `GET /api/workforce/gap-analysis`
Headcount gap analysis.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `ManpowerPlanTable` | Budget vs actual headcount by department |
| `HiringForecastBoard` | Pipeline of planned hires with timelines |
| `GapAnalysisChart` | Visual surplus/deficit indicators |
| `WorkforceDashboard` | Executive KPIs: headcount, cost, attrition |
| `ScenarioSimulator` | What-if planning interface |
