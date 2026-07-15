# ReliSoft HR Portal — User Guide

> **Phase 1 is live.** Leave management, employee directory, hierarchy view, onboarding, and support tickets. Built for ReliSoft Technologies Private Limited.

---

## Quick Start

### 1. Start the Server

Open **PowerShell** and run:

```powershell
cd C:\Path\To\relisoft-hr\server
dotnet run
```

Wait until you see:  
`Now listening on http://localhost:5049`  
*(Keep this window open.)*

### 2. Start the App

Open a **second** PowerShell window and run:

```powershell
cd C:\Path\To\relisoft-hr\client
npm run dev
```

Open **http://localhost:5173** in your browser.

### 3. Log In

| Username | Password | Role |
|---|---|---|
| `preeti` | `password` | HR L2 (can do everything) |
| `rakesh` | `password` | Organization Head (approves leaves) |
| `aradhana` | `password` | Employee (applies leave, raises tickets) |
| `arif` | `password` | Technical Manager L2 (approves leaves) |
| `girish` | `password` | Technical Manager L2 (approves leaves) |
| `shreerang` | `password` | Quality Lead — oversees all areas |
| `prathamesh` | `password` | Quality Engineer — TLM / LQM |

> ⚠️ **Password is always `password`** for all demo accounts.

---

## How to Use Each Feature

### Leave Management

**All employees** can apply for leave, check balance, and cancel.

1. Click **Leave** in the sidebar
2. Pick leave type, dates, and reason → click **Submit leave request**
3. Your requests appear below under **My leave requests**
4. **Pending:** click **Withdraw** to cancel / **Approved:** click **Request cancellation**
5. **Comp-Off:** click **Apply comp off** for weekend/holiday work

**Managers & HR:** Click **Reviewer inbox** → see team requests → **Approve** or **Reject**.

### Support Tickets

**All employees** can raise tickets; **HR** manages the queue.

1. Click **Tickets** → fill category, subject, description → **Raise ticket**
2. Track your tickets under **My tickets**
3. Click **Cancel request** to close a ticket
4. **HR:** click **HR queue** tab → assign tickets, add timeline updates

### Employee Directory

1. Click **Directory** → search by name → view profile
2. **HR only:** edit employee details directly

### Onboarding

1. Click **Onboarding** → fill PAN, Aadhaar, bank info, experience → upload documents → **Save profile**
2. **HR:** dashboard shows all pending profiles with a 6-step checklist

### Org Chart

Click **Org Chart** → see the company hierarchy from Organization Head down to teams.

### Calendar

Click **Calendar** → see who's on leave. Navigate between months.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| **Can't log in** | Server must be running (localhost:5049). Use any username below with password `password`. |
| **Blank page** | Both terminals must be running. Refresh (F5). Check F12 Console for errors. |
| **"Failed to fetch"** | Server stopped. `Ctrl+C` in server window, then `dotnet run` again. |
| **SQL errors** | Database is created automatically. If migration fails, run `dotnet ef database update` in the server folder. |
| **Windows blocks server** | Run `Unblock-File` on the `.dll` and `.exe` files, then restart. |
| **Port in use** | Close the other program or change ports in config files. |

---

## Passwords

| Username | Password |
|---|---|
| `preeti` | `password` |
| `rakesh` | `password` |
| `aradhana` | `password` |
| `arif` | `password` |
| `girish` | `password` |
| `shreerang` | `password` |
| `prathamesh` | `password` |

To add employees with real passwords, use **Employee Registration** (HR users only).

---

## Phase 1 Features

- **Leave:** 10 leave types, policy rules, balance tracking, Loss of Pay detection, comp-off, medical certificates, leave calendar
- **Directory:** Searchable, HR-editable, 10 role levels, project/team hierarchy
- **Onboarding:** Self-service profile, document upload, HR dashboard, bulk onboarding, offboarding
- **Tickets:** Multi-category, timeline events, employee view + HR queue

---

## Support

**ReliSoft Technologies Private Limited**  
204, RedBricks, Panchshil Business Park, Level 2, Tower B & C  
Balewadi High Street, Pune, Maharashtra 411045  
📞 +91-7559406966 | 📧 contact@relisofttechnologies.com

© 2026 ReliSoft Technologies Private Limited. All rights reserved.

---

> For developers: see `TECHNICAL.md` in this folder for setup, architecture, API docs, and test suite.
