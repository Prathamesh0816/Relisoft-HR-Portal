# ReliSoft HR Portal — Frontend App

This is the website you see in the browser. It talks to the .NET server to show data and handle your actions.

### Quick Start

```bash
npm install           # Install once
npm run dev           # Start the app (http://localhost:5173)
npm run build         # Build for production (outputs to dist/)
npm test              # Run 34 component + API tests
```

The app needs the .NET server running on http://localhost:5049 to work.

### What's Here

- `src/components/` — 60 pages and screens (leave forms, tickets, directory, onboarding, etc.)
- `src/api.js` — All the calls to the server (1,200+ lines)
- `src/store.js` — Central data storage for the app
- `src/App.jsx` — Main app screen with login flow
- `src/__tests__/` — 34 automated tests

See the main [README](../README.md) for usage instructions and [TECHNICAL.md](../TECHNICAL.md) for developer docs.
