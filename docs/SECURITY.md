# Security — Supabase keys

## Public (browser-safe)

| Variable | Exposure |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server (RLS protects data) |
| `NEXT_PUBLIC_APP_URL` | Client + server |

Never prefix secrets with `NEXT_PUBLIC_`.

## Server-only (never in client bundles)

| Variable | Used for |
|----------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Optional.** Bypasses RLS. Not required for uploads, OCR, or previews in the current app. |
| `OPENAI_API_KEY` | AI summaries (server API routes only) |

Import server secrets only from modules that include `import "server-only"` (e.g. `src/lib/env.server.ts`, `src/lib/supabase/admin.ts`).

## How the app accesses Storage and materials

| Operation | Client | Key |
|-----------|--------|-----|
| Upload | Browser | Anon + user session |
| OCR download / DB updates | API route | User session via `createClient()` (server) |
| Preview signed URL | Server Component | User session (RLS) |

Service role is **not** sent to the browser and is **not** embedded in client JavaScript.

## Checks in code

- `src/lib/supabase/client.ts` — anon key only
- `src/features/materials/extraction-service.ts` — `server-only`, user-scoped Supabase client
- `src/lib/materials/storage.ts` — `server-only`, path must start with `{userId}/`
- `src/app/api/materials/[id]/process/route.ts` — requires authenticated user

## If the service role key was leaked

1. Rotate it in Supabase → Project Settings → API.
2. Update `.env.local` (never commit this file).
3. Revoke the old key in Supabase.
