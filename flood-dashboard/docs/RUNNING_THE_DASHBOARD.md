# How to Run the Flood Dashboard

This guide walks you through starting the prototype, navigating the three screens, and stopping it when done.

---

## Prerequisites

| Requirement | Minimum version | How to check |
|---|---|---|
| Node.js | 18.x or higher | `node -v` |
| npm | 9.x or higher | `npm -v` |

If Node.js is not installed, download it from [nodejs.org](https://nodejs.org) (choose the LTS version).

---

## First-time setup

Run this **once** when you first open the project, or after pulling new changes:

```bash
cd flood-dashboard
npm install
```

This installs all dependencies listed in `package.json` into the `node_modules/` folder. It takes about 30 seconds the first time.

---

## Starting the dev server

```bash
cd flood-dashboard
 (cd = change directory) : change to the location of the dashboard
npm run dev - Run the application
```

You will see output like:

```
  VITE v8.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open **http://localhost:5173** in your browser. The dashboard loads immediately.

> Use Chrome, Edge, or Safari for best results. The glassmorphism `backdrop-filter` blur effect requires a Chromium or WebKit browser. Firefox renders the layout correctly but the frosted-glass blur may not appear.

---

## Navigating the prototype

The prototype has three screens that flow in sequence:

### Screen 1 — Home Page
Loads automatically on page open. Shows the coastal map with:
- Flood Depth Scale (top-left)
- Mode selector: Protect / Adapt / Retreat (top-center)
- Live status: time, city status, bell, menu (top-right)
- Live Monitoring panel with city stats (left)
- Time View: Today → 2090 (bottom-left)
- Summary bar: risk, districts, population, alerts (bottom)

**Wait 10 seconds** — the prototype auto-advances to Screen 2.

---

### Screen 2 — Home Page with Alert
Appears automatically after 10 seconds. Adds:
- A red **New Alert** card below the Live Monitoring panel
- A red notification badge on the bell icon

**Click the red alert card** to navigate to Screen 3.

---

### Screen 3 — Alert Detail
Full breakdown of the alert. Shows:
- Sea Level Early Warning header
- Alert overview: sea level rise, expected impact timeline, with-action outcome
- Strategy card with metric boxes and key component checklist
- Districts requiring review (right column, color-coded by risk)
- Estimated budget donut chart ($70M)
- Affections table: infrastructure and population

**Click the back arrow** (←) in the top-left to return to Screen 2.

---

## Stopping the dev server

In the terminal where `npm run dev` is running, press:

```
Ctrl + C
```

---

## Building for production / presentation

To generate a static bundle (no dev server needed):

```bash
npm run build
```

Output goes to the `dist/` folder. Open `dist/index.html` in a browser, or serve it with any static file server:

```bash
npx serve dist
```

Then open the URL shown in the terminal (typically http://localhost:3000).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm: command not found` | Node.js not installed | Install from nodejs.org |
| `Error: Cannot find module '...'` | Dependencies not installed | Run `npm install` |
| Port 5173 already in use | Another dev server is running | Kill the other process or run `npm run dev -- --port 5174` |
| Background image not showing | Browser cache or path issue | Hard-refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows) |
| Glass blur not visible | Firefox limitation | Switch to Chrome, Edge, or Safari |
| Screen 2 not auto-advancing | Timer running | Wait the full 10 seconds from page load |
| White screen on load | JS error | Open browser DevTools (F12), check Console tab for errors |

---

## File locations

```
flood-dashboard/
├── docs/                          ← all project documentation
│   ├── RUNNING_THE_DASHBOARD.md   ← this file
│   ├── ARCHITECTURE_AND_DESIGN_SYSTEM.md
│   └── HOW_TO_UPDATE_ARCHITECTURE_DOC.md
├── public/
│   └── coastal-background.png     ← background map image
├── src/
│   ├── App.tsx                    ← screen state + 10s timer
│   ├── screens/                   ← one file per screen
│   └── components/                ← all UI components
├── package.json
└── README.md
```

For full component details and design decisions, see [ARCHITECTURE_AND_DESIGN_SYSTEM.md](./ARCHITECTURE_AND_DESIGN_SYSTEM.md).
