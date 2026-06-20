# Authentication Audit

## Flows verified

| Flow | Implementation | Protection |
|------|----------------|------------|
| **Signup** | `signUp` server action → `supabase.auth.signUp` | Email confirmation handled; redirects to dashboard when session exists |
| **Login** | `signIn` server action → `signInWithPassword` | Safe redirect paths only; supports `?redirect=` after middleware gate |
| **Logout** | `signOut` server action in sidebar form → `auth.signOut` | Always clears session and redirects to `/login` |
| **Protected dashboard** | Middleware + `(dashboard)/layout.tsx` | `/dashboard/*` requires authenticated user |

## Security fixes applied

1. **Open redirect prevention** — `safeRedirectPath()` blocks `//evil.com`, protocols, and backslashes (login, callback, middleware).
2. **Session cookies on middleware redirects** — `withSessionCookies()` copies refreshed tokens when redirecting.
3. **Publishable API keys** — `isSupabaseConfigured()` accepts `sb_publishable_*` keys.
4. **Logout resilience** — Sign out always redirects even if Supabase call fails.

## Manual test checklist

1. Sign up at `/signup` → lands on `/dashboard` (or email confirmation message).
2. Sign out → `/login`.
3. Visit `/dashboard` logged out → `/login?redirect=%2Fdashboard`.
4. Log in → returns to `/dashboard`.
5. Visit `/login` while logged in → redirected to `/dashboard`.

## Supabase dashboard requirements

- Site URL matches `NEXT_PUBLIC_APP_URL` (including port, e.g. `http://localhost:3002`).
- Redirect URL: `{APP_URL}/auth/callback`
- Migration `00001_initial_schema.sql` applied (profiles trigger).
