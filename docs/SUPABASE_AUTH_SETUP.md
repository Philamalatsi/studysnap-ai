# Connect StudySnap AI to your Supabase project

**Project:** StudySnap AI  
**Project ID:** `dmwixrrtzxtbwndzalqq`  
**API URL:** `https://dmwixrrtzxtbwndzalqq.supabase.co`

## 1. Add API keys to `.env.local`

In the [Supabase Dashboard](https://supabase.com/dashboard/project/dmwixrrtzxtbwndzalqq/settings/api):

1. Open **Project Settings** → **API**.
2. Copy **Project URL** → should match `NEXT_PUBLIC_SUPABASE_URL` (already set).
3. Copy **anon public** key → paste into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Restart the dev server after saving: `npm run dev`.

> **Do not** put the `service_role` key in `NEXT_PUBLIC_*` variables. It must stay server-only if you add it later.

## 2. Configure Auth redirect URLs

In **Authentication** → **URL Configuration**:

| Field | Value |
|-------|--------|
| **Site URL** | `http://localhost:3000` |
| **Redirect URLs** | `http://localhost:3000/auth/callback` |

For production (Vercel), also add:

- `https://your-domain.com/auth/callback`
- `https://your-domain.com/auth/callback?next=/reset-password`

For local password reset testing, also add:

- `http://localhost:3000/auth/callback?next=/reset-password`

## 3. Email auth settings (recommended for local dev)

In **Authentication** → **Providers** → **Email**:

- Ensure **Email** provider is enabled.
- For faster local testing, you can turn **off** “Confirm email” (optional).  
  If confirmation is **on**, signup shows “check your email” instead of going straight to the dashboard.

## 4. Run the database migration (required for profiles)

In **SQL Editor** → **New query**, paste and run:

`supabase/migrations/00001_initial_schema.sql`

This creates `profiles`, RLS policies, and the trigger that creates a profile when a user signs up.

Run `supabase/migrations/00002_storage_bucket.sql` for file uploads (Storage bucket + RLS).

## OCR text extraction

OCR uses your **logged-in session** (anon key + cookies), not the service role. After each upload, the app runs OCR on the server and saves text to `materials.extracted_text`.

`SUPABASE_SERVICE_ROLE_KEY` is optional and must stay server-only — see [SECURITY.md](./SECURITY.md).

## 5. Verify auth

1. `npm run dev` → open http://localhost:3000/signup  
2. Create an account → you should land on `/dashboard`.  
3. Sign out from the sidebar → should return to `/login`.  
4. Sign in again → `/dashboard` loads.  
5. Visit `/dashboard` while logged out → redirects to `/login`.

## Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`
- [ ] Redirect URL `http://localhost:3000/auth/callback` added
- [ ] Migration `00001_initial_schema.sql` executed
- [ ] Dev server restarted

If signup/login fails, check the browser network tab and Supabase **Authentication** → **Users** for the new row.
