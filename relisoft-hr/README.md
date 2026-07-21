# ReliSoft HR Portal

> **Phase 1 — Core HR** is live: Employee registration, leave management, ticket system, and onboarding/offboarding.  
> Built for ReliSoft Technologies Private Limited.

---

## Quick Start

### Run both simultaneously

```powershell
cd C:\Path\To\relisoft-hr
npm run dev
```

This starts the .NET backend (`localhost:5049`) and Vite frontend (`localhost:5173`) together.

### Or run separately

**Terminal 1 — Server:**
```powershell
cd server
dotnet run
```
Wait for: `Now listening on http://localhost:5049`

**Terminal 2 — Client:**
```powershell
cd client
npm run dev
```
Open **http://localhost:5173**

### Demo Logins

All users share password: **`password`**

| Username | Name | Role |
|---|---|---|
| `preeti` | Preeti Patil | HR L2 |
| `hr` | Super HR | HR L2 |
| `unnati` | Unnati Gawali | HR |
| `rakesh` | Rakesh Patil | Organization Head |
| `arif` | Arif Nadeem Mirza | Manager L2 |
| `girish` | Girish Patil | Manager L2 |
| `shreerang` | Shreerang Joshi | Manager |
| `prathamesh` | Prathamesh Katikar | Employee |
| `aradhana` | Aradhana Shinde | Employee |
| `bhushan` | Bhushan Babras | Employee |
| `sopan` | Sopan Bidgar | Employee |
| `supriya` | Supriya Gaikwad | Employee |

---

## Phase 1 — Core HR (Current)

The first phase covers the essential HR operations needed for day-to-day workforce management.

### Features

| Area | Features | Roles |
|---|---|---|
| **Employee Registration** | Create employee records, assign roles/teams, generate employee codes | HR |
| **Leave Management** | Apply leave, balance check, reviewer inbox, bulk upload balances, leave calendar with holidays | All |
| **Ticket System** | Raise support tickets, HR queue, timeline tracking, cancellation | All |
| **Onboarding** | Self-service profile (PAN, Aadhaar, bank, experience, documents), HR onboarding dashboard with 6-step checklist, bulk onboarding, candidate form | Employee + HR |
| **Offboarding** | Full offboarding workflow with asset handover and ID deactivation | HR |
| **Directory** | Searchable employee directory with project/team hierarchy | All |
| **Leave Policy** | Configure leave types, carry-forward, comp-off, floater holidays, sandwich leave | HR |
| **Settings** | Change your own password | All |

### Sidebar Structure

- **HR section** — HR Home, Leave Policy, New Employee, Bulk Uploads, Onboarding Dashboard, Offboarding
- **Employee section** — Apply Leave, My Onboarding, Tickets
- **Reviews section** — Leave Review (manager/HR inbox)
- **Tools section** — Overview, Directory, Leave Calendar, Settings

---

## Phase 2 — Extended HR (Planned)

Extended HR features that build on the Phase 1 foundation.

| Area | Features |
|---|---|
| **Projects & Teams** | Project CRUD, team management, team lead assignment |
| **Org Chart** | Visual hierarchy pyramid from Organization Head down to teams |
| **HR Analytics** | KPIs, headcount tracking, department distribution, attrition insights |
| **Attendance** | Clock in/out, attendance history, daily records |
| **Announcements** | Company-wide announcements and updates |
| **Knowledge Base** | HR policies, FAQs, company guides |
| **Employee Dashboard** | Personal workspace with quick-access tiles |
| **Probation & Appraisal** | Probation cycles, performance reviews, intern-to-permanent conversion |
| **Salary & Documents** | Salary discussions, auto-generate offer letters, joining letters, Form 16 |
| **Asset Management** | Track company assets, assignments, and returns |

---

## Phase 3 — Employee Experience (Planned)

Engagement and workplace tools.

| Area | Features |
|---|---|
| **Mood & Sentiment** | Daily check-in, team mood trends, org-wide sentiment |
| **Skills & Brag Board** | Skill endorsements, celebrate wins, peer recognition |
| **Mentorship** | Mentor matching, session tracking, program management |
| **Rewards Store** | Points system, catalog browsing, redemptions |
| **Training & Learning** | Course catalog, registrations, certifications |
| **Surveys** | Create and respond to employee surveys |
| **Notifications** | Notification center with read/unread tracking |

---

## Phase 4 — Workplace & Productivity (Planned)

Workplace management and productivity tools.

| Area | Features |
|---|---|
| **Carpool & Commute** | Route registration, match finding, carpool groups |
| **Desk & Room Booking** | Hot desk reservation, meeting room booking, availability |
| **Timesheets** | Billable hours tracking, period submission, approvals |
| **Expense Management** | Expense claims, category management, reimbursements |
| **Shift Management** | Shift templates, assignments, swap requests |
| **Visitor Management** | Pre-registration, check-in/out, today's visitors |
| **Loans & Advances** | Loan types, apply, track repayments, approvals |
| **Benefits** | Benefit plans, enrollment, coverage management |

---

## Phase 5 — Governance & Compliance (Planned)

Enterprise governance features.

| Area | Features |
|---|---|
| **Internal Mobility** | Internal job postings, applications, shortlisting |
| **Compliance Tracker** | Regulatory requirements, compliance records, dashboard |
| **Contractor Management** | Vendor contracts, contractor employee management |
| **HR Docs & Templates** | Document templates, auto-generation, employee documents |

---

## Phase 6 — Workforce Resilience (Planned)

AI-powered workforce intelligence (TruPulse AI).

| Area | Features |
|---|---|
| **Org Health Dashboard** | Composite resilience score, KPI indicators |
| **Workforce Employees** | Detailed profiles with criticality, performance, workload |
| **What-If Simulator** | Simulate departures, measure org health impact |
| **SPOF Analysis** | Single Point of Failure ranking |
| **Skill Gap Analysis** | Team-level knowledge coverage |
| **Succession Planning** | Backfill readiness for critical roles |
| **Knowledge Concentration** | Bus-factor risk analysis |
| **Workforce Readiness** | Project pipeline capacity utilization |
| **AI Assistant** | Natural language queries about workforce data |
| **Governance Panel** | Human-in-the-loop feedback and override management |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Can't log in** | Server must be running (localhost:5049). Use any username with password `password`. |
| **Blank page** | Both terminals must be running. Refresh (F5). Check F12 Console for errors. |
| **"Failed to fetch"** | Server stopped. `Ctrl+C` in server window, then `dotnet run` again. |
| **SQL errors** | Database is created automatically. If migration fails, run `dotnet ef database update` in the server folder. |
| **Windows blocks server** | Run `Unblock-File` on the `.dll` and `.exe` files, then restart. |
| **Port in use** | Close the other program or change ports in config files. |

---

## Support

**ReliSoft Technologies Private Limited**  
204, RedBricks, Panchshil Business Park, Level 2, Tower B & C  
Balewadi High Street, Pune, Maharashtra 411045  
📞 +91-7559406966 | 📧 contact@relisofttechnologies.com

© 2026 ReliSoft Technologies Private Limited. All rights reserved.

---

> For developers: see `TECHNICAL.md` in this folder for setup, architecture, API docs, and test suite.
