# ReliSoft HR Portal — Team Handbook & Phase 2 R&D Guide

> **One document to answer everything.** Read this before asking a teammate, before writing code, and before starting your Phase 2 R&D.
>
> **Owner:** ReliSoft Technologies HR Product Team
> **Status:** Phase 1 live · Phase 2–6 live (Payroll · Governance · Performance · Engagement · Workforce Resilience) · Phase 7 (Mobile/Multi-tenant) planned
> **Last updated:** August 2026

---

## Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [Project Overview](#2-project-overview)
3. [What Is Done Till Now (Current Status)](#3-what-is-done-till-now)
4. [Tech Stack](#4-tech-stack)
5. [Architecture & How the App Works](#5-architecture--how-the-app-works)
6. [Core Logic Explained (Module by Module)](#6-core-logic-explained-module-by-module)
7. [Where Things Live — File Map](#7-where-things-live--file-map)
8. [Phase 2 Scope & Goals](#8-phase-2-scope--goals)
9. [Phase 2 — Detailed Design & Suggestions (Payroll)](#9-phase-2--payroll)
10. [Phase 2 — Detailed Design & Suggestions (Onboarding / Offboarding)](#10-phase-2--onboarding--offboarding)
11. [Phase 2 — Detailed Design & Suggestions (Performance Review: Appraisal / Probation / Increment / Promotion / Internship)](#11-phase-2--performance-review)
12. [Industry Benchmark — How GreyHR / Keka / Zoho People / Darwinbox Do It](#12-industry-benchmark)
13. [Suggested Team R&D Tasks](#13-suggested-team-rd-tasks)
14. [Priority Order & Recommendations](#14-priority-order--recommendations)
15. [Existing Specs & Resources in the Repo](#15-existing-specs--resources)

---

## 1. Purpose of This Document

This document is the **single source of truth** for the ReliSoft HR Portal. It captures:

- Everything that has been **built so far** (so nobody re-builds or re-asks),
- The **tech stack** and **how the code works**,
- The **business logic** behind each module,
- A **complete Phase 2 blueprint** (Payroll, Onboarding/Offboarding, Performance Review) with data models, API design, business rules, and suggestions modelled on industry products like **GreyHR, Keka, Zoho People, and Darwinbox**.

**How to use it:** If you are new, start with sections 2–7. If you are doing Phase 2 R&D, read sections 8–13 carefully and pick your assignment from section 13.

---

## 2. Project Overview

**ReliSoft HR Portal** is a full-stack enterprise HRMS (Human Resource Management System) built for **ReliSoft Technologies Private Limited**, Pune.

It manages the **complete employee lifecycle**:

```
Recruitment/Candidate → Onboarding → Probation → Confirmation
    → (Annual cycle: Appraisal → Increment → Promotion)
    → Offboarding / Separation → Full & Final → Compliance/Records
```

Product ambitions (as planned in README):
- **Phase 1 — Core HR** (live): Employee registration, leave, tickets, onboarding, offboarding, directory, policies, settings.
- **Phase 2 — Extended HR** (in R&D now): Projects, org chart, analytics, attendance, announcements, knowledge base, probation & appraisal, salary & documents, asset management.
- **Phase 3–6** (future): Employee engagement, productivity, compliance, and AI-powered workforce resilience ("TruPulse").

> **Important note:** The `specs/architecture.md` file describes an *idealised* MERN + MongoDB architecture (a design vision). The **actual implemented stack is .NET 10 + React + SQL Server**. When you read the specs, treat them as **design references**, but always write code against the **real, implemented stack** below.

---

## 3. What Is Done Till Now (Current Status)

### 3.1 Phase 1 — Live & Working (v1.0)

| Area | What works | Who uses it |
|---|---|---|
| **Login / Auth** | JWT login, bcrypt password hashing, 10 role levels | All |
| **Employee Registration** | Create employee, assign roles/teams, auto employee codes, manager selection | HR |
| **Leave Management** | Apply leave, balance check, reviewer inbox, approve/reject, bulk decisions, cancellation + cancellation request, comp-off apply/transfer, leave calendar with holidays, medical certificate upload, floater holidays, sandwich leave, carry-forward, carry-forward admin, leave reports | All |
| **Ticket System** | Raise tickets, HR queue, timeline tracking, cancellation | All |
| **Onboarding (v1)** | Self-service profile (PAN, Aadhaar, bank, experience, documents), HR dashboard with **6-step checklist**, bulk onboarding, candidate form | Employee + HR |
| **Onboarding (v2)** | Checklist config, candidate submit → HR approve, step-by-step completion with event triggers (ReliSoft ID, Client ID, Virtual ID Card, Gate Pass), **one-click onboard**, **bulk onboard**, auto login creation | HR |
| **Offboarding (v2)** | One-click offboard, bulk offboard, 30-day notice (auto), asset/id/email/gate-pass flags, complete → employee "Separated", login deactivated | HR |
| **Directory** | Searchable employee directory with project/team hierarchy | All |
| **Leave Policy** | Leave types, carry-forward, comp-off, floater holidays, sandwich leave | HR |
| **Settings** | Change password | All |

### 3.2 Phase 2 — Built & Live (V2 "HrLifecycle" + Governance)

The following are **coded end-to-end and working** (demo data seeded):

| Feature | Backend | Frontend | What it does today |
|---|---|---|---|
| **Probation** | `HRV2Controller` (`/api/hr-v2/probations*`) | `HrLifecycle.jsx` (Probation tab) | Start probation, extend (with reason + count), confirm → sets employee `EmploymentType = "Full-time"` |
| **Appraisal cycles** | `HRV2Controller` (`/api/hr-v2/appraisal-cycles*`) | `HrLifecycle.jsx` (Appraisal tab) | Create/close cycles; only `Active/Closed` status |
| **Appraisal (self + manager)** | `HRV2Controller` (`/api/hr-v2/appraisals*`) | `HrLifecycle.jsx` | Init appraisal, self rating/comments + goals, manager rating/comment, status flow `Draft → Submitted → UnderReview/Completed` |
| **Salary discussion** | `HRV2Controller` (`/api/hr-v2/salary-discussions*`) | `HrDocsSalary.jsx` | Create proposal, approve (auto-updates the simple salary structure), reject |
| **Intern → Permanent conversion** | `HRV2Controller` (`/api/hr-v2/intern-convert`) | `HrLifecycle.jsx` (Intern tab) | Converts intern to full-time, updates designation/role, marks onboarding complete |
| **Salary structure (simple)** | `SalaryStructure.cs` model | via salary discussion | Fixed pay, variable pay, PF, gratuity, insurance, other deductions; `TotalCtc = Fixed + Variable` |
| **Attendance** | `AttendanceRecord.cs` model + `AttendanceTracker.jsx` | Clock in/out, history | Basic presence records |
| **Leave encashment** | `Phase2FeaturesController` (`/api/hr-v2/encashments*`) | `LeaveHome.jsx`, `GovernancePanel.jsx` | Request → approve → reject → pay; adjusts balance |
| **Audit log** | `Phase2FeaturesController` (`/api/hr-v2/audit-log`) + `AuditLogService` | `GovernancePanel.jsx` | Every approval/change logged (payroll, profile, documents, phase 2) |
| **Attendance regularization** | `Phase2FeaturesController` (`/api/hr-v2/attendance-regularizations*`) | `AttendanceTracker.jsx` | Request + review/approve |
| **Virtual ID card** | `Phase2FeaturesController` (`/api/hr-v2/id-card/{id}`) | `Directory.jsx`, `GovernancePanel.jsx` | Printable HTML ID card |
| **Gate pass** | `Phase2FeaturesController` (`/api/hr-v2/gate-pass/{id}`) | `VisitorManagement.jsx`, `GovernancePanel.jsx` | Printable HTML gate pass |
| **Bulk payslip export / email** | `PayrollController` (`/api/payroll/runs/{id}/export`, `/email-payslips`) | `PayrollManagement.jsx` | ZIP download + bulk email |
| **Documents (OneDrive)** | `DocumentController` (`/api/documents/*`) | `HrDocsSalary.jsx` | Upload → per-employee OneDrive folder, expiring, verify, templates, generate |
| **Forgot/reset password** | `AuthController` (`/api/auth/forgot-password`, `/reset-password`) | `LoginPage.jsx` | 30-min tokens; `devToken` returned when SMTP off |

### 3.3 Additional Modules With Models/Code Already Present

These have **models and controllers** in the repo (many are wired to UI too), even though they are not all in the Phase 1 "live" list:

- Projects, Teams, EmployeeTeams, OrganizationRoles (10 roles)
- Announcements, Knowledge Base articles
- Assets, Loans, Expenses, Timesheets, Shifts, Desk/Room Booking, Carpool, Visitors, Contractors, Compliance
- Benefits, Rewards, Surveys, Mood tracker, Skills & Brag board, Mentorship, Training
- Notifications
- Workforce Resilience (TruPulse): resilience dashboard, SPOF analysis, skill gap, succession planning, what-if simulator, knowledge concentration, AI chat
- Internal Mobility

### 3.4 Testing Status

| Layer | Count | How to run |
|---|---|---|
| Server (xUnit) | 83 tests, all passing | `dotnet test RelisoftHR.sln` (in `relisoft-hr/`) |
| Client (Vitest + RTL) | 43 tests, all passing | `npx vitest run` (in `client/`) |

Coverage includes **Leave** (28), **Tickets** (5), **Auth/login rules** (12), **Phase 2 governance** (5), email & leave-calculation services, and core client components.

### 3.5 Demo Logins

All users share password: **`password`**

> **Login rule:** sign in with your **name** (e.g. `preeti`) or official **`@relisofttechnologies.com` email** (e.g. `preeti.patil@relisofttechnologies.com`). Foreign domains and unknown emails are rejected. Case-insensitive.

| Username | Name | Role |
|---|---|---|
| `preeti` / `hr` | Preeti Patil / Super HR | HR L2 |
| `unnati` | Unnati Gawali | HR |
| `rakesh` | Rakesh Patil | Organization Head |
| `arif` / `girish` | Arif Nadeem Mirza / Girish Patil | Manager L2 |
| `shreerang` | Shreerang Joshi | Manager |
| `prathamesh` / `aradhana` / `bhushan` / `sopan` / `supriya` | Various | Employee |

### 3.6 Known Issues & Technical Debt (fix as you build Phase 2)

> ⚠️ These are real issues found during the Phase 2 review. **Ask before "fixing" unlocked demo code, but treat these as must-fix when you build the production versions.**

| # | Issue | Where | Impact / Fix direction |
|---|---|---|---|
| 1 | **Hard-coded salary split** — salary approval auto-computes FixedPay = 60%, VariablePay = 20%, PF = 12%, Gratuity = 5%, `Insurance = 5000`, OtherDeductions = 3% | `HRV2Controller.cs` (salary approve, ~line 241–248) | Wrong for real employees; magic numbers. Replace with configurable **pay-heads + grades** system (section 9). |
| 2 | **Hard-coded values elsewhere** — 30-day notice in offboarding (`AddDays(30)`), username from email prefix, default password `password` for onboarded users | `OnboardingV2Controller.cs` (`OneClickOnboard`, `OneClickOffboard`, `BulkOffboard`) | Notice period & default creds must come from policy config; generate secure temp passwords. |
| 3 | **No server-side authorization** — permissions are checked on the **client** by `currentUser.role`; any API endpoint is callable if you have a token | All controllers | Enforce RBAC on the backend (attribute/authorization per role) before exposing payroll/payslip data. Rate limiting + login domain rules are in place, but per-role auth is not. |
| 4 | **Appraisal final rating = manager rating** — no calibration/moderation step yet | `HRV2Controller.SubmitManagerReview` | Add calibration phase + `CalibratedRating` per section 11.2. |
| 5 | **Onboarding/offboarding steps are auto-stamped all at once** in one-click paths — no per-owner SLA tracking | `OnboardingV2Controller` | Upgrade to owner + SLA workflow (section 10). |
| 6 | **Email is in-memory/logging only** — `EmailService` writes to log, no real SMTP yet | `Services/EmailService.cs` | Wire SendGrid/SMTP; letters & payslips depend on it. |
| 7 | ~~No automated tests for Phase 2 modules~~ **FIXED** — `Phase2FeaturesTests.cs` (5) + `AuthControllerTests.cs` (12, login rules) added; suite is 83 server + 43 client | `server/RelisoftHR.Tests/`, `client/src/__tests__/` | Add tests with every future task (section 13). |
| 8 | **Docs vs code mismatch** — `specs/architecture.md` describes MERN + MongoDB, actual code is .NET 10 + React + SQL Server | `specs/architecture.md` | Treat specs as design reference only; code against the real stack (section 2). |
| 9 | ~~No audit trail on state changes~~ **FIXED** — `AuditLogService` wired into Payroll/Profile/Documents/Phase 2; searchable via `/api/hr-v2/audit-log` | `Services/AuditLogService.cs`, `Phase2FeaturesController` | Extend audit coverage to remaining controllers as you build. |
| 10 | **Attendance model is minimal** (clock in/out only, no validation or permissions) | `Models/AttendanceRecord.cs` | Enough to seed payroll paid-days; needs validation before payroll production. |
| 11 | **Security hardening done** (keep in mind for prod): login rate limit (20/5min/IP), login accepts name or `@relisofttechnologies.com` email only, document upload allowlist + 10 MB cap, JWT prod key guard, `appsettings.Production.json` disables Swagger and locks hosts/CORS. Demo users intentionally kept enabled. | `Program.cs`, `AuthController.cs`, `DocumentController.cs`, `appsettings.Production.json` | Before real go-live: SMTP, OneDrive Graph, prod SQL Server, `Jwt__Key` env var. |

---

## 4. Tech Stack

### Frontend (`client/`)

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool / dev server |
| React Router | 7 | Routing (60+ views) |
| Zustand | 5 | Global state (`store.js`) |
| Tailwind CSS | 4 | Styling |
| Axios | 1.x | HTTP client with JWT interceptor |
| Recharts | — | Charts |
| Lucide React | — | Icons |
| Vitest + React Testing Library | — | Testing |

### Backend (`server/`)

| Technology | Version | Purpose |
|---|---|---|
| .NET | 10 | Web API |
| ASP.NET Core Controllers | — | REST endpoints (`/api/*`) |
| Entity Framework Core | 10 | ORM + migrations |
| SQL Server | LocalDB (dev) / SQL Server (prod) | Database |
| JWT Bearer | — | Auth tokens |
| BCrypt.Net-Next | — | Password hashing |
| ClosedXML | — | Excel generation (bulk uploads) |
| Swagger / OpenAPI | — | API docs (`/swagger`) |
| xUnit + EF InMemory | — | Server tests |

### AI Layer (`ai/` — separate Node.js service)

| Item | Detail |
|---|---|
| Runtime | Node.js |
| Services | 7 (chatbot, recommendations, insights, RAG, anomaly detection, policy compliance, document AI) |
| Agents | 6 |
| Module integrations | 43 |
| Folders | `agents/`, `services/`, `module-integrations/`, `prompts/`, `workflows/` |

> Phase 2 does **not require** the AI layer. AI comes later (Phase 6). Keep your payroll/performance code clean so AI can hook on top.

---

## 5. Architecture & How the App Works

### 5.1 High-level flow

```
Browser (React) 
   │  axios with JWT token
   ▼
ASP.NET Controller  /api/*   (server/Controllers/*.cs)
   │  EF Core
   ▼
SQL Server  (RelisoftHRDb)
   │  DTO → JSON
   ▼
React UI re-renders
```

### 5.2 Code organisation

```
relisoft-hr/
├── client/
│   ├── src/
│   │   ├── api.js            ← ALL server calls (1,200+ lines)
│   │   ├── store.js          ← Zustand global store (currentUser, data, roles)
│   │   ├── App.jsx           ← root + routing
│   │   ├── ThemeContext.jsx  ← dark mode
│   │   └── components/       ← 63 page components (one per screen)
│   └── ...
├── server/
│   ├── Controllers/          ← 31 API controllers
│   ├── Models/               ← 55 entity models
│   ├── DTOs/                 ← request/response records
│   ├── Data/AppDbContext.cs  ← EF context + seed data
│   ├── Migrations/           ← 15 EF migrations
│   ├── Services/             ← Email, templates, seeders, scoring
│   ├── RelisoftHR.Tests/     ← xUnit tests
│   └── ...
├── ai/                       ← Node.js AI layer (later phase)
├── specs/                    ← design specs (reference)
├── scripts/
└── package.json              ← root scripts (npm run dev = server+client)
```

### 5.3 Key conventions you MUST follow

1. **Pattern:** Controller → `AppDbContext` (direct EF queries) → DTO records → JSON. Simple. New Phase 2 controllers should follow the exact same pattern (look at `HRV2Controller.cs` as the template).
2. **DTOs** are C# `record`s in `server/DTOs/`. Add new ones there, never return raw models.
3. **Client calls** go in `client/src/api.js` as named functions (e.g., `getProbations`, `startProbation`). Components import them.
4. **State** lives in Zustand `store.js`. Keep server data there (`data`), current user in `currentUser`, flash messages via `setMessage`.
5. **Roles** are strings on `Employee.Role` (e.g., `"HRL2"`, `"Manager"`, `"Employee"`, `"OrganizationHead"`). Components branch on `currentUser.role`.
6. **Naming:** Controllers `XxxController.cs`, route `/api/xxx`, model `Xxx.cs`, component `Xxx.jsx` (PascalCase).
7. **No hard-coded demo logic in production paths.** Where Phase 1 hard-codes things (e.g., `Insurance = 5000` in salary approval), Phase 2 must make it configurable.

---

## 6. Core Logic Explained (Module by Module)

### 6.1 Authentication & RBAC

- `AuthController.cs` → `POST /api/auth/login` → validates `UserLogin` (username + bcrypt hash) → returns **JWT token + employee object**.
- Every API call sends `Authorization: Bearer <token>`. Client stores it in Zustand.
- **Roles** come from `OrganizationRole` (10 levels: Employee → Team Lead → Manager → Manager L2 → HR → HR L2 → ... → Organization Head). Permissions are **checked in the frontend by role string**, not centrally on the backend. (Improvement needed in Phase 2: enforce backend-side authorization.)

### 6.2 Leave management (the most mature module)

- **Balance:** `EmployeeLeaveBalance` per employee per leave type. Balance check returns available balance.
- **Apply:** `POST /api/leave/apply-leave` → validates balance + dates → creates `LeaveApplication` (`Pending`).
- **Approve chain:** Reviewer inbox shows requests + cancellations + recent decisions. Actions: `approve | reject | cancel_approve | cancel_reject`; also **bulk decision** for multiple at once.
- **Manager approval:** Newer logic makes the **manager the primary approver** (manager selected during onboarding, `ManagerCode` on employee).
- **Comp-off:** apply and transfer with history.
- **Carry-forward:** annual leftover balance carry-forward with admin page (`CarryForwardAdmin.jsx`).
- **Medical certificate:** upload file against a leave application.
- **Calendar:** shows approved leaves + holidays; employees only see their own, HR sees all.
- **Floater holidays & sandwich leave** are configurable in Leave Policy.
- **Emails:** `EmailService` + `EmailTemplates` (7 templates) fire on apply/approve/reject/cancellation (currently in-memory/logging; SMTP pending).

### 6.3 Ticket system

- Employee creates ticket (`POST /api/tickets`) → HR queue (`GET /api/tickets/hr`) → timeline events added per action → cancel.
- Straightforward CRUD + timeline.

### 6.4 Onboarding v2 (already coded — you will extend this)

State machine:

```
Candidate form (POST /api/onboarding-v2/candidate)
   → Employee created with status "Onboarding", code "CAND-…"
   → EmployeeOnboarding "Pending", steps generated from checklist
HR approve (POST /api/onboarding-v2/candidate/{id}/approve)
   → status "InProgress", employee code "EMP-yyyyMMdd-{id}"
Complete each step (POST /api/onboarding-v2/step/{stepId}/complete)
   → step "Completed"; event triggers set ReliSoftId/ClientId/IDCard/GatePass timestamps
   → when CompletedSteps >= TotalSteps → status "Completed", employee "Active"
```

Plus **one-click onboard** (marks all steps done + creates login, username = email prefix, default password) and **bulk onboard** (list of candidates).

### 6.5 Offboarding v2 (already coded)

```
One-click/bulk offboard → EmployeeOffboarding "InProgress"
   → employee status "Offboarding", login deactivated, LastWorkingDay = +30 days
Complete (POST /api/onboarding-v2/offboard-complete/{id})
   → sets AssetsReturnedOn, IdDeactivatedOn, EmailDeactivatedOn, GatePassReturnedOn
   → employee status "Separated"
```

> **Gap for Phase 2:** the checklist steps are auto-stamped in one shot. You will turn this into a **real multi-step workflow with ownership, SLA, and F&F settlement** (see section 10).

### 6.6 Probation (basic, coded)

- `StartProbation` → creates `EmployeeProbation`, `Status = "Probation"`, end = start + N months; sets `EmploymentType = "Probation"`.
- `ExtendProbation` → pushes `CurrentEndDate` by N months, increments `ExtensionCount`, status `"Extended"`.
- `ConfirmProbation` → status `"Confirmed"`, `ConfirmedOn` set, `EmploymentType = "Full-time"`.

### 6.7 Appraisal (basic, coded)

- Cycle CRUD (`AppraisalCycle`: name, start/end, `Active/Closed`).
- `InitAppraisal` → `EmployeeAppraisal` per employee+cycle, `Draft`.
- `SubmitSelf` → rating + comments + goals list → `Submitted`.
- `ManagerReview` → rating + comments → `UnderReview` or `Completed`; `FinalRating = ManagerRating`.
- Goals stored in `EmployeeAppraisalGoal` (goal text, target date, achieved bool).

### 6.8 Salary discussion (basic, coded)

- HR proposes salary (`SalaryDiscussion` `Proposed`), approve → `Approved` and **auto-splits** into the simple `SalaryStructure`:
  - FixedPay = 60% of approved, VariablePay = 20%, PF = 12%, Gratuity = 5%, Insurance = 5000 (hard-coded!), OtherDeductions = 3%.
- Reject → `Rejected`.

> ⚠️ **This hard-coded split must be replaced** in Phase 2 with a **configurable pay-head system** (see section 9).

### 6.9 Attendance (basic, coded)

`AttendanceRecord` with Date, ClockIn, ClockOut, Status. Simple clock in/out tracker. **Phase 2 payroll will read this** for paid/LOP day computation, so treat attendance as the input source.

---

## 7. Where Things Live — File Map

| What you need | Where it is |
|---|---|
| All server endpoints | `server/Controllers/*.cs` |
| Phase 2 lifecycle endpoints (probation/appraisal/salary/intern) | `server/Controllers/HRV2Controller.cs` |
| Phase 2 governance endpoints (encashment/audit/regularization/id-card/gate-pass) | `server/Controllers/Phase2FeaturesController.cs` |
| Audit logging service | `server/Services/AuditLogService.cs` |
| Onboarding/offboarding endpoints | `server/Controllers/OnboardingV2Controller.cs` and `OnboardingController.cs` |
| Database tables / entities | `server/Models/*.cs` |
| Request/response shapes | `server/DTOs/*.cs` (Phase 2 DTOs in `HrV2Dtos.cs`) |
| EF context + seed | `server/Data/AppDbContext.cs` |
| Database changes | Add model → `dotnet ef migrations add <Name>` in `server/` → `dotnet ef database update` |
| All frontend screens | `client/src/components/*.jsx` |
| All API client functions | `client/src/api.js` |
| Global state | `client/src/store.js` |
| Phase 2 lifecycle UI | `client/src/components/HrLifecycle.jsx`, `HrDocsSalary.jsx` |
| Phase 2 governance UI (audit/encashment/regularization/documents/ID card/gate pass + feedback) | `client/src/components/GovernancePanel.jsx` |
| Onboarding/offboarding UI | `HrOnboardingDashboard.jsx`, `EmployeeOnboarding.jsx`, `CandidateOnboarding.jsx`, `OffboardingDashboard.jsx` |
| Design specs (reference) | `specs/modules/*.md` (payroll, performance, onboarding, separation, fnf, etc.) |

---

## 8. Phase 2 Scope & Goals

**Phase 2 = "Money & Growth" cycle.** Three workstreams:

### Workstream A — Payroll
1. Configurable **pay heads** (earnings & deductions: Basic, HRA, Special, PF, ESI, PT, TDS…).
2. **Salary structure** per employee (grade/template based, effective dates, versioned).
3. **Monthly payroll run** (Draft → Processing → Completed → Locked).
4. **Attendance integration** → paid days, LOP computation.
5. **Statutory calculations** (PF 12%, ESI, Professional Tax, TDS basics).
6. **Payslip generation** (HTML/PDF, printable, downloadable).
7. **Bank file export** (NEFT/ACH CSV).
8. **Payroll reports** (department cost, headcount, variances).
9. Lock period, arrears, prorated joiners (stretch).

### Workstream B — Onboarding / Offboarding (production-grade)
1. Configurable onboarding **checklists with owners** (who does each step) + SLAs + status.
2. **Asset provisioning** linked to onboarding steps (laptop, ID, access).
3. Offboarding **exit workflow**: resign → notice period → clearance checklist (admin, IT, finance) → **Full & Final (F&F) settlement** → final payslip.
4. Document generation: **offer letter, joining letter, relieving letter, experience letter**.
5. Probation **auto-reminders** near confirmation date.

### Workstream C — Performance Review (Appraisal / Probation / Increment / Promotion / Internship)
1. **KRA/KPI goals** per role, goal setting with weightage.
2. **Appraisal cycle phases** (goal setting → self review → manager review → calibration → publish).
3. **Rating scales & final rating** (with calibration / moderation).
4. **Increment** workflow → links directly into Payroll salary structure change.
5. **Promotion** workflow → designation + grade change with approval.
6. **Probation confirmation/extend** enhanced with review inputs.
7. **Intern → PPO (Pre-Placement Offer) / permanent conversion** with evaluation.

---

## 9. Phase 2 — Payroll

> Industry reference: **GreyHR/Keka/Zoho People** all separate "Salary Structure", "Payroll Run", and "Statutory" concerns. Steal their model.

### 9.1 Data model (proposed)

```
PayHead            ← master: Basic, HRA, Conveyance, Special, PF, ESI, PT, TDS, Loan…
  - Name, Code (unique), Type (Earning/Deduction),
  - Category (Fixed/Variable/Statutory/Reimbursement),
  - Computation (FixedAmount / PercentageOf / Formula),
  - IsTaxable, IsVisibleOnPayslip, IsActive

Grade / SalaryBand ← Basic, HRA %, etc. per grade
  - Name, PayHeadConfigs[] (head + value or %)

SalaryStructure    ← per employee, versioned
  - EmployeeId, EffectiveFrom, EffectiveTo (null = current),
  - GradeId, TotalCtc, Components[] (PayHead + Amount),
  - IsActive, ApprovedBy, Version

PayrollRun         ← one per month
  - Month, Year, RunName, Status (Draft/Processing/Completed/Locked),
  - TotalEarnings, TotalDeductions, TotalNetPay, LockedBy, LockedOn

Payslip            ← one per employee per run
  - EmployeeId, PayrollRunId, Month, Year,
  - AttendanceSummary (TotalDays, PaidDays, LOPDays),
  - Earnings[], Deductions[], GrossEarnings, GrossDeductions, NetPay,
  - Arrears, PayslipUrl, Status (Generated/Sent/Downloaded)

StatutoryFiling    ← optional; PF/ESI/PT/TDS period records
```

### 9.2 API endpoints (suggested)

```
POST  /api/payroll/payheads                  Create/update pay head
GET   /api/payroll/payheads                  List pay heads
POST  /api/payroll/grades                    Create grade template
GET   /api/payroll/grades                    List grades
POST  /api/payroll/structures                Assign salary structure to employee
GET   /api/payroll/structures/{employeeId}   Get employee structure (history)
POST  /api/payroll/run                       Create & process payroll run  { month, year }
GET   /api/payroll/run/{runId}               Run summary + per-employee results
POST  /api/payroll/run/{runId}/lock          Lock run
GET   /api/payroll/payslips/{runId}/{employeeId}   Single payslip
GET   /api/payroll/payslips/{employeeId}?month=&year=   Employee self-service
POST  /api/payroll/bank-file/{runId}         Download NEFT bank file (ClosedXML/CSV)
GET   /api/payroll/reports/{runId}           Payroll report
```

### 9.3 Business rules (implement these)

1. **Paid days** = calendar days in month − Sundays/holidays − LOP − unpaid leave (from Leave module) and use `AttendanceRecord` for presence.
2. **LOP deduction** = (Monthly Gross / Calendar Days) × LOP days, rounded to nearest rupee.
3. **PF** = 12% of Basic+DA, capped at ₹15,000 base (statutory). Employee 12% | Employer 3.67% PF + 8.33% EPS.
4. **ESI** = 0.75% employee + 3.25% employer, only if gross ≤ ₹21,000/month.
5. **Professional Tax** = state slab (Pune/Maharashtra). Configurable.
6. **TDS** = basic 192 computation or leave a "manual" TDS amount for now (full TDS is a Phase 2.2 stretch).
7. **New joiner** → prorate from joining date (formula: monthly × (paidDays/daysInMonth)).
8. **Payroll lock** → after lock, no edits; unlock requires HR L2 / super admin.
9. **Rounding** → round net pay to nearest rupee; keep 2-decimal amounts in DB.
10. Every **structure change** (increment, promotion, probation confirm) creates a **new effective-dated version** — never overwrite history.

### 9.4 Payslip design (suggested layout)

```
Header: Company logo, "Salary Slip", Month/Year, Pay Date
Employee: Name, Emp Code, Designation, Department, PAN, UAN, Bank A/C
Attendance: Days in month, Paid days, LOP, Arrears
Earnings:  Basic, HRA, Conveyance, Special … | Deductions: PF, ESI, PT, TDS, Loan
Gross Earnings | Gross Deductions | Net Pay (in words)
```

Generate as **HTML** first (view in browser, `window.print()` → PDF). ClosedXML for bank file & Excel reports.

### 9.5 Suggestions (GreyHR-style)

- Provide a **payslip preview** before publishing.
- **Bulk email** payslips after lock.
- Show **year-to-date** (YTD) earnings/deductions on payslip.
- Add **revision history** page: every salary change with old→new values, reason, approver, date.
- Build a **"What-if" checker**: show impact of leave on next month's take-home.
- Keep a **Payroll calendar** (process date, lock date, payslip date).

---

## 10. Phase 2 — Onboarding / Offboarding

### 10.1 Onboarding enhancements (build on v2)

Current v2 is a linear checklist. Upgrade to:

- **Checklist item owner + due days + SLA:** each `OnboardingChecklistItem` gets `OwnerRoleId`, `DueInDays`, `IsMandatory`, `RequiresDocument`, `RequiresAsset`.
- **Role-aware steps:** IT steps (email, laptop, ID card, software access), Admin steps (relieving docs, orientation), Finance steps (bank/PAN verification, salary structure creation).
- **Document upload per step** (already have `EmployeeOnboardingDocument` + profile).
- **Auto email reminders** when a step is due/overdue.
- **Offer letter generation:** `DocumentTemplate` + placeholders (`{Name}`, `{JoiningDate}`, `{Salary}`, `{Designation}`) → generate offer letter PDF/HTML. Reuse for joining letter.

### 10.2 Offboarding (build a real exit workflow)

State machine:

```
Resignation received (resignation date, reason, last working day notice = 30 days min)
   → Employee status "Resigned" (new status), EmployeeOffboarding "Initiated"
Exit Interview (optional)
   → "InInterview"
Clearance checklist (each item owned by Admin/IT/Finance):
   → handover doc, laptop return, ID card return, gate pass, email deactivation, 
     access revocation, pending loans/advances settled
Full & Final (F&F) computation:
   → last month salary prorated + encashment of unused leave + gratuity (if eligible) 
     − dues/advances/notice-period shortfall
Final payslip + relieving letter + experience letter generated
   → Employee status "Separated", F&F record "Paid"
```

### 10.3 F&F settlement (new module)

New model `FullAndFinal`:
```
EmployeeId, OffboardingId,
SalaryDue, LeaveEncashment, GratuityEligible, GratuityAmount,
Deductions (advances, loans, notice shortfall, other),
NetSettlement, SettlementDate, Status (Draft/PendingApproval/Paid),
SettledBy, FNFNumber
```
Rules: encash balance = (monthly gross / 26) × balance days (check company policy); gratuity = 15 days salary per completed year if ≥ 5 years (configurable).

### 10.4 Document generation engine

Create a small **document service**: template table `DocumentTemplate` (name, type, body with `{{placeholders}}`), a render function replacing placeholders from employee + salary + onboarding data. Types: **Offer Letter, Joining Letter, Relieving Letter, Experience Letter, Appointment Confirmation, Increment Letter, Promotion Letter, Full & Final Statement**. Reuse for **appraisal, increment, promotion letters** in section 11.

---

## 11. Phase 2 — Performance Review (Appraisal / Probation / Increment / Promotion / Internship)

> Industry reference: **Keka** and **Darwinbox** run performance in *phases* per cycle and tie results to salary actions. **GreyHR** keeps appraisal → increment → promotion as one connected flow. Do the same.

### 11.1 Concept model

```
Performance Cycle (Annual / Half-yearly / Quarterly)
  phases: GoalSetting → SelfAssessment → ManagerReview → Calibration → Publish
Per-employee: Goals[] (KRA + weightage), Self rating/comments, Manager rating/comments
  → Final (calibrated) rating
Outcome actions (driven by rating + rules):
  → Increment (salary structure change)
  → Promotion (designation / grade change)
  → Probation confirm/extend (for employees in probation)
  → Intern PPO / permanent conversion (for interns)
```

### 11.2 Appraisal — upgrade the existing basic version

Current models: `AppraisalCycle`, `EmployeeAppraisal`, `EmployeeAppraisalGoal`. **Enhance, don't rewrite:**

- Add to `AppraisalCycle`: `Status` enum expanded (`Draft, Active, GoalSetting, SelfReview, ManagerReview, Calibration, Completed`), phase date fields, `Year`, `Type`.
- Add to `EmployeeAppraisalGoal`: `Weightage` (%), `KpiType`, `TargetValue`, `ActualValue`, `ManagerRating`, `ManagerComment`. **Rule: total weightage must equal 100%; max 8 goals.**
- Add to `EmployeeAppraisal`: `DevelopmentAreas`, `Strengths`, `TrainingNeeds`, `PromotionRecommended` (bool), `CalibratedRating`, `PipFlag`.
- **Rating scale** (1–5) as config (future: 1–10).
- **Auto PIP** when final rating < 2.0.
- **Exclusion rule:** employees with < 3 months in cycle are not formally rated.

Suggested APIs:
```
POST /api/performance/cycles            create cycle (with phases)
GET  /api/performance/cycles/active     current active cycle
POST /api/performance/goals             set goals (employee)
PUT  /api/performance/goals/submit      submit goals
PUT  /api/performance/goals/review      manager reviews goals
POST /api/performance/reviews/self      submit self assessment
PUT  /api/performance/reviews/manager   manager final review
POST /api/performance/reviews/calibrate bulk calibration
GET  /api/performance/reviews/{cycleId} cycle result grid
```

### 11.3 Increment (links to Payroll)

Model `Increment` (or reuse `SalaryDiscussion` — better to formalise it):
```
EmployeeId, CycleId, AppraisalId, OldCtc, NewCtc, IncrementPercent,
EffectiveFrom, Reason, ApprovedBy, Status (Proposed/Approved/Rejected/Applied)
```
On approval → create a **new version** of `SalaryStructure` (effective date) + send increment letter.

### 11.4 Promotion (links to HR Org)

Model `Promotion`:
```
EmployeeId, FromDesignation, ToDesignation, FromGrade, ToGrade,
FromRoleId, ToRoleId, EffectiveFrom, ApprovedBy, Status, Reason
```
On approval → update `Employee.Designation` / `RoleId` + **trigger increment if combined** + generate promotion letter.

### 11.5 Probation — enhance the existing basic version

- `EmployeeProbation` already tracks start, original/current end, extensions, confirm.
- Add: **review feedback fields** (ConfirmationRecommendation, Comments, ManagerId), **auto-reminder 15 days before end** (background job), **escalation** if not confirmed by end date.
- Tie confirmation → `EmploymentType = "Full-time"` + optionally open an increment/salary-discussion.

### 11.6 Internship → PPO / Permanent

Model `InternEvaluation` (or extend `EmployeeProbation`/`EmployeeAppraisal`):
```
InternId, InternshipStart, InternshipEnd, ProjectFeedback, MentorId,
ManagerRating, ConvertRecommendation (bool), PpoOffered, ConvertedOn
```
Flow: intern → evaluation → if recommend → PPO offered → accept → **convert** (existing `intern-convert` endpoint) → onboarding complete + probation starts.

---

## 12. Industry Benchmark — How GreyHR / Keka / Zoho People / Darwinbox Do It

Use this as a **feature checklist** so our Phase 2 matches what customers expect from modern HR software.

| Capability | GreyHR | Keka | Zoho People | Darwinbox | Our Phase 2 target |
|---|---|---|---|---|---|
| Configurable pay heads | ✅ | ✅ | ✅ | ✅ | ✅ (must) |
| Grade/band salary templates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Monthly run with lock | ✅ | ✅ | ✅ | ✅ | ✅ |
| Automated PF/ESI/PT/TDS | ✅ | ✅ | ✅ | ✅ | PF/ESI/PT now, TDS manual first |
| Payslip self-service portal | ✅ | ✅ | ✅ | ✅ | ✅ (ESS) |
| Bank/NEFT file export | ✅ | ✅ | ✅ | ✅ | ✅ |
| Effective-dated salary revisions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Appraisal phases (goal→review→calibrate) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 360 feedback | ✅ | ✅ | ✅ | ✅ | Phase 2.2 |
| Calibration / moderation | ✅ | ✅ | ✅ | ✅ | Phase 2.2 |
| Increment+Promotion letters | ✅ | ✅ | ✅ | ✅ | ✅ |
| Onboarding task owners + SLA | ✅ | ✅ | ✅ | ✅ | ✅ |
| Offboarding clearance + F&F | ✅ | ✅ | ✅ | ✅ | ✅ |
| Offer/Joining/Relieving letter gen | ✅ | ✅ | ✅ | ✅ | ✅ |
| Configurable workflows/approvals | ✅ | ✅ | ✅ | ✅ | Build simple approval chains |
| Audit trail | ✅ | ✅ | ✅ | ✅ | Add `CreatedOn/UpdatedOn/ApprovedBy` everywhere |
| Employee self-service (ESS) | ✅ | ✅ | ✅ | ✅ | ✅ (payslips, goals, self-appraisal) |

**Key lessons to copy:**
1. **Everything is configurable** (pay heads, grades, leave policy, checklist) — never hard-code business numbers.
2. **Effective dating** on every salary/promotion record.
3. **Approval chain** for money & promotion actions (HR proposes → HR L2/Manager approves).
4. **Auto document generation** from templates.
5. **Audit trail** (who did what, when) — required for compliance.
6. **Self-service** first: employee sees own payslip, goals, appraisal; manager sees team; HR sees all.

---

## 13. Suggested Team R&D Tasks

Assign these. Each task = pick one, research (use section 12 + specs/), then prototype against the existing code.

| # | Task | Suggested owner | Output expected |
|---|---|---|---|
| 1 | **Pay-heads + grades + salary structure designer** | Person A | `PayHead`, `Grade`, `SalaryStructure` models, CRUD APIs + UI, seed default Indian pay heads |
| 2 | **Monthly payroll run engine** | Person B | `PayrollRun` + processing: attendance integration, paid/LOP days, earnings/deductions, lock |
| 3 | **Payslip generation + self-service** | Person C | HTML payslip component, print/PDF, ESS page, email after lock |
| 4 | **Statutory calc (PF/ESI/PT) + bank file** | Person B/C | Rules service + NEFT CSV via ClosedXML |
| 5 | **Onboarding checklist v3 (owners + SLA + docs + assets)** | Person D | Extend `OnboardingChecklistItem`, dashboard per owner, reminders |
| 6 | **Offboarding exit workflow + clearance** | Person D | State machine, clearance checklist with owners |
| 7 | **Full & Final settlement** | Person E | `FullAndFinal` model + calculator + approval + F&F statement |
| 8 | **Document generator (offer/joining/relieving/experience/increment/promotion)** | Person E | `DocumentTemplate` + placeholder render + letter preview |
| 9 | **Performance cycle phases + goals (weightage, ratings)** | Person F | Enhanced cycle/goal models + APIs + goal-setting UI |
| 10 | **Manager review + calibration grid** | Person F | Review grid per cycle, bulk rating, moderation |
| 11 | **Increment workflow (to payroll)** | Person G | `Increment` model, approval, creates new salary structure version |
| 12 | **Promotion workflow (to org/role)** | Person G | `Promotion` model, approval, updates designation/role, letter |
| 13 | **Probation v2 (reviews, reminders, confirm/extend)** | Person H | Enhance `EmployeeProbation`, due-date reminders |
| 14 | **Intern PPO / conversion evaluation** | Person H | `InternEvaluation`, PPO flow, reuse `intern-convert` |
| 15 | **Backend authorization hardening** | (All) | Move permission checks server-side per role |

**Every task must include:** models + migration + DTOs + controller + API client function (`api.js`) + one component + **at least a few unit/component tests**.

---

## 14. Priority Order & Recommendations

**Suggested build order (money first, then growth):**

1. **Pay-heads & salary structures** (foundation for everything money-related).
2. **Monthly payroll run + payslip** (core payroll deliverable).
3. **Probation v2 + appraisal phases** (foundation for growth actions).
4. **Increment workflow** (needs payroll structures).
5. **Promotion workflow** (needs org roles/designations).
6. **Intern PPO** (needs appraisal + onboarding).
7. **Onboarding checklist v3 + asset provisioning**.
8. **Offboarding exit workflow + F&F**.
9. **Document generator** (letters for everything above).
10. **Statutory (PF/ESI/PT) + bank file** — can start in parallel with 2.

**Cross-cutting recommendations:**
- Add **`CreatedOn` / `UpdatedOn` / `ApprovedBy`** on every new model (audit trail).
- Add a **`StatusCode` + workflow log table** for any approval flow.
- Keep **roles/approvers configurable** — do not hard-code `Insurance = 5000` again.
- **Write tests as you go** — payroll maths is the most error-prone code in the product.
- Put **config values** (PF %, ESI limit, PT slab, notice days, gratuity %) into a `HrPolicy`/settings table (policy module already exists).
- Follow the **existing conventions** in section 5.3 — consistency is what lets 6 people work in parallel.

---

## 15. Existing Specs & Resources

**Design specs already in the repo** (`relisoft-hr/specs/modules/`) — read these before R&D:
- `payroll.md` — full payroll design (pay heads, salary structure, run, payslips, statutory, bank file)
- `performance.md` — full performance design (KPI/KRA, cycles, reviews, calibration, PIP)
- `onboarding.md`, `separation.md`, `fnf.md` — onboarding/offboarding/F&F designs
- `recruitment.md`, `internal-mobility.md`, `employee-management.md`, `benefits-administration.md`
- `asset-management.md`, `document-management.md`, `attendance.md`, `holiday-management.md`
- `workflow.md`, `notifications.md`, `compliance.md`, `analytics.md`, `talent-analytics.md`

**Other resources:**
- `README.md` — user guide, demo logins, phase roadmap
- `TECHNICAL.md` — setup, architecture, API list, test suite, deployment
- `specs/architecture.md` — design vision (MERN; treat as reference, code is .NET)
- `client/README.md` — frontend quick start
- `server/appsettings.Production.json` + `server/deploy.ps1` — production deployment

**Run the project:**
```powershell
cd C:\Users\Abcom\Projects\Relisoft-HR-Portal\relisoft-hr
npm run dev          # starts .NET (:5049) + Vite (:5173)
# login: any demo user / password
```

---

© 2026 ReliSoft Technologies Private Limited. All rights reserved.
