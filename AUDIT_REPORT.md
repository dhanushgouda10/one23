# one23 Frontend — Stack Audit & Change Proposal

**Date:** 6 Oct 2026 · **Status:** ✅ Approved and implemented (C1–C3)

---

## 1. Verdict

**The project is already 100% React + JSX.** No other framework or language was found, so **no stack migration is needed**.

| Check | Result |
|---|---|
| UI framework | React 19.2 (`react`, `react-dom`) |
| Component files | All `.jsx` (17 components/pages), helpers are plain `.js` |
| Entry point | `src/main.jsx` → `createRoot(...)` with `<StrictMode>` + `<BrowserRouter>` |
| Build tool | Vite 8 + `@vitejs/plugin-react` |
| Routing | `react-router-dom` 7 |
| Styling | One plain CSS file, `src/styles.css` (~2,400 lines). **No Tailwind** |
| Map | Leaflet, wrapped in a React component (`GroupLobbyMap.jsx`), lazy-loaded |
| Real-time | STOMP over SockJS (`@stomp/stompjs`, `sockjs-client`) |
| TypeScript / Vue / Svelte / Angular / jQuery | **None found** |
| Class components | None. All function components + hooks |
| Production build | ✅ Builds cleanly (112 modules, ~117 kB gzip JS) |

---

## 2. Project structure (current)

```
index.html              → mounts /src/main.jsx, loads Google Fonts
vite.config.js          → React plugin + `global` shim for sockjs
src/
  main.jsx, App.jsx     → root + routes
  styles.css            → all styling
  components/           → AppShell, AuthShell, MarketingLayout, Button, Input,
                          Icons, Logo, SectionHeading, Toaster, primitives, GroupLobbyMap
  pages/                → Home, Login, Signup, Dashboard, Join, MyRides, GroupLobby, NotFound
  hooks/useRequireAuth.js
  lib/                  → api, websocket, session, config, toast, utils, locations, hubCoordinates
```

### Routes
| Path | Page | Auth |
|---|---|---|
| `/` | HomePage | – |
| `/login`, `/signup` | LoginPage, SignupPage | – |
| `/dashboard` | DashboardPage | ✔ |
| `/join` | JoinPage | ✔ |
| `/rides` | MyRidesPage | ✔ |
| `/rides/:groupId` | GroupLobbyPage (chat, live map, start/end ride) | ✔ |
| `*` | NotFoundPage | – |

---

## 3. Findings

| # | Severity | Finding |
|---|---|---|
| F1 | Medium | `README.md` is the original Lovable prompt + boilerplate. It says the app uses **Tailwind** and lists pages that don't exist — it doesn't describe the real project. |
| F2 | Medium (security) | `GroupLobbyMap.jsx` passes rider **names** straight into Leaflet `bindTooltip(name)`. Leaflet renders strings as HTML, so a user named e.g. `<img src=x onerror=...>` could run script in other riders' browsers. |
| F3 | Low | No linter. `.prettierrc` exists but Prettier isn't installed and there's no `lint`/`format` script. |
| F4 | Info | `node_modules` was installed on macOS; fine for your Mac, just reinstall (`npm ci`) on other OSes. |
| F5 | Info | `window.confirm()` is used for cancel dialogs; `window.location.href` for logout/session-expiry redirects. These work, and changing them would alter UI/behaviour, so **left as-is**. |

---

## 4. Proposed changes (waiting for your "yes")

**UI guarantee:** none of these touch `styles.css`, JSX markup, class names, text, layout or routes. The app will look and behave exactly the same.

| # | Change | Files | UI impact |
|---|---|---|---|
| C1 | Rewrite `README.md` with accurate docs: stack, setup, env vars, scripts, folder structure, routes, backend endpoints/WebSocket topics | `README.md` | None |
| C2 | Fix F2: build map tooltips/pins from escaped text instead of raw HTML | `src/components/GroupLobbyMap.jsx` | None (same look) |
| C3 | Add ESLint (React + hooks rules) and Prettier as dev dependencies with `npm run lint` / `npm run format` scripts | `package.json`, new `eslint.config.js` | None (dev tooling only) |

**Not changing:** the stack (already React JSX), styling approach (stays plain CSS — converting to Tailwind would risk visual changes), components, pages, or any behaviour.

After implementation I'll re-run the production build to confirm nothing broke.

---

## 5. Implementation log

| # | Done | Details |
|---|---|---|
| C1 | ✅ | `README.md` rewritten: stack, setup, scripts, env vars, structure, routes, REST and WebSocket contract. |
| C2 | ✅ | New `escapeHtml()` in `src/lib/utils.js`. `GroupLobbyMap.jsx` escapes the pin label and every tooltip (pickup, destination, rider name). Pins and tooltips look the same. |
| C3 | ✅ | Added dev dependencies `eslint@10`, `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` and `prettier`. Added `eslint.config.js` and the scripts `lint`, `format` and `format:check`. |

**Verification:** `npm run build` ✅ · `npm run lint` ✅ (0 errors, 4 warnings).

The 4 lint warnings are in existing code. They were left alone on purpose because fixing them changes runtime behaviour:
- `useRequireAuth.js:14` and `GroupLobbyPage.jsx:54`: setState called directly inside an effect.
- `MyRidesPage.jsx:79`: `startPolling` is missing from the effect dependencies.
- `GroupLobbyMap.jsx:103`: `pickupCoords` and `destCoords` are missing from the effect dependencies. They're derived from props that are already listed, so this is safe.

Prettier reports 14 files that don't match `.prettierrc`. They were **not** reformatted. Run `npm run format` whenever you want. It only changes whitespace and quotes, never the UI.
