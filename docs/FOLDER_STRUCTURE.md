# Folder Structure

```
studysnap-ai/
├── docs/
│   ├── ARCHITECTURE.md
│   └── FOLDER_STRUCTURE.md
├── public/
│   └── (static assets)
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 00001_initial_schema.sql
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── dashboard/upload/page.tsx
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/          # Header, footer, sidebar
│   │   └── ui/              # Button, input, card, badge
│   ├── features/
│   │   ├── auth/            # Auth forms & actions
│   │   └── uploads/         # Upload dropzone & file list
│   ├── lib/
│   │   ├── env.ts
│   │   ├── utils.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── server.ts
│   │       └── middleware.ts
│   ├── types/
│   │   └── database.ts
│   └── middleware.ts
├── .env.example
├── .env.local.example
└── package.json
```

## Conventions

- **Route groups** `(marketing)`, `(auth)`, `(dashboard)` do not affect URLs.
- **Colocate by feature** under `src/features/<name>/`.
- **Shared UI** only in `src/components/ui` and `src/components/layout`.
- **No AI code** in Week 1; `src/lib/ai/` added in Week 2.
