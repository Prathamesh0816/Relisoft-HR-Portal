# AI Integration Specification

## Overview

The AI Integration specification defines how Artificial Intelligence is incorporated across the ReliSoft HR platform. AI is used for development-time automation (SDD agents) and runtime features (chatbot, predictions, document processing).

**Guiding Principles**:
1. AI augments, never replaces, human decision-making
2. All AI-generated outputs require human review where they impact employee data
3. AI responses must be transparent — users should know when interacting with AI
4. Data privacy: AI services never share raw HR data with third-party training
5. Graceful degradation: system works without AI if service unavailable

---

## AI Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Gateway Service                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Provider Router                           │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │ OpenAI       │  │ Claude       │  │ Local LLM   │       │   │
│  │  │ Adapter      │  │ Adapter      │  │ Adapter     │       │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │   │
│  │         │                 │                 │               │   │
│  │         └─────────────────┼─────────────────┘               │   │
│  │                           │                                  │   │
│  │                    ┌──────┴──────┐                          │   │
│  │                    │   Router    │                          │   │
│  │                    │ (cost/quality/                          │   │
│  │                    │  latency)   │                          │   │
│  │                    └─────────────┘                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Service Layer                              │   │
│  │                                                               │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │   │
│  │  │ Chatbot    │ │ Resume     │ │ Candidate  │ │ Leave    │  │   │
│  │  │ Service    │ │ Parser     │ │ Matcher    │ │ Predictor│  │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │   │
│  │  │ Attrition  │ │ Smart      │ │ Document   │ │ Compl.   │  │   │
│  │  │ Predictor  │ │ Scheduler  │ │ Generator  │ │ Checker  │  │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐               │   │
│  │  │ Insight    │ │ Perf.      │ │ OCR        │               │   │
│  │  │ Engine     │ │ Insights   │ │ Service    │               │   │
│  │  └────────────┘ └────────────┘ └────────────┘               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Agent Framework                             │   │
│  │                                                               │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │   │
│  │  │ Spec       │ │ Code Gen   │ │ Code       │ │ Test     │  │   │
│  │  │ Agent      │ │ Agent      │ │ Review     │ │ Agent    │  │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                Prompt Management System                       │   │
│  │                                                               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│  │  │ Templates│ │ Versions │ │ A/B Test │ │ Variables│       │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Human Review Queue                            │   │
│  │                                                               │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │   │
│  │  │ Spec       │ │ Generated  │ │ AI Chat    │ │ Audit    │  │   │
│  │  │ Reviews    │ │ Code Rev.  │ │ Logs       │ │ Trail    │  │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## AI Features

### 1. AI Chatbot
**Service**: Chatbot Service
**Provider**: OpenAI GPT-4 / Claude 3 for responses, local LLM for simple queries
**Endpoints**: `POST /api/v1/automation/chatbot/query`

**Capabilities**:
- Natural language HR policy lookup (leave policy, attendance rules, etc.)
- Self-service actions: apply leave, view payslip, check attendance
- Ticket creation: "My laptop is broken" → creates IT ticket
- Team information: "Who is on leave today?"
- Employee information: "Show me my team's attendance this month"
- Guided workflows: step-by-step process assistance

**Architecture**:
```
User Message → Intent Classifier → Entity Extractor → Context Retriever
    → Prompt Builder → LLM → Response Formatter → Human Review (if sensitive)
    → Response to User
```

**Intent Taxonomy**:
- `leave_balance_query`, `leave_apply`, `leave_status`, `leave_policy`
- `payslip_view`, `payslip_download`
- `attendance_today`, `attendance_monthly`
- `holiday_list`, `holiday_upcoming`
- `ticket_create`, `ticket_status`, `ticket_escalate`
- `employee_search`, `team_info`, `org_chart`
- `policy_query`, `compliance_query`
- `expense_status`, `travel_policy`
- `training_catalog`, `training_enroll`
- `recognition_give`, `feedback_provide`
- `help`, `escalate_to_human`

**Safety Guards**:
- PII masking in logs
- All salary/compensation queries require re-authentication
- "I want to resign" → forward to HR, not automated
- Rate limit: 30 queries per hour per user
- Disclaimer appended to all responses

---

### 2. Resume Parser
**Service**: Resume Parser Service
**Provider**: OpenAI GPT-4 (for structured extraction), spaCy (for NER)
**Trigger**: On resume upload in recruitment module

**Extracted Fields**:
- Personal Information: name, email, phone, linkedIn URL, location
- Work Experience: company names, designations, dates, descriptions
- Education: degrees, institutions, years, GPA
- Skills: technical skills, soft skills, certifications
- Languages known
- Total years of experience (computed)
- Notice period, current CTC, expected CTC (if mentioned)

**Output Format**:
```json
{
  "parsedData": {
    "personalInfo": {
      "fullName": "Jane Smith",
      "email": "jane.smith@email.com",
      "phone": "+1-555-123-4567",
      "location": "Bangalore, India",
      "linkedIn": "https://linkedin.com/in/janesmith"
    },
    "totalExperience": 6.5,
    "workExperience": [
      {
        "company": "TechCorp Inc.",
        "designation": "Senior Software Engineer",
        "fromDate": "2021-03",
        "toDate": "2024-01",
        "description": "Led a team of 5...",
        "isCurrent": false
      }
    ],
    "education": [
      {
        "degree": "B.Tech Computer Science",
        "institution": "IIT Delhi",
        "year": 2017,
        "percentage": 85
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes"],
    "certifications": ["AWS Certified Solutions Architect"],
    "currentCTC": "25 LPA",
    "expectedCTC": "30 LPA",
    "noticePeriod": "60 days"
  },
  "confidence": 0.92,
  "missingFields": ["currentCTC"]
}
```

**Accuracy Targets**:
- Name extraction: >99%
- Contact extraction: >98%
- Experience parsing: >95%
- Skills extraction: >90%
- CTC extraction: >85%

---

### 3. Candidate Matcher
**Service**: Candidate Matcher Service
**Provider**: OpenAI Embeddings / SentenceTransformers
**Trigger**: When reviewing candidates for a job requisition

**Matching Dimensions**:
- Skills match (50% weight): overlap between candidate skills and job requirements
- Experience match (25% weight): years of experience within range
- Education match (10% weight): degree level and field relevance
- Industry match (10% weight): previous industry alignment
- Location match (5% weight): proximity to job location

**Output**:
```json
{
  "candidateId": "664...",
  "overallScore": 87,
  "dimensionScores": {
    "skills": 92,
    "experience": 85,
    "education": 80,
    "industry": 70,
    "location": 100
  },
  "matchingSkills": ["React", "Node.js", "MongoDB"],
  "missingSkills": ["AWS", "Microservices"],
  "summary": "Strong technical match with 6.5 years of full-stack experience. Missing cloud skills which can be trained."
}
```

---

### 4. Leave Predictor
**Service**: Leave Predictor Service
**Model**: Time-series forecasting (Prophet / LSTM)
**Training Data**: Historical leave patterns (2+ years)
**Features**: Month, day of week, holiday proximity, team size, department, season

**Use Cases**:
- Predict total leave days for upcoming month (capacity planning)
- Identify peak leave periods
- Suggest optimal staffing levels

**Output**:
```json
{
  "predictions": {
    "nextMonth": { "predictedLeaves": 45, "confidence": 0.85 },
    "nextQuarter": { "predictedLeaves": 120, "confidence": 0.72 },
    "peakPeriods": [
      { "month": "December", "predictedLeaves": 65, "reason": "Holiday season" },
      { "month": "May", "predictedLeaves": 55, "reason": "Summer vacation" }
    ]
  }
}
```

---

### 5. Attrition Predictor
**Service**: Attrition Predictor Service
**Model**: Gradient Boosting (XGBoost / LightGBM)
**Features**: Tenure, age, salary percentile, commute distance, promotion history, performance rating, leave patterns, engagement score, overtime hours, manager changes

**Risk Scoring**:
- 0-30: Low risk
- 31-60: Medium risk (monitor)
- 61-80: High risk (intervention recommended)
- 81-100: Critical (immediate action needed)

**Output**:
```json
{
  "employeeId": "664...",
  "attritionRisk": 78,
  "riskLevel": "High",
  "topFactors": [
    { "factor": "No promotion in 3 years", "impact": "High" },
    { "factor": "Salary below market (25th percentile)", "impact": "High" },
    { "factor": "Increased leave pattern", "impact": "Medium" }
  ],
  "recommendedActions": [
    "Schedule career development discussion",
    "Review compensation",
    "Assign mentor for growth plan"
  ],
  "predictionWindow": "Next 6 months",
  "modelConfidence": 0.82
}
```

---

### 6. Smart Scheduler
**Service**: Smart Scheduler Service
**Model**: Constraint optimization (OR-Tools)
**Inputs**: Shift requirements, employee availability, skill requirements, preferences, labor laws
**Constraints**: Min rest hours, max consecutive shifts, skill coverage, fairness distribution

**Output**: Optimal shift roster for the period

---

### 7. Document Generator
**Service**: Document Generator Service
**Provider**: OpenAI GPT-4
**Trigger**: On document generation request in Document Management module

**Generated Documents**:
- Offer letters (personalized with compensation details)
- Appointment letters
- Confirmation letters
- Experience/relieving letters
- Appraisal letters
- Policy acknowledgment forms

**Template Approach**: Pre-defined templates with AI-populated merge fields + AI-drafted paragraphs for narrative sections (e.g., performance description in experience letter)

---

### 8. Compliance Checker
**Service**: Compliance Checker Service
**Provider**: OpenAI GPT-4 + Rules Engine
**Checks**:
- Minimum wage compliance per location
- PF/ESI applicability and correct deduction rates
- Overtime limit compliance
- Maternity benefit act compliance
- POSH committee requirements
- Contract labour law compliance
- Shops & establishments act compliance

**Output**:
```json
{
  "module": "Payroll",
  "period": "June 2024",
  "checks": [
    {
      "rule": "PF Applicability",
      "status": "Pass",
      "details": "All eligible employees covered. Deduction rate 12% correct."
    },
    {
      "rule": "ESI Applicability",
      "status": "Warning",
      "details": "3 employees with gross >21,000 incorrectly marked for ESI deduction."
    },
    {
      "rule": "Minimum Wage",
      "status": "Fail",
      "details": "Employee EMP-00452 (Grade E1, Location Mumbai) paid below minimum wage by ₹1,200/month."
    }
  ]
}
```

---

### 9. Insight Engine
**Service**: Insight Engine Service
**Provider**: OpenAI GPT-4
**Trigger**: Natural language queries on analytics dashboard

**Capabilities**:
- "Why did attrition increase this quarter?"
- "Which department has the highest overtime?"
- "Show me the gender diversity trend over 3 years"
- "What is the correlation between engagement score and attrition?"

**Architecture**:
```
NL Query → SQL/Query Generator → Execute Query → Result Analysis
    → Natural Language Insight → Visualization Suggestion → Display
```

---

### 10. Performance Insights
**Service**: Performance Insights Service
**Provider**: OpenAI GPT-4
**Analysis**:
- Performance distribution across departments
- Rater bias detection (harsh/lenient managers)
- Performance vs. potential matrix (9-box grid)
- Manager-subordinate rating correlation
- Performance trend over cycles

**Output**:
```json
{
  "cycleId": "664...",
  "insights": [
    {
      "type": "bias_detection",
      "severity": "medium",
      "description": "Manager Alice Smith (Engineering) consistently rates 0.5 points lower than peer average. Suggest calibration session."
    },
    {
      "type": "trend",
      "description": "Sales department shows 15% improvement in ratings over last cycle, correlating with new training program."
    }
  ]
}
```

---

## Agent Framework (SDD Agents)

### Spec Agent
**Purpose**: Generate initial specification drafts from feature requests
**Input**: Feature description, requirements, user stories
**Output**: Structured spec document matching the spec template
**Prompt Template**: `spec_generation_v2`

### Code Generator Agent
**Purpose**: Generate implementation code from approved specs
**Input**: Spec document, API contract, technology stack
**Output**: Models, Controllers, Routes, Services, UI components, Tests
**Validation**: Generated code is validated against spec before review

### Code Review Agent
**Purpose**: Review code against spec requirements
**Input**: Spec document, generated code, diff
**Output**: Review comments, violations, suggestions
**Checklist**:
- All API endpoints match spec
- Data model matches schema
- Business rules implemented correctly
- Permissions enforced
- Edge cases handled
- Error responses follow standard format

### Test Generator Agent
**Purpose**: Generate test cases from spec scenarios
**Input**: Spec document, API contract
**Output**: Unit tests, integration tests, E2E tests
**Coverage Target**: >90% for core business logic

### Documentation Agent
**Purpose**: Keep documentation in sync with specs
**Trigger**: On spec approval or code merge
**Output**: Updated API docs, changelog, user guides

---

## Prompt Management System

### Template Structure
```
---
name: leave_balance_query
version: 2.3
model: gpt-4
temperature: 0.3
max_tokens: 500
---

System: You are an HR assistant for ReliSoft HR...
User: {{userMessage}}
Context: Employee {{employeeName}} has balance: {{leaveBalance}}
```

### Versioning
- Each prompt template has a version number (semver)
- A/B testing support for comparing prompt versions
- Prompt change log maintained
- Canary deployment of prompt changes

### Prompt Categories

| Category | Count | Example |
|----------|-------|---------|
| Chatbot Intents | 15 | leave_balance, payslip_query |
| Spec Generation | 5 | feature_to_spec, api_spec |
| Code Generation | 8 | model_gen, controller_gen |
| Code Review | 6 | security_review, style_review |
| Document Generation | 4 | offer_letter, experience_letter |
| Data Extraction | 3 | resume_parsing, invoice_ocr |
| Analytics | 4 | insight_generation, trend_analysis |

---

## Human Review Queue

### Review Types

| Type | Reviewer | SLA | Auto-approve? |
|------|----------|-----|----------------|
| Spec Review | Product Owner + Architect | 48 hours | No |
| AI Code Review | Engineering Lead | 24 hours | No |
| AI Chat Log Review | HR Compliance | Weekly batch | No (flagged only) |
| OCR Verification | HR/Recruiter | 4 hours | Confidence >95% |
| Resume Parsed Data | Recruiter | 2 hours | Confidence >90% |

### Review Dashboard
- Queue view with priority sorting
- Side-by-side diff for code reviews
- Approve/Reject/Modify with comments
- Bulk approval for low-risk items
- Audit trail of all review actions

---

## AI Ethics & Governance

### Transparency
- Chatbot identifies itself as AI: "Hi, I'm ReliBot, the HR AI Assistant"
- AI-generated code marked with `/* AI-GENERATED - Review required */` comment
- AI analytics insights prefixed with "AI Suggestion"
- Option to escalate from AI to human at any point

### Data Privacy
- No employee PII sent to third-party AI providers
- Data anonymized before LLM inference where possible
- All API calls logged for audit
- AI provider contracts include data processing agreement (DPA)
- Option for on-premise LLM deployment for sensitive deployments

### Human Oversight
- Critical actions require human approval (resignation, termination, salary changes)
- AI suggestions in analytics are non-binding recommendations
- Chatbot cannot execute financial transactions
- All AI errors logged and reviewed in monthly AI governance meeting

### Bias Prevention
- Regular bias audits on AI models
- Training data reviewed for demographic representation
- Gender/age/race neutral prompt engineering
- Diverse test sets for model evaluation
- Continuous monitoring for disparate impact

---

## Performance & Reliability

### SLAs

| Service | Expected Latency | Availability | Fallback |
|---------|-----------------|--------------|----------|
| Chatbot | <2s | 99.5% | Rule-based responses |
| Resume Parser | <10s | 99% | Manual entry form |
| Candidate Matcher | <3s | 99% | Keyword matching |
| Leave Predictor | <5s | 98% | Historical average |
| Attrition Predictor | <3s | 98% | Rule-based flags |
| Document Generator | <15s | 99% | Template-only |
| OCR | <5s | 99% | Manual entry |

### Caching Strategy
- Chatbot responses cached (key: intent hash) for 1 hour for common queries
- Resume parse cache: re-parsing same resume returns cached result
- Prediction cache: predictions recomputed daily (cached for 24 hours)

### Error Handling
- AI service unavailable → graceful fallback to rule-based responses
- Rate limiting → queue requests with priority
- Token limit exceeded → chunk and process in parallel
- Invalid response → retry with lower temperature (max 3 attempts)
- All errors logged to monitoring system

---

## Module AI Integration Matrix

| Module | AI Services Integrated | Integration Point |
|--------|----------------------|-------------------|
| Employee Management | Profile photo validation, skill recommendations, profile completeness | ESS dashboard, profile edit |
| Recruitment | Resume parser, candidate matcher, question generator, ranker | Applicant pipeline |
| Onboarding | Document OCR, IT setup prediction | Pre-onboarding portal |
| Leave Management | Leave predictor, smart approval recommendation | Leave dashboard |
| Attendance | Anomaly detection, attendance prediction | Attendance view |
| Payroll | Salary benchmarking, anomaly detection, tax optimization | Salary structure, payroll run |
| Performance | Bias detection, goal suggestions, trend analysis | Review cycle |
| Training | Course recommendations, skill gap analysis | Training catalog |
| Document Management | Document generation, OCR | Document generator |
| Compliance | Compliance checker, regulatory alert | Compliance dashboard |
| Analytics | Insight engine, trend analysis, attrition prediction | Reports |
| Helpdesk | Auto-categorization, smart routing, auto-reply | Ticket creation |
| Engagement | Sentiment analysis, engagement prediction | Survey results |
| Automation | Chatbot, reminder engine, OCR | Across all modules |
