# Floor Plan AI

AI-powered floor plan visualization. Upload a 2D floor plan image, get a photorealistic 3D-style render, compare before/after, and export.

**Stack:** React Router, TypeScript, Tailwind, Puter (auth, hosting, KV, AI), Vite.

<p align="center">
  <video src="https://youtu.be/QkPUm5mTBq4" controls width="100%" style="max-width: 800px; border-radius: 8px;"></video>
</p>

---

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_PUTER_WORKER_URL=https://your-worker.puter.work
```

**Getting the worker URL:**

1. Run `npm run dev`
2. Open [http://localhost:5173/deploy-puter-worker.html](http://localhost:5173/deploy-puter-worker.html)
3. Sign in with Puter
4. Click **Deploy**
5. Paste the returned URL into `.env` as `VITE_PUTER_WORKER_URL` (no trailing slash)

## Run

```bash
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173).

## Flow

1. **Sign in** — Log in with Puter (navbar). From projects or upload, a short consent screen explains Puter before their sign-in.
2. **Upload** — Drop a floor plan (JPG/PNG, up to 10MB). Requires sign-in; clicking/dropping when signed out opens the consent flow.
3. **Projects** — Grid shows shimmer until auth is known; then either “Log in to view your projects” or your project cards (with shimmer while loading).
4. **Project created** — Stored in Puter KV, redirect to visualizer.
5. **Visualizer** — Comparison slider at top; original and rendered panels below with Export and Share for each (and for the comparison). Loading/error states with shimmer and retry.
6. **Export / Share** — Download or share original or rendered image (Web Share API with clipboard fallback).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run deploy:worker` | Opens the worker deploy page (dev server must be running) |

## Project layout

```
floor-plan-ai/
├── app/
│   ├── routes/
│   │   ├── home.tsx           # Landing, upload, projects grid
│   │   └── visualizer.$id.tsx # Comparison, original/rendered panels, export/share, loading & error states
│   ├── root.tsx               # Auth context (authReady), layout
│   └── app.css
├── components/
│   ├── Navbar.tsx
│   ├── PuterConsentModal.tsx  # Pre-consent when signing in from projects/upload
│   ├── Upload.tsx
│   └── ui/
├── lib/
│   ├── puter.action.ts        # Auth, create/get projects
│   ├── puter.hosting.ts       # Image upload to Puter
│   ├── puter.worker.js        # Worker: process & store projects
│   ├── ai.action.ts           # AI image generation
│   ├── utils.ts               # Image helpers
│   └── constants.ts
└── public/
    └── deploy-puter-worker.html  # One-click worker deployment
```

---

If `VITE_PUTER_WORKER_URL` is missing, createProject fails but the app still navigates to the visualizer with location state; AI can run client-side from there.
