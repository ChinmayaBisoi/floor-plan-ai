# Floor Plan AI

AI-powered floor plan visualization. Upload a 2D floor plan image, get a photorealistic 3D-style render, compare before/after, and export.

**Stack:** React Router, TypeScript, Tailwind, Puter (auth, hosting, KV, AI), Vite.

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

1. **Sign in** — Log in with Puter (navbar)
2. **Upload** — Drop a floor plan (JPG/PNG, up to 10MB)
3. **Project created** — Stored in Puter KV, you're redirected to the visualizer
4. **AI render** — If no render exists, AI generates one; you see a processing overlay
5. **Compare** — Before/after slider
6. **Export** — Download the rendered image

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
│   │   └── visualizer.$id.tsx # Before/after view, export
│   ├── root.tsx               # Auth context, layout
│   └── app.css
├── components/
│   ├── Navbar.tsx
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
