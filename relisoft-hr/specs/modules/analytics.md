# Analytics & Reporting Module Specification

## Overview

The Analytics module provides dashboards, reports, and data insights across all HR modules. It supports real-time metrics, trend analysis, predictive analytics, and custom report building with export capabilities.

**Scope**: Executive dashboards, HR operational reports, trend analysis, headcount analytics, attrition analysis, payroll insights, custom reports.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Executive Dashboard | CEO/CHRO view: headcount, attrition, cost, engagement | P0 |
| HR Operational Reports | Daily/ weekly/ monthly HR operational metrics | P0 |
| Headcount Analytics | Department-wise, location-wise, grade-wise headcount | P0 |
| Attrition Analysis | Voluntary/ involuntary attrition, reason analysis, trends | P0 |
| Payroll Insights | Cost center analysis, CTC distribution, variance | P1 |
| Diversity Metrics | Gender, age, tenure distribution | P1 |
| Custom Reports | Drag-and-drop report builder | P1 |
| Report Scheduling | Scheduled email delivery of reports | P1 |
| Export | Export to PDF, Excel, CSV, PNG | P0 |
| Trend Forecasting | Predictive headcount and attrition forecasting | P2 |

---

## Data Model

### Report Definition Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Report name |
| `category` | Enum | Yes | Headcount, Attrition, Payroll, Attendance, Leave, Recruitment, Performance, Compliance |
| `type` | Enum | Yes | Table, BarChart, LineChart, PieChart, SummaryCard, HeatMap |
| `config` | Object | Yes | Report configuration (dimensions, measures, filters) |
| `isSystem` | Boolean | Yes | System-defined or custom |
| `createdBy` | ObjectId (User) | Yes | Creator |
| `schedules` | Array | No | Email schedule config |

### Dashboard Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Dashboard name |
| `ownerId` | ObjectId (User) | Yes | Dashboard owner |
| `widgets` | Array | Yes | Dashboard widgets |
| `widgets[].reportId` | ObjectId (Report) | Yes | Report reference |
| `widgets[].position` | Object | Yes | Grid position |
| `widgets[].size` | Object | Yes | Width & height |
| `isDefault` | Boolean | No | Default dashboard for role |
| `isPublic` | Boolean | No | Shared with others |

---

## API Endpoints

### `GET /api/v1/analytics/headcount`
Headcount summary.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalHeadcount": 450,
    "activeEmployees": 435,
    "contractors": 15,
    "departmentBreakdown": [
      { "department": "Engineering", "count": 150 },
      { "department": "Sales", "count": 80 },
      { "department": "Marketing", "count": 45 },
      { "department": "HR", "count": 25 },
      { "department": "Finance", "count": 30 }
    ],
    "genderDiversity": { "male": 280, "female": 165, "other": 5 },
    "avgTenure": 3.2,
    "avgAge": 31.5
  }
}
```

### `GET /api/v1/analytics/attrition?period=2024&quarter=Q2`
Attrition analysis.

### `GET /api/v1/analytics/payroll-summary?month=6&year=2024`
Payroll cost summary.

### `GET /api/v1/analytics/leave-trends?from=&to=`
Leave consumption trend.

### `GET /api/v1/analytics/recruitment-funnel?from=&to=`
Recruitment pipeline metrics.

### `POST /api/v1/analytics/reports`
Create custom report.

### `GET /api/v1/analytics/reports/:id/data`
Execute report and get data.

### `POST /api/v1/analytics/reports/:id/schedule`
Schedule report delivery.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `ExecutiveDashboard` | KPI cards, trending charts, attrition alerts |
| `HeadcountWidget` | Org chart with headcount numbers |
| `AttritionChart` | Trend line with voluntary/involuntary breakdown |
| `DiversityPieChart` | Gender, age group, tenure distribution |
| `ReportBuilder` | Drag-and-drop dimension/measure selection |
| `ReportViewer` | Table/chart view with filters |
| `ExportMenu` | Format selection and download |
| `SchedulerModal` | Schedule frequency, recipients, format |
| `ForecastChart` | Predictive headcount/attrition projection |

---

## Business Rules

1. All reports respect RBAC — managers see only their department data
2. Personally identifiable information (PII) masked in shared reports
3. Report data cached for 1 hour; real-time toggle for operational reports
4. Maximum 20 widgets per dashboard
5. Scheduled reports respect user's timezone for delivery
6. Data retention: reports archived for 7 years for compliance

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Attrition Prediction | Predictor | ML model predicting at-risk employees |
| Trend Analysis | Analyzer | Auto-detect patterns and anomalies in HR data |
| Natural Language Query | Chatbot | "Show me attrition by department for Q2" generates report |
| Insight Generator | Generator | Auto-generated monthly HR insight summaries |
| Recommendations | Advisor | Suggest actions based on analytics (e.g., "Engineering attrition 15% above threshold") |

---

## Permissions

| Role | Executive Dashboard | Department Reports | Custom Reports | Report Scheduling | Export |
|------|--------------------|--------------------|----------------|-------------------|--------|
| SuperAdmin | Yes | All | Yes | Yes | All |
| Admin | Yes | All | Yes | Yes | All |
| HR | Yes | All | Yes | Yes | All |
| Manager | No | Own Dept | No | No | Own Dept |
| Employee | No | No | No | No | No |
