# one23 — Frontend

**one23** matches **3 people who get off at the same Bengaluru metro station and go to the same office**, so they can share **one regular (offline) auto** and **split the fare** (e.g. ₹180 alone → ₹60 each).
The app only matches people. It does not book the auto or take payments.

This folder is the React web app. It talks to the Spring Boot backend (`backendone23`) over REST and WebSocket.

## Tech stack

| Area               | Library                                                             |
| ------------------ | ------------------------------------------------------------------- |
| UI                 | React 19 (function components + hooks, `.jsx`)                      |
| Build / dev server | Vite 8                                                              |
| Routing            | react-router-dom 7                                                  |
| Styling            | **Plain CSS**, all in `src/styles.css` (no Tailwind, no UI library) |
| Map                | Leaflet + OpenStreetMap tiles (only loaded on the group lobby page) |
| Live updates       | STOMP over SockJS (`@stomp/stompjs`, `sockjs-client`)               |
| Code quality       | ESLint + Prettier                                                   |

## Run it

Requirements: Node.js 20+ and the backend running on `http://localhost:8080`.

```sh
npm install
npm run dev        # http://localhost:5173
```

| Command           | What it does                  |
| ----------------- | ----------------------------- |
| `npm run dev`     | Dev server with hot reload    |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/`       |
| `npm run lint`    | ESLint                        |
| `npm run format`  | Prettier                      |

**Environment variables** (optional, copy `.env.example` to `.env`). They're baked in at build time:

| Variable       | Default                 | Purpose                |
| -------------- | ----------------------- | ---------------------- |
| `VITE_API_URL` | `http://localhost:8080` | Backend REST URL       |
| `VITE_WS_URL`  | `${VITE_API_URL}/ws`    | WebSocket (SockJS) URL |

## Folder structure

```
public/
  logo-black.png        Logo for light backgrounds (header, sidebar)
  logo-lime.png         Logo for dark backgrounds (login/signup panel)
  favicon.ico           Browser tab icon (lime logo)
src/
  main.jsx                React starts here (BrowserRouter + App)
  App.jsx                 All routes. Login-only pages are wrapped in <RequireAuth>
  styles.css              All styles (colours at the top in :root)
  pages/                  One file per screen
    HomePage.jsx          Landing page: hero + fare example, how it works, FAQ
    LoginPage.jsx         Login form
    SignupPage.jsx        Signup form (logs in automatically after signup)
    DashboardPage.jsx     "Current ride" card + quick links
    JoinPage.jsx          Pick metro station + office -> POST /api/join
    MyRidesPage.jsx       All my rides, live refresh, cancel a waiting request
    GroupLobbyPage.jsx    One group: start/end ride, leave group, chat, map
    NotFoundPage.jsx      404
  components/             Reusable pieces
    AppShell.jsx          Logged-in layout (sidebar on desktop, bottom nav on phone)
    AuthShell.jsx         Login/Signup layout
    MarketingLayout.jsx   Home page header + footer
    RequireAuth.jsx       Sends logged-out users to /login
    LobbyMembers.jsx      The 3 group members (display only)
    LobbyChat.jsx         Chat box (display + input)
    GroupLobbyMap.jsx     Leaflet map with station, office and live member pins
    PageHeader.jsx, Button.jsx, Input.jsx, primitives.jsx (badge, avatar, loader…),
    Icons.jsx, Logo.jsx, Toaster.jsx
  lib/                    Plain JavaScript helpers (no React)
    api.js                Every REST call to the backend (one function each)
    websocket.js          Every WebSocket subscription / send
    session.js            Token + name + email in sessionStorage
    config.js             Reads VITE_API_URL / VITE_WS_URL
    locations.js          Metro stations + offices shown on the Join page
    hubCoordinates.js     Approximate map positions for those places
    toast.js, utils.js    Pop-up messages, small helpers
```

## How the frontend works

**1. A normal page (REST):**

```
JoinPage  --joinRide()-->  lib/api.js  --fetch POST /api/join + JWT-->  backend
          <-- 1 ride (WAITING) or 3 rides (MATCHED) --
```

- `lib/api.js` adds `Authorization: Bearer <token>` to every call and turns errors into `{ status, data.message }`.
- If the token has expired (401), it logs you out and opens `/login?sessionExpired=1`.

**2. Login:** `LoginPage` → `login()` → the backend returns `{ token, fullName, email }` → `setSession()` saves it in `sessionStorage` → `RequireAuth` now lets you into the logged-in pages.

**3. Live updates (WebSocket):**

| Page        | Subscribes to               | What happens                                                                                |
| ----------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| My rides    | `/topic/match`              | Any group formed → reload the list. If the socket fails, reload every 5 s instead.          |
| Group lobby | `/topic/chat/{groupId}`     | New chat message is added to the list                                                       |
| Group lobby | `/topic/location/{groupId}` | A member's pin moves on the map                                                             |
| Group lobby | `/topic/group/{groupId}`    | `STARTED` / `COMPLETED` → reload the group. `DISSOLVED` → someone left, go back to My rides |

The lobby **sends** to `/app/chat/{groupId}` (`{ message }`) and `/app/location/{groupId}` (`{ latitude, longitude }`, every 5 s while sharing).

**4. Ride lifecycle on screen:**
`WAITING` (Cancel request; expires after 15 min) → `MATCHED` (lobby: Start ride / Leave group) → `IN_PROGRESS` (End ride) → `COMPLETED` (chat still readable).

## Routes

| Path                | Page          | Login |
| ------------------- | ------------- | ----- |
| `/`                 | Home          | –     |
| `/login`, `/signup` | Login, Signup | –     |
| `/dashboard`        | Dashboard     | ✔     |
| `/join`             | Join a ride   | ✔     |
| `/rides`            | My rides      | ✔     |
| `/rides/:groupId`   | Group lobby   | ✔     |
| `*`                 | 404           | –     |

## Interview talking points

1. **Simple structure:** pages (screens) → components (UI pieces) → lib (API/WebSocket helpers). All backend calls live in **one file**, `api.js`.
2. **Auth:** JWT stored in `sessionStorage`, sent on every request; the `<RequireAuth>` wrapper protects pages; a 401 logs you out.
3. **Real-time:** STOMP over WebSocket for chat, location and group events. On My rides, polling every 5 s is the backup if the socket fails.
4. **State with basic hooks only:** `useState` for data, `useEffect` to load data and open/close the WebSocket (with cleanup), `useRef` for values that shouldn't re-render (WebSocket client, timer id).
5. **Small trick worth explaining:** My rides reloads by adding 1 to a `refreshCount` state, which re-runs the loading effect.
6. **Security detail:** names are escaped before they go into Leaflet tooltips (Leaflet renders HTML), to prevent XSS.
7. **Styling:** plain CSS with colour variables in `:root`, mobile-first with two breakpoints (768 px, 1024 px).

## Notes / limitations

- Metro stations are the Purple, Green and Yellow line stations near office areas. Pink line stations can be added in `lib/locations.js` + `lib/hubCoordinates.js`.
- Map positions are approximate (only used to place pins).
- Chat "is this my message?" is decided by **name**, because the backend's chat message only carries the sender's name.
- `node_modules` has OS-specific files. Run `npm ci` again after moving the project to another OS.
