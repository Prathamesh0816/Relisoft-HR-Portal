# ReliSoft HR Portal — Technical Guide

Full-stack enterprise HRMS for ReliSoft Technologies Private Limited. .NET 10 + React + SQL Server.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup](#setup)
- [Production Deployment](#production-deployment)
- [Test Suite](#test-suite)
- [Error Pages (Negative Status Codes)](#error-pages-negative-status-codes)
- [Demo Seeding & No-404 Guarantee](#demo-seeding--no-404-guarantee)
- [API Endpoints](#api-endpoints)
- [Bug Fixes History](#bug-fixes-history)
- [Project Stats](#project-stats)
- [Phase Roadmap](#phase-roadmap)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router 7** | Client-side routing (50+ views) |
| **Zustand 5** | State management |
| **Tailwind CSS 4** | Utility-first styling |
| **Axios** | HTTP client with JWT interceptor |
| **Recharts** | Charting |
| **Lucide React** | Icons |

### Backend

| Technology | Purpose |
|---|---|
| **.NET 10** | Web API framework |
| **Entity Framework Core 10** | ORM |
| **SQL Server (LocalDB)** | Database (dev), SQL Server (production) |
| **JWT Bearer** | Authentication tokens |
| **BCrypt.Net-Next** | Password hashing |
| **ClosedXML** | Excel generation |
| **OpenAPI / Swagger** | API docs |

### AI Layer (separate Node.js service)

| Technology | Purpose |
|---|---|
| **Node.js** | AI service runtime |
| **7 services** | Chatbot, recommendations, insights, RAG, anomaly detection, policy compliance, document AI |
| **6 agents** | Specialized AI agents for HR workflows |

---

## Architecture

```
relisoft-hr/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/            60 page/view components
│   │   ├── store.js               Zustand store
│   │   ├── api.js                 Axios API service (1208 lines)
│   │   ├── ThemeContext.jsx        Dark mode
│   │   ├── App.jsx                Root component
│   │   └── main.jsx               Entry point
│   ├── public/                    Static assets
│   └── package.json
│
├── server/                        # .NET 10 Web API
│   ├── Controllers/               30 API controllers
│   │   ├── AuthController.cs      JWT login
│   │   ├── LeaveController.cs     Leave lifecycle (722 lines)
│   │   ├── OnboardingController.cs
│   │   ├── TicketsController.cs
│   │   └── ...
│   ├── Models/                    52 entity models
│   ├── DTOs/                      Request/response DTOs
│   ├── Data/
│   │   └── AppDbContext.cs         EF Core context + seed data
│   ├── Services/
│   │   ├── IEmailService.cs        Email interface
│   │   ├── EmailService.cs         In-memory/logging email
│   │   ├── EmailTemplates.cs       7 HTML email templates
│   │   ├── WorkforceSeeder.cs      Resilience demo data
│   │   ├── DemoDataSeeder.cs       Phase 1 demo data
│   │   └── WorkforceScoring.cs
│   ├── Migrations/                15 EF migrations
│   ├── appsettings.json
│   ├── appsettings.Production.json
│   ├── deploy.ps1
│   └── RelisoftHR.csproj
│
├── ai/                            # Node.js AI service layer
│   ├── agents/                    6 AI agents
│   ├── services/                  7 AI services
│   ├── module-integrations/       43 integration modules
│   ├── prompts/                   Prompt templates
│   └── workflows/                 Workflow definitions
│
├── specs/                         Design documents
├── README.md                      Non-technical user guide
└── TECHNICAL.md                   This file
```

### Data Flow

```
Browser → React App → Axios (JWT) → /api/* → .NET Controller
                                                  │
                                                  ▼
                                            EF Core → SQL Server
                                                  │
                                                  ▼
                                            Response → UI
```

---

## Setup

### Prerequisites

- **.NET 10 SDK**
- **SQL Server** (LocalDB for dev, SQL Server for production)
- **Node.js v20+** and **npm**
- **PowerShell 5.1+**

### Development

```powershell
# Server
cd server
dotnet restore
dotnet build
dotnet run
# → http://localhost:5049 (Swagger at /swagger)

# Client (separate terminal)
cd client
npm install
npm run dev
# → http://localhost:5173 (proxies API to :5049)
```

The server auto-migrates the database on first run via `db.Database.Migrate()`. EF migrations are pre-applied in `server/Migrations/`.

### Adding a Migration

```powershell
cd server
dotnet ef migrations add MigrationName
dotnet ef database update
```

---

## Production Deployment

### Quick Deploy Script

```powershell
.\server\deploy.ps1 -TargetDir "C:\RelisoftHR\Server" `
    -DbConnection "Server=YOUR_SERVER;Database=RelisoftHRDb;..." `
    -JwtKey "your-32-plus-char-secret-here" `
    -CorsOrigins "https://your-client-domain.com"
```

### Manual Deploy

```powershell
dotnet publish server\ -c Release --output C:\RelisoftHR\Server
cd C:\RelisoftHR\Server
$env:ASPNETCORE_ENVIRONMENT="Production"
.\RelisoftHR.exe
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `Jwt__Key` | 32+ character signing key |
| `CorsOrigins` | Comma-separated allowed origins |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

### Client Production Build

```powershell
cd client
npm run build
# Copy dist/ to web server (IIS, Nginx, etc.)
```

---

## Test Suite

**190 tests total** (83 server + 107 client), all passing.

### Server Tests (xUnit)

```powershell
cd server
dotnet test RelisoftHR.Tests
```

| File | Tests | Coverage |
|---|---|---|
| `AuthControllerTests.cs` | 12 | Login (name/email/domain rules), forgot/reset password |
| `LeaveControllerTests.cs` | 28 | Apply, cancel, approve, reject, balance check, validation, bulk decision, cancellation requests |
| `TicketsControllerTests.cs` | 5 | Create, get employee tickets, get HR queue, add timeline, cancel |
| `EmailServiceTests.cs` | 7 | New leave, approved, rejected, cancellation requested emails |
| `LeaveAccrualServiceTests.cs` | 4 | Leave accrual logic |
| `LeaveBalanceServiceTests.cs` | 7 | Balance computation |
| `LeaveDurationCalculatorTests.cs` | 3 | Duration calculation |
| `InternCompensationServiceTests.cs` | 4 | Intern compensation |
| `Phase2FeaturesTests.cs` | 5 | Encashment, audit log, regularization, documents, id card |

Uses EF Core InMemory provider. Test project at `server/RelisoftHR.Tests/`.

### Client Tests (Vitest + RTL)

```powershell
cd client
npx vitest run
```

| File | Tests | Coverage |
|---|---|---|
| `api.test.js` | 15 | API endpoint correctness |
| `store.test.js` | 12 | Zustand store actions |
| `LeaveHome.test.jsx` | 4 | Apply form, loading state, empty state, leave requests |
| `LeaveCalendar.test.jsx` | 4 | Calendar rendering |
| `ReviewerInbox.test.jsx` | 4 | Inbox rendering |
| `TicketManagement.test.jsx` | 2 | Heading, form fields |
| `LoginPage.test.jsx` | 2 | Render, submit |
| `RenderAllViews.test.jsx` | 64 | Every sidebar view renders without crashing (no white pages) |

---

## Error Pages (Negative Status Codes)

Every non-2xx HTTP response that would otherwise blank a screen is routed to a
dedicated, designed error page instead of a white screen.

### Client wiring

| Piece | Location | Responsibility |
|---|---|---|
| `HttpErrorPage.jsx` | `client/src/components/` | Designed pages for `400, 401, 403, 404, 405, 409, 422, 429, 500, 502, 503, 504`, plus generic and offline variants. Each page has a distinct icon/tone and contextual actions: **Go to dashboard**, **Log in again** (401), **Go back** (403/404/405), **Try again** (retryable), **I waited, retry now** (429/503). |
| Axios response interceptor | `client/src/api.js` | Dispatches a `relisoft:api-error` CustomEvent for page-worthy statuses (`401,403,404,405,409,422,429,500,502,503,504`) and network failures (`status 0`). 400s are treated as ordinary business validation (each view shows its own inline error). Auth endpoints are excluded so a failed login shows the form's inline error. On non-auth 401 the stored session is cleared. |
| Zustand store | `client/src/store.js` | Adds `apiError` + `setApiError`; cleared automatically on `setActiveView` and `logout`. |
| `AppLayout.jsx` | `client/src/components/` | Listens for `relisoft:api-error`, renders `<HttpErrorPage>` in place of the active view while `apiError` is set, and clears it on navigation. |

The existing `ErrorBoundary` remains the last line of defence for uncaught
render exceptions.

---

## Demo Seeding & No-404 Guarantee

The application ships with a deterministic, idempotent demo dataset so every
screen and every route has data — the API sweep reports **zero 404s**.

### Seeder

`server/Services/DemoSeedService.cs` runs automatically at startup (called from
`Program.cs` after the base seeders) and is exposed on demand via:

```
POST /api/admin/seed-demo        # HRL2 / HR / Admin / SuperAdmin only
```

Each section is guarded (only seeds when the demo record is missing), so it is
safe to run repeatedly. It seeds: completed onboarding + checklist steps +
profile + offer-letter document (id 1), probation records, salary structures,
a processed pay run **with id 1** (payslips + lines), a survey with questions +
responses, completed performance reviews (id 1) with criterion scores,
recognition award (id 1) + recipients + kudos, assets + assignments, shift
templates + assignments, announcements, knowledge-base articles, holidays,
attendance for the last two weeks, approved timesheets, salary discussions,
leave encashments, attendance regularizations, an in-progress offboarding,
visitors, and a real medical-certificate file so
`GET /api/leave/{id}/download-medical` serves a downloadable file.

### Scripts

| Script | Purpose |
|---|---|
| `scripts/seed-demo.ps1` | Logs in as `preeti`, calls `POST /api/admin/seed-demo`, prints the per-section counts, then verifies the 10 detail endpoints that previously 404'd all return 200. Exits 1 on failure. |
| `scripts/sweep-endpoints.ps1` | Logs in as `preeti`, pulls the Swagger spec, and calls every GET endpoint (147 total), reporting any non-2xx. Used to prove no route-level 404/500. |

```powershell
# from the repo root
.\scripts\seed-demo.ps1
.\scripts\sweep-endpoints.ps1
```

Record IDs used by the demo are pinned (`runs/1`, `surveys/1`, `reviews/1`,
`awards/1`, `documents/1`, employee-scoped routes keyed to employee 1) via
`SET IDENTITY_INSERT`, so the demo is stable even on a database that already
contains data at higher IDs.

---

## API Endpoints

### Auth

```
POST   /api/auth/login              # { username, password } → { token, employee } — accepts name OR @relisofttechnologies.com email (case-insensitive)
GET    /api/auth/demo-users          # List demo accounts
POST   /api/auth/forgot-password     # { username } → emails reset token (or returns devToken when SMTP is off)
POST   /api/auth/reset-password      # { username, token, newPassword }
POST   /api/auth/change-password     # Authenticated password change
```

### Governance / Phase 2 (api/hr-v2)

```
GET    /api/hr-v2/encashments?employeeId=      # Leave encashment list
POST   /api/hr-v2/encashments                  # Request encashment
PUT    /api/hr-v2/encashments/{id}/approve     # Approve
PUT    /api/hr-v2/encashments/{id}/reject      # Reject
PUT    /api/hr-v2/encashments/{id}/pay         # Mark paid (adjusts balance)
GET    /api/hr-v2/audit-log?entityType=&limit= # Audit trail
GET    /api/hr-v2/attendance-regularizations   # Regularization list
POST   /api/hr-v2/attendance-regularizations   # Request regularization
PUT    /api/hr-v2/attendance-regularizations/{id}/review  # Review
GET    /api/hr-v2/id-card/{employeeId}         # Printable virtual ID card (HTML)
GET    /api/hr-v2/gate-pass/{visitorId}        # Printable gate pass (HTML)
GET    /api/hr-v2/probations                   # Probation records
POST   /api/hr-v2/probation/start              # Start probation
POST   /api/hr-v2/probation/confirm            # Confirm probation
GET    /api/hr-v2/appraisals                   # Appraisals
POST   /api/hr-v2/appraisals/{employeeId}/init # Init appraisal
POST   /api/hr-v2/salary-discussions           # Salary proposal
PUT    /api/hr-v2/salary-discussions/{id}/reject
```

### Documents

```
GET    /api/documents/employee/{employeeId}    # Employee documents (OneDrive-backed)
POST   /api/documents/upload                   # Upload document (10 MB cap, type allowlist)
GET    /api/documents/expiring                 # Documents expiring soon
POST   /api/documents/verify/{id}              # Mark document verified
GET    /api/documents/templates                # Document templates
POST   /api/documents/generate/{id}            # Generate letter from template
```

### Payroll

```
GET    /api/payroll/runs                       # Payroll runs (HR L2)
POST   /api/payroll/runs                       # Create run
GET    /api/payroll/payslips/employee/{id}     # Employee payslips
GET    /api/payroll/runs/{id}/export           # Bulk payslip ZIP export
POST   /api/payroll/runs/{id}/email-payslips   # Email all payslips
GET    /api/payroll/components                 # Pay components
GET    /api/payroll/form16/{employeeId}        # Form 16
```

### Workspace

```
GET    /api/workspace                # Full dashboard data (employees, projects, teams, leaveTypes, roles, etc.)
```

### Leave

```
GET    /api/leave/employee/{id}/requests     # Employee's leave requests
GET    /api/leave/reviewer/{id}/requests     # Reviewer inbox (requests + cancellations + recent decisions)
POST   /api/leave/apply-leave                # Apply for leave
POST   /api/leave/reviewer/decision          # { leaveApplicationId, approverId, action } — action: approve|reject|cancel_approve|cancel_reject
POST   /api/leave/reviewer/bulk-decision     # [{ leaveApplicationId, approverId, action }, ...]
POST   /api/leave/{id}/cancel                # Withdraw pending leave
POST   /api/leave/{id}/request-cancellation  # Request cancellation of approved leave
POST   /api/leave/comp-off/apply             # Apply comp-off
POST   /api/leave/comp-off/transfer          # Transfer comp-off
GET    /api/leave/comp-off/transfers/{id}    # Comp-off transfer history
GET    /api/leave/balance-check/{empId}/{typeId}  # Balance check
GET    /api/leave/balance-check-all          # All employee balances
GET    /api/leave/calendar                   # Calendar (?from=&to=)
POST   /api/leave/upload-medical/{id}        # Medical certificate upload
```

### Tickets

```
GET    /api/tickets/employee/{id}           # Employee's tickets
GET    /api/tickets/hr                      # HR ticket queue
POST   /api/tickets                         # Create ticket
POST   /api/tickets/timeline                # Add timeline event
POST   /api/tickets/cancel/{id}             # Cancel ticket
```

### Onboarding

```
GET    /api/onboarding/profile/{id}         # Get onboarding profile
POST   /api/onboarding/profile              # Save/update profile
POST   /api/onboarding/upload-document/{id}  # Upload document
```

### Admin / Demo Seed

```
POST   /api/admin/seed-demo                 # HRL2/HR — idempotent demo dataset (see "Demo Seeding")
```

### Statutory Payroll (PF / ESI / PT)

Computed from a processed pay run. Rules (India / Maharashtra) live in
`server/Services/StatutoryCalculator.cs` (pure, unit-tested): PF 12% on basic
capped at ₹15,000 wage ceiling, EPS 8.33% capped ₹1,250, EDLI 0.5%; ESI
0.75% / 3.25% of gross when gross ≤ ₹21,000; PT slab ₹0/175/200/300; TDS read
from the payslip's "TDS" deduction line.

```
GET   /api/payroll/statutory/{runId}              # payroll admin — statutory register
GET   /api/payroll/statutory/{runId}/export       # payroll admin — Excel (ClosedXML)
```

Frontend view `payrollStatutory` (`client/src/components/PayrollStatutory.jsx`)
is exposed to HRL2/HR/Manager/ManagerL2/OrganizationHead via `managerViews`.

---

## Bug Fixes History

### Windows AppControl Blocks Server Binary

**Symptom:** `RelisoftHR.dll` / `RelisoftHR.exe` blocked by Microsoft Defender SmartScreen.

**Fix:**
```powershell
Unblock-File -Path "C:\Path\To\RelisoftHR.dll"
Unblock-File -Path "C:\Path\To\RelisoftHR.exe"
```

### Test Project xUnit Resolution Failure

**Symptom:** `dotnet test` fails with xUnit not found or type load errors.

**Root cause:** The test project (`RelisoftHR.Tests/`) is a subdirectory of the main project. The SDK's automatic file globbing (`<Compile Include="**\*.cs" />`) pulls test `.cs` files into the main project's compilation, causing conflicts.

**Fix (applied to `RelisoftHR.csproj`):**
```xml
<Compile Remove="RelisoftHR.Tests\**\*.cs" />
<Content Remove="RelisoftHR.Tests\**\*" />
<EmbeddedResource Remove="RelisoftHR.Tests\**\*" />
<None Remove="RelisoftHR.Tests\**\*" />
```

### Controller Test DTO/Signature Mismatches

**Symptom:** `LeaveControllerTests.cs` and `TicketsControllerTests.cs` fail with constructor argument count or type mismatches.

**Fixes:**
- `LeaveController` constructor: `(AppDbContext, IEmailService, ILogger<LeaveController>)` — not 4 params
- `TicketsController` constructor: `(AppDbContext)` — not `(AppDbContext, ILogger)`
- Return types: `ActionResult` not `ActionResult<T>`
- Decision actions: `"approve"`/`"reject"` not `"approved"`/`"rejected"`
- `CreateTicketRequest` uses positional constructor args matching DTO property order
- `EmailServiceTests.cs` assertion text: `"Cancellation Request"` not `"Action Required"`

### Component Test Mock Synchronization

**Symptom:** Client component tests fail intermittently or after store changes.

**Common fixes:**
- Employee `role` field must be a string (`'HRL2'`), not an object (`{ name: 'HRL2' }`)
- Reset store state in `beforeEach` — test mutations leak across tests
- Match `currentUser.role` to what the component expects (HR vs Employee vs other)
- When a component starts calling a new API function (e.g. `getEncashments`), add the matching mock to the test file — an unmocked call throws and blanks the component

### Resilience Report 500 on Anonymous-Type Cast

**Symptom:** `GET /api/resilience/report` returned HTTP 500 with `InvalidCastException` — anonymous objects were cast to `IDictionary<string, object>` in the HTML report builder.

**Root cause:** `WorkforceScoring.AnalyzeSkillGaps` / `AnalyzeSuccession` return `List<object>` of anonymous types, which don't implement `IDictionary`.

**Fix (applied to `WorkforceResilienceController.GetReport`):** read properties via reflection (`GetProperty(name).GetValue(...)`) instead of dictionary indexing.

### LeaveHome Tests Broken by New Encashment Feature

**Symptom:** All `LeaveHome.test.jsx` cases failed after the encashment section was added — the component's effect calls `getEncashments(...)`, which was not present in the test's `vi.mock('../../api')`.

**Fix:** added `getEncashments`, `requestEncashment`, `getAvailableCompOffCredits` mocks with default resolved values.

---

## Project Stats

| Metric | Value |
|---|---|
| Server Models | 55+ |
| Server Controllers | 38 |
| API Endpoints | 200+ |
| Client Components | 60+ |
| Client API Lines | 1,300+ |
| EF Migrations | 16 |
| AI Services | 7 |
| AI Agents | 6 |
| AI Module Integrations | 43 |
| Role Levels | 10 |
| Total Views (all phases) | 60+ |
| Tests (Server) | 83 — all passing |
| Tests (Client) | 107 — all passing (incl. 64 render-all-views smoke) |

## Phase Roadmap

All phases are **implemented and live**. Remaining work is production hardening and stretch items.

### Phase 2 — Governance & Security (Live)
- Leave encashment (request → approve → reject → pay), attendance regularization, audit log
- Virtual ID card, visitor gate pass, bulk payslip ZIP export + email
- Forgot/reset/change password with token flow
- Login restriction (name or `@relisofttechnologies.com` email only), login rate limiting (20/5min/IP)
- Document upload type allowlist + 10 MB cap, per-employee OneDrive storage
- JWT production key guard (refuses default key in Production)

### Phase 3 — Payroll & Expenses (Live)
- Payroll processing, salary structure, payslip generation
- Tax declarations, TDS computation
- Full & Final settlement
- Expense management (submit, approve, reimburse)
- Loan management
- Excel export via ClosedXML

### Phase 4 — Recruitment & Performance (Live)
- Job requisitions, applicant tracking, offers
- Onboarding v2 with background verification
- Performance management (KRAs, review cycles)
- Training & learning (course catalog, certifications)
- Internal mobility, succession planning

### Phase 5 — Engagement & Workplace (Live)
- Surveys, announcements, recognition, social feed
- Asset management (IT hardware, software licenses)
- Visitor management, contractor management
- Compliance tracking, case management
- Shift management, attendance, timesheets
- Notification center

### Phase 6 — AI & Advanced Analytics (Live)
- AIController proxy (.NET ↔ Node.js AI layer)
- HR chatbot (natural language policy Q&A)
- Workforce analytics (headcount trends, attrition prediction)
- Skill gap analysis, knowledge concentration
- Resume parsing, document AI
- Anomaly detection (leave patterns, attendance)

### Phase 7 — Mobile & Multi-Tenant (Planned)
- React Native mobile app (iOS/Android)
- Multi-tenant databases
- i18n (Hindi, Marathi, English)
- Multi-currency payroll
- Public REST API marketplace
- SSO (Azure AD / Google Workspace)

---

## Demo Credentials

| Username | Password | Role | Employee |
|---|---|---|---|
| `preeti` | `password` | HR L2 | Preeti Patil |
| `rakesh` | `password` | Organization Head | Rakesh Patil |
| `aradhana` | `password` | Employee | Aradhana Shinde |
| `arif` | `password` | Technical Manager L2 | Arif Nadeem Mirza |
| `girish` | `password` | Technical Manager L2 | Girish Patil |
| `shreerang` | `password` | Quality Lead (All Areas) | Shreerang Joshi |
| `prathamesh` | `password` | Quality Engineer (TLM / LQM) | Prathamesh Katikar |

### Hierarchy

- **Aradhana Shinde** (Engineering) reports to **Arif Nadeem Mirza** and **Girish Patil** (Data Operations)
- **Prathamesh Katikar** (Quality Engineering — TLM / LQM area) — Shreerang Joshi (Quality Lead) oversees all areas as a senior reference, no direct manager assigned
- **Shreerang Joshi** looks after all Quality Engineering areas

### TLM / LQM — Explanation

| Shortform | Full Form | Description |
|---|---|---|
| **TLM** | **Test Lifecycle Management** | End-to-end testing process — test planning, case design, execution, defect tracking, and closure for enterprise modules |
| **LQM** | **Local Quality Management** | Quality standards and governance at the team/project level — process audits, quality metrics, compliance checks, and continuous improvement |

Demo data seeded: 2 projects, 4 teams, 7 leave balances, 3 leave applications, 3 support tickets with timeline events, plus the full DemoSeedService dataset (see [Demo Seeding & No-404 Guarantee](#demo-seeding--no-404-guarantee)).

---

© 2026 ReliSoft Technologies Private Limited. All rights reserved.
