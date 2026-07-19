# Relisoft HR Portal

Full-stack HR portal for ReliSoft Technologies.

## Project Layout

- `relisoft-hr/client` - React/Vite frontend
- `relisoft-hr/server` - ASP.NET Core API
- `relisoft-hr/server/RelisoftHR.Tests` - .NET test project
- `relisoft-hr/specs` - product, module, API, and architecture notes
- `relisoft-hr/ai` - AI service and workflow experiments

## Prerequisites

- Node.js and npm
- .NET SDK matching the server target framework
- SQL Server LocalDB or a SQL Server connection string

## Setup

From the repository root:

```powershell
cd relisoft-hr
npm run install-all
```

If you do not want to use LocalDB, set a connection string before running the server:

```powershell
$env:ConnectionStrings__DefaultConnection = "<your SQL Server connection string>"
```

For real deployments, also set a JWT signing key outside source control:

```powershell
$env:Jwt__Key = "<32+ character secret>"
```

## Run Locally

Start both frontend and backend:

```powershell
cd relisoft-hr
npm run dev
```

Or run them separately:

```powershell
cd relisoft-hr
npm run server
npm run client
```

The frontend runs at `http://localhost:5173`.
The API runs at `http://localhost:5049`.

## Tests

Frontend tests:

```powershell
cd relisoft-hr/client
npm test
```

Backend tests:

```powershell
cd relisoft-hr/server
dotnet test RelisoftHR.Tests/RelisoftHR.Tests.csproj
```

## Git Hygiene

Generated folders such as `bin`, `obj`, `publish`, `.vs`, and frontend build output are ignored. Do not commit compiled DLLs, EXEs, local IDE state, or environment-specific secrets.

Use `appsettings.json` only for safe defaults. Put machine-specific values in environment variables, .NET user-secrets, or `appsettings.Local.json`.

## More Docs

- User guide: `relisoft-hr/README.md`
- Technical notes: `relisoft-hr/TECHNICAL.md`
- Architecture: `relisoft-hr/specs/architecture.md`
