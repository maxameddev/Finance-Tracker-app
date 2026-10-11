# Finance Tracker — Frontend

React (Vite) + shadcn/ui + Tailwind v4 + React Router + Recharts, built against `../Finance-Tracker-API`.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Set the API URL in `.env` (copy from `.env.example`):

```
VITE_API_URL=http://localhost:3000
```

### Backend settings you need

In `Finance-Tracker-API/.env`, allow the Vite dev origin:

```
CORS_ORIGIN=http://localhost:5173
```

The backend's global rate limit is **50 requests / 15 min** (`index.js`). That will run out
quickly during development — consider raising `limit` while developing.

## Structure

```
src/
  lib/api.js          # single API client: base URL, Bearer token, all endpoints
  lib/format.js       # money/date helpers
  hooks/useAuth.jsx   # auth context (token + user in localStorage)
  hooks/useFetch.js   # tiny loading/error/data hook
  hooks/useTheme.js   # dark mode (toggles .dark on <html>)
  components/ui/      # shadcn components
  components/         # Layout (sidebar / mobile drawer), dialogs, ProtectedRoute
  pages/              # Login, Register, Dashboard, Transactions, Reports, Profile
```

## Notes on the API

- Auth: JWT returned by `/auth/login` and `/auth/register`, sent as `Authorization: Bearer <token>`.
  A 401 on any request logs the user out.
- `/transactions` has no query filters, so filtering (category, type, date range) happens in the browser.
- `/transactions/monthly-summary` returns **all-time** totals by category + type; it powers the
  Reports category table. Month-based numbers are computed from `/transactions`.
- The only file upload in the API is the profile picture (`POST /auth/profile-picture`, field
  `profilePicture`, images ≤ 5MB) — available on the Profile page. There is no receipt upload.
- Adding shadcn components later: `npx shadcn@latest add <name>` (components.json is set up for JSX).
