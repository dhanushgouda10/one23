# one23 — Frontend

one23 groups Bengaluru office commuters going the same way into groups of three, so they can share an auto or cab. This repo is the web frontend. It talks to a separate Spring backend over REST and WebSockets.

## Tech stack

| Area | Library |
|---|---|
| UI | React 19 (function components + hooks, `.jsx`) |
| Build / dev server | Vite 8 + `@vitejs/plugin-react` |
| Routing | react-router-dom 7 |
| Styling | Plain CSS, all in `src/styles.css` (no Tailwind / CSS-in-JS) |
| Map | Leaflet + OpenStreetMap tiles (lazy-loaded on the group lobby page) |
| Real-time | STOMP over SockJS (`@stomp/stompjs`, `sockjs-client`) |
| Code quality | ESLint 10 (react-hooks, react-refresh) + Prettier |

## Getting started

Requirements: Node.js 20+ and npm.

```sh
npm install        # or: npm ci
npm run dev        # http://localhost:5173
```

The backend should be running on `http://localhost:8080` (the default).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | Run ESLint on all `.js` / `.jsx` files |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without changing files |

### Environment variables

Copy `.env.example` to `.env` if you need to override the defaults. Vite only exposes variables that start with `VITE_`, and it bakes them in at **build time**.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Backend REST base URL |
| `VITE_WS_URL` | `${VITE_API_URL}/ws` | SockJS/STOMP endpoint |

For production, use `https://` URLs. SockJS switches to `wss://` on its own.

## Project structure

```
index.html                 HTML shell; loads Google Fonts and /src/main.jsx
vite.config.js             React plugin + `global` → `globalThis` shim (needed by sockjs-client)
eslint.config.js           ESLint flat config
src/
  main.jsx                 React root (StrictMode + BrowserRouter)
  App.jsx                  Route table + global <Toaster />
  styles.css               All styles (design tokens, layout, components)
  components/
    AppShell.jsx           Signed-in layout (sidebar / mobile nav, logout)
    AuthShell.jsx          Login / signup layout
    MarketingLayout.jsx    Landing-page header + footer
    Button.jsx, Input.jsx  Basic form controls
    primitives.jsx         StatusBadge, Chip, Avatar, EmptyState, ErrorState, SkeletonCard, PageLoader
    GroupLobbyMap.jsx      Leaflet map: pickup, destination and live rider pins
    Icons.jsx, Logo.jsx, SectionHeading.jsx, Toaster.jsx
  pages/                   One component per route (see below)
  hooks/
    useRequireAuth.js      Redirects to /login when there's no session
  lib/
    api.js                 fetch wrapper + all REST calls
    websocket.js           STOMP clients for match / chat / location / group events
    session.js             Token + user info in sessionStorage
    config.js              Reads VITE_API_URL / VITE_WS_URL
    toast.js               Tiny pub/sub used by <Toaster />
    locations.js           Pickup hubs and destinations shown on the Join page
    hubCoordinates.js      Lat/lng for those places (used by the map)
    utils.js               initialsOf(), escapeHtml()
```

## Routes

| Path | Page | Login required |
|---|---|---|
| `/` | `HomePage` — landing page | No |
| `/login` | `LoginPage` | No |
| `/signup` | `SignupPage` (signs up, then logs in) | No |
| `/dashboard` | `DashboardPage` — overview + quick actions | Yes |
| `/join` | `JoinPage` — pick a pickup hub and destination | Yes |
| `/rides` | `MyRidesPage` — your rides; refreshes live when a group forms | Yes |
| `/rides/:groupId` | `GroupLobbyPage` — group chat, live map, start / end / cancel ride | Yes |
| `*` | `NotFoundPage` | No |

## Backend contract

### REST (`src/lib/api.js`)

The JWT is sent as `Authorization: Bearer <token>` on every call except `/api/auth/*`. A `401` clears the session and sends the user to `/login?sessionExpired=1`.

| Method | Path | Used for |
|---|---|---|
| POST | `/api/auth/signup` | Create account `{ fullName, email, password }` |
| POST | `/api/auth/login` | Log in `{ email, password }` → `{ token, fullName, email }` |
| POST | `/api/join` | Request a ride `{ pickupHub, destination }` |
| GET | `/api/my-rides` | List the current user's rides |
| PATCH | `/api/rides/{rideId}/cancel` | Cancel a waiting ride |
| GET | `/api/groups/{groupId}` | Group details and members |
| GET | `/api/chat/{groupId}` | Chat history |
| PATCH | `/api/rides/{groupId}/start` | Start the ride |
| PATCH | `/api/rides/{groupId}/end` | End the ride |
| PATCH | `/api/rides/{groupId}/cancel-group` | Cancel the ride for the whole group |

Errors are read from `{ message }` or `{ fieldErrors: { field: message } }`.

### WebSocket (`src/lib/websocket.js`)

The client connects with SockJS to `VITE_WS_URL` and sends the JWT in the STOMP CONNECT headers. It reconnects every 5 s and sends heartbeats every 10 s.

| Direction | Destination | Payload / meaning |
|---|---|---|
| Subscribe | `/topic/match` | A group was formed. My Rides reloads (and falls back to 5 s polling if the socket fails). |
| Subscribe | `/topic/chat/{groupId}` | New chat message |
| Subscribe | `/topic/location/{groupId}` | `{ userName, latitude, longitude }` |
| Subscribe | `/topic/group/{groupId}` | `{ type: "STARTED" \| "COMPLETED" \| "DISSOLVED", message }` |
| Send | `/app/chat/{groupId}` | `{ message }` |
| Send | `/app/location/{groupId}` | `{ latitude, longitude }` |

## Notes

- The session is kept in `sessionStorage`, so it ends when the tab closes.
- Text from users (names, place names) is escaped before it goes into Leaflet tooltips and markers, because Leaflet renders those strings as HTML.
- `node_modules` contains platform-specific binaries. Run `npm ci` again after moving the project to a different OS.
- See `AUDIT_REPORT.md` for the stack audit and the changes made from it.
