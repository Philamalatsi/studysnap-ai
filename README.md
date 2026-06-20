# StudySnap AI

AI study assistant that converts textbook photos, PDFs, and notes into summaries, flashcards, and quizzes.

## Tech stack

- **Next.js 15** (App Router, Server Actions)
- **TypeScript** · **Tailwind CSS 4**
- **Supabase** (Auth, PostgreSQL, Storage)
- **OpenAI** (Week 2+)

## Week 1 deliverables

- Project architecture → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Folder structure → [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md)
- Landing page, auth pages, dashboard shell, upload UI
- Environment template → [`.env.example`](.env.example)
- Database schema → [`supabase/migrations/`](supabase/migrations/)

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

**StudySnap project:** `https://dmwixrrtzxtbwndzalqq.supabase.co` — full steps in [`docs/SUPABASE_AUTH_SETUP.md`](docs/SUPABASE_AUTH_SETUP.md).

1. Copy the **anon public** key into `.env.local` (see setup doc).
2. Run migrations in the SQL Editor (in order):
   - `supabase/migrations/00001_initial_schema.sql` (auth + profiles)
   - `supabase/migrations/00002_storage_bucket.sql` (uploads bucket — required for file upload)
3. Under **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, server-only — **not required** for current features (see [docs/SECURITY.md](docs/SECURITY.md)) |
| `OPENAI_API_KEY` | Required for AI summaries (server only) |

### 4. Run locally

```bash
cp .env.example .env.local   # if you have not already
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Dashboard:** `/dashboard` requires a signed-in user. Use real Supabase URL and anon key in `.env.local`, run the SQL migrations, then sign up at `/signup`.

**Troubleshooting**

- **Unstyled page / 404 on `_next/static` CSS or JS:** Stop all `node` dev servers, then run `npm run dev:clean` (clears `.next` and restarts). Do not run `npm run build` and `npm run dev` at the same time.
- `500` errors in dev after a production build: stop the dev server, delete `.next`, and run `npm run dev` again.
- Port in use: free port 3000 or use the URL printed in the terminal (e.g. `http://localhost:3002`). Set `NEXT_PUBLIC_APP_URL` to match.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` · `/signup` · `/forgot-password` | Authentication |
| `/dashboard` | Overview (protected) |
| `/dashboard/upload` | Upload UI (protected) |
| `/auth/callback` | Supabase auth redirect |

## Vision

See [`PROJECT_VISION.md`](PROJECT_VISION.md).
