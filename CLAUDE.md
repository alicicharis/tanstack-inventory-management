# TitanWMS - Inventory Management System

## Project Overview

Full-stack inventory/warehouse management app built with TanStack Start (React SSR framework) and PostgreSQL.

## Tech Stack

- **Framework**: TanStack Start (React 19, file-based routing, SSR)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (Vite plugin)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Better Auth
- **Build**: Vite 7, npm
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm test             # Run tests (vitest run)
npm run lint         # ESLint check
npm run format       # Prettier check
npm run check        # Auto-fix: prettier --write + eslint --fix
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to DB (no migration files)
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
src/
  routes/              # TanStack file-based routes
    __root.tsx         # Root layout
    index.tsx          # Home/landing page
    login.tsx          # Login page
    register.tsx       # Registration page
    api/auth/$.ts      # Better Auth catch-all API route
    _authed/           # Auth-guarded routes
      route.tsx        # Auth guard layout
      dashboard.tsx    # Main dashboard
  components/          # Shared UI components
    ui/                # Shadcn/UI primitives (button, etc.)
    Header.tsx         # App header
    Footer.tsx         # App footer
    ThemeToggle.tsx    # Dark/light mode toggle
  server/              # Server functions (createServerFn)
    middleware.ts      # requireAuth(), requireAdmin() middleware
  db/
    index.ts           # DB client (Drizzle + PostgreSQL)
    schema.ts          # All Drizzle table definitions
    seed.ts            # Seed script for demo data
  lib/
    utils.ts           # Shared utilities
    auth.ts            # Better Auth server config
    auth-client.ts     # Better Auth client
  router.tsx           # TanStack Router config
  styles.css           # Global styles (Tailwind entry)
drizzle/               # Generated migration files
```

## Conventions

- **Path aliases**: Use `#/` for imports from `src/` (e.g., `import { db } from '#/db'`)
- **Module system**: ESM only (`"type": "module"`)
- **Routes**: Follow TanStack Router file-based routing conventions
- **DB schema**: Define all tables in `src/db/schema.ts`
- **Environment**: DB connection string in `DATABASE_URL` via `.env.local` or `.env`
- **Typescript**: Never use type any, always define types
- **Style**: Avoid inline styles, use only when you must use them

## Server Function Conventions

- All server functions use `createServerFn` from TanStack Start
- Always validate inputs with Zod as the first step
- Protect routes with `requireAuth()` or `requireAdmin()` middleware
- All stock-mutating operations must be wrapped in `db.transaction()`
- Return typed results, never raw SQL or untyped objects

## Error Handling

- Server functions throw errors (not return `{ error }`) — let TanStack Start handle error boundaries
- Use descriptive error messages: `throw new Error('Insufficient stock at source warehouse')`
- Validate at system boundaries (user input via Zod, external data) — trust internal code
- Database constraints (CHECK, FK, UNIQUE) are the last line of defense — don't duplicate them in app logic

## References

| Topic | File | Description |
|-------|------|-------------|
| TanStack Start | [.claude/references/tanstack.md](.claude/references/tanstack.md) | Server functions, middleware, routing gotchas, request/response helpers |
