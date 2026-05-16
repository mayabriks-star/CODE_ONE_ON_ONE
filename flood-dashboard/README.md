# Coastal Flood Dashboard

A 3-screen interactive prototype for a coastal flood-risk monitoring dashboard.
Built with Vite + React + TypeScript + Tailwind CSS.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in Chrome, Edge, or Safari.

## Documentation

| Document | Description |
|---|---|
| [Running the Dashboard](docs/RUNNING_THE_DASHBOARD.md) | Step-by-step guide to install, run, navigate, and build the prototype |
| [Architecture & Design System](docs/ARCHITECTURE_AND_DESIGN_SYSTEM.md) | Full technical reference: component map, design tokens, layout rules, UX flow |
| [How to Update the Architecture Doc](docs/HOW_TO_UPDATE_ARCHITECTURE_DOC.md) | Guide for keeping the architecture doc accurate as the prototype evolves |

## Screens

| Screen | Trigger | Description |
|---|---|---|
| Home Page | App loads | Live monitoring dashboard, calm state |
| Home Page — Alert | Auto after 10 s | Red alert card + bell badge appear |
| Alert Detail | Click red card | Full breakdown: metrics, strategy, districts, budget |
