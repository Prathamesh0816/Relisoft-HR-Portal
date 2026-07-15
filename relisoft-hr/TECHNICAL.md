# ReliSoft HR Portal — Technical Guide

Full-stack enterprise HRMS for ReliSoft Technologies Private Limited. .NET 10 + React + SQL Server.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup](#setup)
- [Production Deployment](#production-deployment)
- [Test Suite](#test-suite)
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

**60 tests total** (26 server + 34 client), all passing.

### Server Tests (xUnit)

```powershell
cd server
dotnet test RelisoftHR.Tests
```

| File | Tests | Coverage |
|---|---|---|
| `LeaveControllerTests.cs` | 12 | Apply, cancel, approve, reject, balance check, validation, bulk decision, cancellation requests |
| `TicketsControllerTests.cs` | 5 | Create, get employee tickets, get HR queue, add timeline, cancel |
| `EmailServiceTests.cs` | 4 | New leave, approved, rejected, cancellation requested emails |
| `EmailTemplatesTests.cs` | 5 | Template rendering for all 7 email types |

Uses EF Core InMemory provider. Test project at `server/RelisoftHR.Tests/`.

### Client Tests (Vitest + RTL)

```powershell
cd client
npx vitest run
```

| File | Tests | Coverage |
|---|---|---|
| `api.test.js` | 12 | API endpoint correctness |
| `store.test.js` | 12 | Zustand store actions |
| `LeaveHome.test.jsx` | 3 | Apply form, loading state, empty state |
| `ReviewerInbox.test.jsx` | 2 | Heading, empty state |
| `TicketManagement.test.jsx` | 2 | Heading, form fields |
| `LoginPage.test.jsx` | 2 | Render, submit |

---

## API Endpoints

### Auth

```
POST   /api/auth/login              # { username, password } → { token, employee }
GET    /api/auth/demo-users          # List demo accounts
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

---

## Project Stats

| Metric | Value |
|---|---|
| Server Models | 52 |
| Server Controllers | 30 |
| API Endpoints | 75+ |
| Client Components | 60 |
| Client API Lines | 1,208 |
| EF Migrations | 15 |
| AI Services | 7 |
| AI Agents | 6 |
| AI Module Integrations | 43 |
| Role Levels | 10 |
| Phase 1 Views | 16 |
| Total Views (all phases) | 60+ |
| Tests (Server) | 26 — all passing |
| Tests (Client) | 34 — all passing |

---

## Phase Roadmap

### Phase 2 — Foundations & Quality
Production hardening, testing, CI/CD.

- Unit tests (xUnit for server controllers & services)
- Component tests (Vitest + RTL)
- E2E tests (Playwright)
- CI/CD pipeline (GitHub Actions)
- Global exception middleware, client error boundaries
- Structured logging (files/seq)
- Rate limiting on auth endpoints
- Swagger with XML comments
- SMTP email (SendGrid / SMTP relay)
- AI integration proxy controller

### Phase 3 — Payroll & Expenses
Financial workflows.

- Payroll processing, salary structure, payslip generation
- Tax declarations, TDS computation
- Full & Final settlement
- Expense management (submit, approve, reimburse)
- Loan management
- Excel export via ClosedXML

### Phase 4 — Recruitment & Performance
Talent lifecycle.

- Job requisitions, applicant tracking, offers
- Onboarding v2 with background verification
- Performance management (KRAs, review cycles)
- Training & learning (course catalog, certifications)
- Internal mobility, succession planning

### Phase 5 — Engagement & Workplace
Culture, workplace, governance.

- Surveys, announcements, recognition, social feed
- Asset management (IT hardware, software licenses)
- Visitor management, contractor management
- Compliance tracking, case management
- Shift management, attendance, timesheets
- Notification center

### Phase 6 — AI & Advanced Analytics
Intelligent automation.

- AIController proxy (.NET ↔ Node.js AI layer)
- HR chatbot (natural language policy Q&A)
- Workforce analytics (headcount trends, attrition prediction)
- Skill gap analysis, knowledge concentration
- Resume parsing, document AI
- Anomaly detection (leave patterns, attendance)

### Phase 7 — Mobile & Multi-Tenant
Expansion.

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

Demo data seeded: 2 projects, 4 teams, 7 leave balances, 3 leave applications, 3 support tickets with timeline events.

---

© 2026 ReliSoft Technologies Private Limited. All rights reserved.
