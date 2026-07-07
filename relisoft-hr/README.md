# ReliSoft HR Portal

> **Empowering businesses with smarter HR technology** — A comprehensive, AI-powered, role-based Human Resources management platform built with modern web technologies.

ReliSoft HR Portal is a full-stack enterprise HRMS designed for ReliSoft Technologies Private Limited. It covers the complete employee lifecycle — from recruitment and onboarding through performance, payroll, and separation — with over 85 protected routes, 89 database models, 75+ API endpoints, and deep role-based access control across 10 permission levels.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [How to Login](#how-to-login)
- [Role-Based Access](#role-based-access)
- [AI & Automation](#ai--automation)
- [Theme System](#theme-system)
- [Spec-Driven Development](#spec-driven-development)
- [Module Overview](#module-overview)
- [API Structure](#api-structure)
- [Benefits](#benefits)
- [Future Additions](#future-additions)
- [Project Stats](#project-stats)

---

## Features

### Core HR
- **Employee Management** — Complete lifecycle from hire to retire with self-service portals
- **Leave & Attendance** — Apply leaves, track attendance, manage shifts, view holiday calendars
- **Payroll & FnF** — Payroll processing, payslip generation, Full & Final settlement
- **Recruitment** — Job requisitions, applicant tracking, candidate pipeline management
- **Onboarding** — Digital onboarding workflows, document collection, task checklists
- **Performance** — Goal setting (KRAs/KPIs), review cycles, feedback management
- **Training** — Course catalog, registrations, certification tracking

### AI-Powered Features
- **Nova AI Companion** — Friendly AI chatbot for motivation, jokes, songs, trivia, daily wisdom
- **HR Assistant** — Rules-based chatbot answering policy questions instantly
- **AI Council** — Governance platform for AI proposals, voting, and policy management
- **Workforce Resilience AI** — Natural language queries for workforce analytics
- **Spec-Driven Development** — AI generates specs, code, and code reviews
- **Resume Parsing** — AI-powered resume parsing and candidate matching
- **Predictive Analytics** — Attrition prediction, training recommendations, skill gap analysis

### Culture & Engagement
- **Cultural Compass** — Explore Indian art, dance, cuisine, festivals, and languages (7 interactive tabs)
- **Social Feed** — Employee social network with posts, comments, likes
- **Recognition** — Peer-to-peer appreciation and awards
- **Surveys** — Employee engagement and pulse surveys
- **Announcements** — Company-wide communications
- **Gratitude Wall** — Share what you're grateful for

### ITSM & Procurement
- **Service Catalog** — Browse and request IT services
- **Helpdesk** — IT support ticket management
- **HR Support Tickets** — HR-specific issue tracking
- **IT Asset Management** — Hardware and software inventory
- **Procurement** — Purchase requisitions, POs, goods receipt, invoices

### Workplace
- **Visitor Management** — Pre-registration and check-in
- **Gate Passes** — Asset movement tracking
- **Virtual ID Cards** — Digital employee identification
- **Travel & Expenses** — Travel requests and expense claims
- **Contractor Management** — Vendor and contractor oversight
- **Document Management** — Centralized employee document repository

### Compliance & Governance
- **Policy Management** — Company policies with acknowledgment tracking
- **Compliance Tracking** — Regulatory compliance monitoring
- **Case Management** — Employee disciplinary and grievance cases
- **Separation Management** — Full offboarding workflow
- **Workflow Engine** — Custom approval workflow designer
- **Audit Logs** — Complete action audit trail

### Analytics & Intelligence
- **HR Analytics** — Custom dashboards with real-time metrics
- **Talent Analytics** — Talent matrix, flight risk, succession planning
- **Workforce Resilience** — Org health, what-if scenarios, SPOF ranking, skill gaps, knowledge concentration
- **Reports** — Custom report builder with export
- **World Clock** — Multi-timezone display for global teams

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **React Router 6** | Client-side routing (85+ protected routes) |
| **Zustand** | State management (3 stores) |
| **Tailwind CSS 3** | Utility-first styling |
| **Axios** | HTTP client with JWT interceptor |
| **Recharts** | Charting & data visualization |
| **Lucide React** | Icon library |
| **React Hook Form** | Form validation |
| **React Hot Toast** | Toast notifications |
| **React Big Calendar** | Calendar views |
| **date-fns** | Date utilities |
| **html2canvas + jsPDF** | PDF generation |
| **xlsx** | Excel import/export |
| **react-select** | Multi-select dropdowns |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose 8** | Database & ODM (89 models) |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Socket.io** | Real-time notifications |
| **Passport.js + Azure AD** | SSO authentication |
| **Multer** | File uploads |
| **Nodemailer** | Email notifications |
| **PDFKit** | Server-side PDF generation |
| **Helmet** | Security headers |
| **Express Rate Limit** | Rate limiting |
| **Express Validator** | Input validation |
| **Morgan** | HTTP request logging |
| **json2csv / csv-parser** | CSV processing |
| **OpenAI API** | AI provider (configurable) |

### DevOps & Tooling

| Tool | Purpose |
|---|---|
| **PostCSS + Autoprefixer** | CSS processing |
| **Concurrently** | Run client + server together |
| **Git** | Version control |
| **Cloudflare** | CDN & analytics |

---

## Architecture

```
relisoft-hr/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/                   # 62 page directories (~85 routes)
│   │   │   ├── auth/                # Login
│   │   │   ├── landing/             # Public landing page
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── employees/           # Employee management
│   │   │   ├── leave/               # Leave management
│   │   │   ├── attendance/          # Attendance tracking
│   │   │   ├── payroll/             # Payroll processing
│   │   │   ├── recruitment/         # Recruitment
│   │   │   ├── resilience/          # 13 resilience pages
│   │   │   ├── ai-companion/        # Nova AI chatbot
│   │   │   ├── ai-council/          # AI governance
│   │   │   ├── hr-chatbot/          # HR assistant
│   │   │   ├── sdd/                 # Spec-driven dev
│   │   │   ├── mandir/              # Cultural Compass
│   │   │   └── ... (50+ more)
│   │   ├── components/              # Shared components
│   │   │   ├── layout/              # Sidebar, Header, AppLayout
│   │   │   ├── common/              # Reusable UI (7 components)
│   │   │   └── resilience/          # 21 resilience components
│   │   ├── store/                   # Zustand stores (auth, app, ai)
│   │   ├── hooks/                   # Custom hooks (useAuth, useAI, useData)
│   │   ├── services/                # API service layer (73 API objects)
│   │   ├── data/                    # Static data (companion, policies, etc.)
│   │   ├── context/                 # Theme context (dark mode)
│   │   ├── App.jsx                  # Route definitions
│   │   └── main.jsx                 # Entry point
│   ├── public/                      # Static assets (logos, warli art)
│   └── dist/                        # Production build output
│
├── server/                          # Express backend
│   ├── config/                      # DB, AI, Passport config
│   ├── middleware/                   # Auth, error handler, AI audit
│   ├── controllers/                 # 60+ route controllers
│   ├── routes/                      # 65 route files
│   ├── models/                      # 89 Mongoose schemas
│   ├── services/                    # Business logic (email, documents, etc.)
│   ├── utils/                       # Role enums, helpers, scoring
│   ├── seeds/                       # Demo data seeders
│   └── server.js                    # Entry point (75 API mounts)
│
├── specs/                           # Spec-Driven Development
│   ├── architecture.md              # System architecture
│   ├── openapi.yaml                 # OpenAPI 3.0 contract
│   ├── modules/                     # 36 module specifications
│   ├── database/schema.md           # DB schema specification
│   ├── ai/                          # AI integration specs
│   └── workflows/                   # Dev workflow specs
│
└── package.json                     # Root orchestrator
```

### Data Flow

```
User → Browser → React App
                   │
                   ▼
            ProtectedRoute (JWT check)
                   │
                   ▼
            React Router → Page Component
                   │
                   ▼
            Zustand Store (state)
                   │
                   ▼
            Axios (JWT interceptor)
                   │
                   ▼
            /api/* → Express Server
                        │
                        ▼
                 Auth Middleware (protect + authorize)
                        │
                        ▼
                   Controller
                        │
                        ▼
                   Mongoose → MongoDB
                        │
                        ▼
                   Response → UI
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** 7.0+ (local or Atlas)
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd relisoft-hr

# Install all dependencies (root, client, server)
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.

# Seed demo data (optional)
cd server
node seeds/seedDemoData.js
cd ..

# Start development servers (client + server concurrently)
npm run dev
```

The client starts at **http://localhost:5173** and proxies `/api` requests to the server at **http://localhost:5000**.

### Production Build

```bash
# Build client
cd client
npm run build    # Outputs to client/dist/

# Start server in production
cd ../server
NODE_ENV=production node server.js
```

---

## How to Login

1. Navigate to **http://localhost:5173**
2. You'll see the **Landing Page** — the public marketing page with company info
3. Click **"Sign In"** or **"Get Started"**
4. Use your company email: `firstname.lastname@relisofttechnologies.com`
5. Enter your password

> **Note:** Only `@relisofttechnologies.com` emails are accepted. Registration is managed by HR administrators.

### Demo Credentials

After seeding demo data:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@relisofttechnologies.com | password123 |
| HR Manager | hr@relisofttechnologies.com | password123 |
| Manager | manager@relisofttechnologies.com | password123 |
| Employee | employee@relisofttechnologies.com | password123 |

---

## Role-Based Access

The system implements **10 role levels** with hierarchical permissions:

| Level | Role | Base Role | Access Scope |
|---|---|---|---|
| 1 | Employee | employee | Self-service only |
| 2 | Team Lead | employee | Self + team view |
| 3 | HR | hr | HR operations |
| 4 | Sr. Software Engineer | employee | Self + project view |
| 5 | Manager | manager | Department management |
| 6 | Organization Head | manager | Multi-department |
| 7 | HR L2 | hr | Advanced HR |
| 8 | Manager L2 | manager | Strategic management |
| 9 | Admin | admin | System-wide |
| 10 | Super Admin | admin | Full access |

### Role Definitions

- **Super Admin / Admin**: Full access to all modules, system configuration, audit logs
- **HR**: Employee management, leave/attendance, payroll, recruitment, onboarding, compliance
- **Manager**: Team management, performance reviews, leave approvals, reports
- **Employee**: Self-service — apply leave, view payslips, update profile, access culture hub

### How It Works

**Client-side**: The Sidebar component checks `roles` arrays on each navigation item against the logged-in user's role. Each sidebar category is also filtered by role.

```jsx
// Example from Sidebar.jsx
{ label: 'Payroll', path: '/payroll', icon: DollarSign, roles: ['hr', 'admin', 'finance'] }
// Only users with hr, admin, or finance roles see this link
```

**Server-side**: Every API endpoint has middleware protection:

```javascript
// Protect route (JWT verification)
router.use(protect)

// Role-based authorization
router.get('/', authorize('admin', 'hr'), getPayrolls)
router.post('/', authorize('admin'), createPayroll)
```

**Route-level**: The `ProtectedRoute` component accepts an optional `allowedRoles` prop:

```jsx
<Route element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
```

---

## AI & Automation

### AI Providers

The AI system uses **OpenAI** (configurable) with the following architecture:

```
User Query → AI Service → OpenAI API → Response
                │
                ▼
          AI Audit Log (JSONL)
                │
                ▼
          Human Review (if required)
```

### AI Features

| Feature | Route | Type | Description |
|---|---|---|---|
| **Nova AI Companion** | `/ai-companion` | Client-side | Motivational quotes, jokes, song suggestions, trivia, would-you-rather, riddles, daily wisdom. Multilingual (English/Hindi/Marathi). |
| **HR Assistant** | `/hr-assistant` | Client-side | Policy Q&A covering laptop, appraisal, leave, payroll, training, tickets. Quick action buttons for common queries. |
| **AI Council** | `/ai-council` | Hybrid | AI governance: members, proposals with voting, meetings, policy documents. |
| **Resilience AI** | `/resilience/assistant` | API-based | Natural language queries about workforce data, what-if analysis. |
| **Spec-Driven Dev** | `/sdd` | API-based | Generate specs, code, and code reviews from natural language. |
| **Resume Parser** | _(via API)_ | API-based | Parse and extract structured data from resumes. |
| **Predictive Analytics** | _(via API)_ | API-based | Attrition prediction, training recommendations, skill gap analysis. |

### AI Audit

All AI API calls are logged to `logs/ai-audit.jsonl` with:
- User ID and timestamp
- Request (sanitized — sensitive fields masked)
- Response
- Duration and IP

### Human Review

AI-generated artifacts can optionally require human approval before deployment. Pending reviews are tracked in the `aiStore` and can be managed through the SDD interface.

---

## Theme System

The app supports **3 visual themes** + an independent **dark mode** toggle.

### Visual Themes

| Theme | Toggle Option | Primary Color | Accent | Vibe |
|---|---|---|---|---|
| **Default** | `Palette → Default` | Purple `#982cc7` | Gold `#f1c53d` | Brand identity |
| **Maharashtra** | `Palette → 🇮🇳 Maharashtra` | Saffron `#e65c00` | Gold `#ffd700` | Cultural pride |
| **Cricket & Fun** | `Palette → 🏏 Cricket & Fun` | Green `#1b8c3a` | Orange `#ff6f00` | Energetic fun |

Select from the palette icon in the header. The theme persists across sessions via localStorage.

### Dark Mode

An independent dark/light toggle is provided via `ThemeContext`. It works orthogonally to the three visual themes — any theme can be viewed in light or dark mode.

### CSS Variable System

Each theme overrides the same set of CSS custom properties:

```
--moss         Primary brand color
--moss-dark    Darker primary
--copper/gold  Accent color
--sage         Light background
--teal         Secondary
--danger       Error
--ink          Text color
--muted        Muted text
--paper        Page background
--panel        Card background
--line         Border color
--header-bar   Header accent bar
--shadow       Box shadow
```

---

## Spec-Driven Development

The entire application is built from **formal specifications** stored in the `specs/` directory. This ensures:

### Spec Hierarchy

```
specs/
├── architecture.md              # System architecture & design decisions
├── openapi.yaml                 # Full OpenAPI 3.0 contract with all endpoints
├── modules/                     # 36 individual module specs
│   ├── employee-management.md
│   ├── leave-management.md
│   ├── payroll.md
│   ├── recruitment.md
│   └── ... (36 total)
├── database/
│   └── schema.md                # Complete schema with 89 models
├── ai/
│   ├── ai-integration.md        # AI integration patterns
│   └── advanced-ai-features.md  # Advanced AI capabilities
└── workflows/
    └── development-workflow.md  # Development process
```

### AI-Powered Development Flow

The SDD module (`/sdd`) allows:

1. **Generate Spec** — Describe a feature in natural language, AI generates a formal specification
2. **Generate Code** — From an approved spec, AI generates production-ready code
3. **Review Code** — AI reviews existing code against project standards

```
Natural Language → AI → Spec Document → Review → AI → Code → Review → Deploy
```

---

## Module Overview

### Core HR (9 modules)
- **Dashboard** — Central KPIs, quick actions, notifications
- **Employee Management** — Directory, profiles, documents, change requests
- **Leave Management** — Policies, balances, applications, approvals, comp-off
- **Attendance** — Daily logs, regularization, reports
- **Shift Management** — Templates, assignments, rotation
- **Holiday Management** — Holiday calendar, floater holidays
- **Timesheets** — Entry, approval, project tracking
- **Payroll** — Runs, payslips, tax declarations, salary structures
- **FnF Settlement** — Full & Final calculation and processing

### Talent Management (7 modules)
- **Recruitment** — Job requisitions, applicants, interviews, offers
- **Onboarding** — Checklists, documents, task tracking, self-service form
- **Performance** — Cycles, KRAs, reviews, feedback, goal tracking
- **Training** — Courses, registrations, certifications, learning paths
- **Workforce Planning** — Manpower planning, hiring forecasts
- **Internal Mobility** — Internal job postings, applications
- **Talent Analytics** — Talent matrix, flight risk, 9-box grid

### Engagement & Culture (7 modules)
- **Social Feed** — Posts, comments, likes, media sharing
- **Recognition** — Peer awards, badges, shoutouts
- **Surveys** — Creation, distribution, response analytics
- **Announcements** — Company-wide and targeted communications
- **Alumni Portal** — Former employee network
- **News Feed** — Company news and updates
- **Cultural Compass** — Indian art, dance, festivals, recipes, languages, wellness

### ITSM & Procurement (8 modules)
- **Service Catalog** — Service definitions, categories, fulfillment
- **Service Requests** — Request lifecycle management
- **Helpdesk** — IT ticket creation, assignment, SLAs
- **HR Tickets** — HR-specific support tickets
- **IT Assets** — Hardware inventory, allocation, lifecycle
- **Software Licenses** — License tracking, allocation, compliance
- **Procurement** — PR, PO, GRN, invoice workflow
- **Policies** — Policy library, acknowledgments, versioning

### Workplace (8 modules)
- **Assets** — Physical asset tracking
- **Travel & Expenses** — Requests, approvals, claims
- **Document Management** — Employee documents, templates
- **Contractors** — Vendor management
- **Visitors** — Pre-registration, check-in/out
- **Gate Passes** — Asset movement authorization
- **Virtual ID Cards** — Digital identity cards
- **Profile Change Requests** — Self-service profile updates

### Governance (6 modules)
- **Separation** — Full offboarding workflow
- **Workflows** — Custom approval flow designer
- **Compliance** — Regulatory tracking
- **Case Management** — Disciplinary and grievance cases
- **Security** — Audit logs, access reviews
- **Visa & Passport** — Travel document management

### Resilience (13 modules)
- **Landing** — Module overview
- **Dashboard** — Org health metrics
- **Employees** — Resilience employee profiles
- **What-If** — Scenario simulation
- **SPOF Ranking** — Single Point of Failure analysis
- **Skill Gaps** — Competency gap identification
- **Succession Planning** — Replacement readiness
- **Knowledge Concentration** — Knowledge risk assessment
- **Workforce Readiness** — Preparedness scoring
- **Reports** — PDF report generation
- **Upload** — Data import
- **AI Assistant** — Natural language query interface

### AI & Automation (6 modules)
- **Nova AI Companion** — Employee wellness AI
- **HR Assistant** — Policy chatbot
- **AI Council** — Governance platform
- **Automation** — Rules engine
- **Integrations** — Third-party connections
- **Spec-Driven Dev** — AI-powered development

### Utilities (4 modules)
- **Admin Panel** — System configuration
- **Notifications** — Notification center
- **World Clock** — Multi-timezone display
- **Mobile** — Mobile app information

---

## API Structure

The server mounts **75 route groups** under `/api/`:

```
/api/auth
/api/employees
/api/leaves
/api/attendance
/api/payroll
/api/recruitment
/api/onboarding
/api/shifts
/api/holidays
/api/performance
/api/training
/api/assets
/api/tickets
/api/travel-expenses
/api/documents
/api/surveys
/api/compliance
/api/workflows
/api/notifications
/api/separation
/api/roles
/api/settings
/api/analytics
/api/reports
/api/dashboard
/api/ai
/api/social
/api/alumni
/api/expenses
/api/resilience
/api/fnf
/api/integrations
/api/ai-council
/api/visa
/api/leave-types
/api/certifications
/api/sdd
/api/ai-integration
/api/workforce
/api/internal-mobility
/api/benefits
/api/contractors
/api/visitors
/api/cases
/api/forms
/api/talent-analytics
/api/document-templates
/api/service-categories
/api/service-catalog
/api/service-requests
/api/it-assets
/api/software-licenses
/api/license-allocations
/api/purchase-requisitions
/api/purchase-orders
/api/goods-receipts
/api/invoices
/api/policies
/api/policy-acknowledgments
/api/profile-change-requests
/api/gate-passes
/api/virtual-id-cards
/api/workspace
/api/excel
/api/news
/api/vendors
```

### Authentication

Every API call (except `/api/auth/login`) requires a JWT token:

```
Authorization: Bearer <token>
```

The client's Axios interceptor automatically attaches this. On 401 responses, the user is redirected to the login page.

---

## Benefits

### For Employees
- **Self-Service Portal** — Apply leave, view payslips, update profile, track attendance
- **AI Assistant** — Instant answers to HR policy questions
- **Cultural Compass** — Explore India's heritage with interactive content
- **Wellness Corner** — Meditation timer, breathing exercises, wellness tips
- **Gratitude Wall** — Share appreciation with colleagues
- **Social Feed** — Connect with teammates
- **Nova AI Companion** — Motivational quotes, jokes, daily wisdom
- **Virtual ID Card** — Digital identification
- **World Clock** — Track global team timezones

### For HR & Managers
- **Complete Employee Lifecycle** — From recruitment to separation
- **Real-Time Analytics** — Dashboard with KPIs and trends
- **Role-Based Dashboards** — Different views for HR, managers, admins
- **Approval Workflows** — Customizable approval chains
- **Compliance Tracking** — Regulatory requirement monitoring
- **Workforce Resilience** — Identify risks, plan succession, analyze skill gaps
- **Bulk Operations** — Excel import/export

### For Administrators
- **Full System Control** — Configuration, roles, permissions
- **Audit Logs** — Complete action history
- **AI Governance** — Council management, proposal voting
- **Integration Hub** — Connect with external systems
- **Security Controls** — Access management, threat monitoring

---

## Future Additions

### Short Term
- ✅ Spec-Driven Development module (SDD) — *Complete*
- ✅ Cultural Compass with theme integration — *Complete*
- ✅ Public landing page — *Complete*
- Mobile-responsive improvements for all modules
- Real-time notification system via WebSockets

### Medium Term
- **Employee Self-Service Mobile App** (React Native)
- **Advanced AI Analytics** — Predictive attrition with ML models
- **Document AI** — Auto-classification and extraction
- **Smart Scheduling** — AI-driven shift optimization
- **Expense OCR** — Receipt scanning and auto-categorization
- **Multi-Language Support** — Full i18n (Hindi, Marathi, English)

### Long Term
- **Payroll Integration** — Direct bank transfer APIs
- **Blockchain for Document Verification** — Tamper-proof credentials
- **Voice-Activated HR Assistant** — Multilingual voice interface
- **Advanced Workforce Planning** — AI-powered demand forecasting
- **Open API Marketplace** — Public API for third-party integrations
- **Geographic Expansion** — Multi-entity, multi-currency support

---

## Project Stats

| Metric | Value |
|---|---|
| **Protected Routes** | ~85 |
| **MongoDB Models** | 89 |
| **API Endpoints** | 75 base route groups |
| **Module Specs** | 36 |
| **API Service Objects** | 73 |
| **Frontend Pages** | 62 page directories |
| **Server Controllers** | 60+ |
| **Zustand Stores** | 3 |
| **Custom Hooks** | 5+ |
| **Theme Variants** | 3 visual themes + dark mode |
| **AI Features** | 10+ |
| **Role Levels** | 10 |
| **Employees Supported** | Scalable to 1000s |

---

## License

© 2026 ReliSoft Technologies Private Limited. All rights reserved.

**Pune Office:** 204, RedBricks, Panchshil Business Park, Level 2, Tower B & C, Balewadi High Street, Pune, Maharashtra 411045  
**USA Office:** 733 Struck Street, Unit 44100, Madison, WI 53744 USA  
**Phone:** +91-7559406966  
**Email:** contact@relisofttechnologies.com  
**Web:** [relisofttechnologies.com](https://relisofttechnologies.com)
