# One23 Frontend — Audit & Change Plan

> Status: **APPLIED on 2026-10-10.** See README.md for how the frontend works now.
> Small difference from the plan: login protection is a `<RequireAuth>` wrapper in App.jsx
> (the old `hooks/useRequireAuth.js` was removed). styles.css ended at ~1,090 lines.

---

## 1. What I audited

| Item | Result |
|---|---|
| Stack | React 19 + Vite 8 + react-router 7, plain JavaScript (JSX), **one plain CSS file**, Leaflet map, STOMP/SockJS for live updates |
| Size | 41 files, ~5,160 lines. **`styles.css` alone is 2,435 lines (47%)** |
| Build | `npm run build` ✅ passes (ran it in my workspace, 112 modules, 118 kB gzip JS) |
| Lint | `npm run lint`: 0 errors, **4 warnings** |
| Pages | Home, Login, Signup, Dashboard, Join, My Rides, Group Lobby (chat + map + start/end), 404 |
| Backend compatibility | ✅ Works with the new backend (login 401 is already shown as "Invalid email or password") |

**What's already good:** clean folder structure (`pages/ components/ lib/ hooks/`), all API calls in one file (`lib/api.js`), all WebSocket code in one file (`lib/websocket.js`), loading/empty/error states, XSS-safe map tooltips, auto-reconnect plus polling fallback on My Rides.

---

## 2. Problems found

### A. The app doesn't describe *your* idea (metro → office, offline auto, split fare)
| # | Problem |
|---|---|
| A1 | The **pickup list is neighbourhoods, not metro stations**. Koramangala, Bellandur, Marathahalli, Sarjapur Road, HSR Layout, Hebbal and Yelahanka have **no metro station**. |
| A2 | The copy says "pickup hub" and "share an **auto or cab**". Your idea is: get off at a **metro station** and share **one offline auto** with 3 people, **splitting the fare**. The fare split (₹180 → ₹60 each) isn't shown anywhere. |
| A3 | **Untrue claims:** "Work email verification at signup", "no anonymous riders". The backend does not verify emails. An interviewer could catch this. |
| A4 | Group lobby button says **"Cancel ride"** with the warning *"Cancel this ride for your whole group?"*. That's wrong: the backend only removes **you**, and the other 2 go back to waiting. |
| A5 | The home page is long and repeats itself: 6 sections, and "Features" and "Safety" list the same 4 points twice. The footer links to login-only pages. |

### B. Small bugs
| # | Problem |
|---|---|
| B1 | Group members are identified by **name**. If two members share a name, "(you)" and the React list keys go wrong. The backend sends each member's **email**, so use that. |
| B2 | My Rides → Cancel: the backend can now answer **409 "just matched"**. The page shows the error but doesn't reload, so the ride still looks WAITING with a Cancel button. |
| B3 | Join → **409 "you already have an active ride"** shows text only. It should link to My Rides. |
| B4 | A WAITING request is **deleted by the backend after 15 min**, but the UI never says so, and the ride just disappears. |
| B5 | Location sharing can't be **stopped** without leaving the page (privacy). |
| B6 | The 4 lint warnings (state set inside effects, missing effect dependencies). `useRequireAuth` briefly flashes a loader. |
| B7 | `vite.config.js` uses `optimizeDeps.esbuildOptions`, which Vite 8 reports as deprecated on every build. |

### C. Style: "too much"
| # | Problem |
|---|---|
| C1 | 2,435 lines of CSS with lots of decoration: map-grid backgrounds, glow shadows, pulse rings, entrance animations, 4 radius sizes, 2 fonts. |
| C2 | Dashboard: 3 stat cards plus 2 big action cards, but **no "your current ride" card**, which is the one thing a user wants to see. |
| C3 | The mobile top bar repeats the "Join a ride" button that's already in the bottom nav. |

---

## 3. Planned changes

### Content / idea fit
1. **Metro stations instead of neighbourhoods** (`lib/locations.js`, `lib/hubCoordinates.js`).
   Use stations that are open today on the Purple, Green and Yellow lines and are near office areas, e.g. Whitefield (Kadugodi), Kadugodi Tree Park, Pattandur Agrahara (ITPL), Kundalahalli, Hoodi, Krishnarajapura (KR Puram), Baiyappanahalli, Indiranagar, MG Road, Majestic, Yeshwanthpur, Nagasandra, Jayanagar, Banashankari, BTM Layout, Central Silk Board, Bommanahalli, Electronic City, Delta Electronics Bommasandra.
   The office/destination list stays (tech parks). Map coordinates are updated (approximate, good enough for a pin). The Pink line is left out because it isn't fully open yet; you can add its stations later in one file.
2. **Rewrite copy** on Home, Auth, Join, Dashboard and `index.html`: "metro station", "offline auto", "3 people, 1 auto, split the fare". Add a static ₹180 → ₹60 example. Say clearly that the app matches people, doesn't book the auto, and takes no payment.
3. **Remove untrue claims** (email verification, "no anonymous riders").
4. **Lobby:** "Cancel ride" → **"Leave group"**, with the correct warning (*"You'll leave; the other two go back to waiting"*). Add one hint line: *"Agree the fare with the auto driver before you start, then split it 3 ways."*

### Bug fixes
5. B1: members keyed by email, "(you)" detected by email (adds `getUserEmail()` to `session.js`).
6. B2: always reload My Rides after a cancel, even when it fails.
7. B3: 409 on Join shows a "Go to My rides" link.
8. B4: WAITING ride card shows *"Looking for 2 more riders… requests expire after 15 minutes."*
9. B5: **"Stop sharing"** button in the lobby (it just clears the existing timer).
10. B6: fix all 4 lint warnings without changing behaviour; `useRequireAuth` redirects with `<Navigate>` (no flash).
11. B7: remove the deprecated Vite option (keep the `global` shim that SockJS needs) and confirm the build still works.

### Minimal startup style (same class names, so JSX barely changes)
12. **Rewrite `styles.css`** to a lean sheet (target **under ~1,000 lines**):
    - Keep the one23 identity: **ink black + lime accent** on white.
    - **One font** (Inter), one border colour, one shadow, 2 radius sizes, 8-px spacing.
    - No grid backgrounds, glow or entrance animations. Keep only the small "live" pulse dot and the loading spinner.
    - Mobile-first, same breakpoints, bottom nav on phones.
13. **Home page** trimmed to: Hero (headline + fare-split example + CTA) → How it works (4 steps) → short FAQ (4 questions) → footer. *Removes Features, Safety and the final CTA (duplicates).*
14. **Auth pages:** a smaller side panel with 3 true points.
15. **Dashboard:** a **"Current ride" card** (status + route + "Open lobby"/"View" link) from the existing `/api/my-rides` data, plus the two actions. The 3 stat cards are removed.
16. **Lobby layout:** route + status + actions first, then members, chat, map.
17. Remove the duplicate "Join a ride" button from the mobile top bar.

### Docs / cleanup
18. Update `README.md` (stations, copy, screens). Delete the outdated `AUDIT_REPORT.md` (needs your delete permission). This plan will be marked "applied".

---

## 4. What I will NOT change
- Tech stack: **React + Vite + plain JS + plain CSS**. No TypeScript, Tailwind, UI library or new npm packages.
- Routes, folder structure, `lib/api.js` and `lib/websocket.js` contracts, sessionStorage login, the Leaflet map, deployment files.
- No new features beyond the small "Stop sharing" button and the "current ride" card (both use existing data).
- No backend changes.

## 5. Files that will be touched
| File | Changes # |
|---|---|
| `src/styles.css` | 12 |
| `src/pages/HomePage.jsx` | 2, 3, 13 |
| `src/pages/JoinPage.jsx` | 1, 2, 7 |
| `src/pages/DashboardPage.jsx` | 2, 15 |
| `src/pages/MyRidesPage.jsx` | 6, 8, 10 |
| `src/pages/GroupLobbyPage.jsx` | 4, 5, 9, 10, 16, 8 (split) |
| `src/components/LobbyMembers.jsx`, `LobbyChat.jsx` (new, small) | 8 (split) |
| `src/pages/LoginPage.jsx`, `SignupPage.jsx` | 2 (copy only) |
| `src/components/AuthShell.jsx`, `MarketingLayout.jsx`, `AppShell.jsx` | 2, 3, 14, 17 |
| `src/components/GroupLobbyMap.jsx` | 10 |
| `src/hooks/useRequireAuth.js` | 10 |
| `src/lib/locations.js`, `hubCoordinates.js`, `session.js` | 1, 5 |
| `index.html`, `vite.config.js` | 2, 11 |
| `README.md`, `AUDIT_REPORT.md` (delete) | 18 |

## 6. How I'll verify
- `npm run build` and `npm run lint` (target: 0 errors, 0 warnings). I'll report the real output.
- Run the app in a headless browser with **fake API responses** and take **screenshots** of each page (desktop + phone) so you can see the new style before you run it.
- I can't test against your real backend/database from here. You'll do one quick manual run.

## 7. Defaults I'll use (tell me if you want different)
- Keep the **lime + black** brand colours (just cleaner).
- Font: **Inter**.
- No fare calculator, only the static ₹180 → ₹60 example and a hint.

---

## 8. Student-level code rules (applies to every change)
The goal: you can open any file in an interview and explain it line by line.

- **Short files.** `GroupLobbyPage.jsx` is 409 lines with 15 `useState`s. Split it into
  `LobbyMembers.jsx` and `LobbyChat.jsx` in `components/` (each under ~100 lines). The page keeps the logic; the components only display.
- **One comment per block** saying *what* and *why*, in plain English (e.g. "poll every 5 s only if the WebSocket fails").
- **Plain patterns only:** `useState`, `useEffect`, `useRef`, props, `fetch` in `lib/api.js`. No custom state libraries, no context magic, no clever one-liners.
- **Clear names:** `isLoading`, `handleLeaveGroup`, `loadRides` (no `t`, `d`, `n` like on the home page now).
- **Simple data:** copy text written directly in JSX, small arrays for lists (steps, FAQ, stations).
- **No dead code:** remove unused classes/props when restyling.
- README gets a **"How the frontend works"** section: page → `api.js` → backend, and the lobby → `websocket.js` → `/topic/...` flow, plus interview talking points.
