# Relisoft-HR-Portal

Full-stack enterprise HRMS for **ReliSoft Technologies Private Limited** — .NET 10 + React + SQL Server.

```text
relisoft-hr/
├── README.md           # User guide, demo logins, feature matrix
├── TECHNICAL.md        # Architecture, API list, test suite, deployment
├── TEAM_DOCUMENTATION.md  # Team handbook & module-by-module breakdown
├── client/             # React (Vite) frontend
└── server/             # .NET 10 Web API

scripts/
├── seed-demo.ps1       # Seeds full demo data + verifies no 404s
└── sweep-endpoints.ps1 # Sweeps all GET endpoints for 500/404
```

## Quick start

```powershell
cd relisoft-hr
npm run dev          # starts backend (:5049) + frontend (:5173) together
```

Open http://localhost:5173 — login with any demo username and password `password`.

The demo dataset is seeded automatically on backend startup. To reseed/verify on
demand (HRL2/HR session required):

```powershell
.\scripts\seed-demo.ps1           # seeds + verifies the 10 key endpoints return 200
.\scripts\sweep-endpoints.ps1     # sweeps all 147 GET endpoints, reports non-2xx
```

Every non-2xx HTTP response shows a dedicated error page (see
`relisoft-hr/TECHNICAL.md` → "Error Pages") instead of a blank screen.

See `relisoft-hr/README.md` for demo logins and the full feature list.