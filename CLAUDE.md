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
  routes/          # TanStack file-based routes
    __root.tsx     # Root layout
    index.tsx      # Home page
    api/auth/      # Auth API routes (Better Auth)
  components/      # Shared UI components (Header, Footer, ThemeToggle)
  db/
    index.ts       # DB client
    schema.ts      # Drizzle schema definitions
  integrations/
    better-auth/   # Auth config (auth.ts = server, auth-client.ts = client)
  lib/             # Shared utilities
  router.tsx       # TanStack Router config
  styles.css       # Global styles (Tailwind entry)
drizzle/           # Generated migration files
```

## Conventions

- **Path aliases**: Use `#/` for imports from `src/` (e.g., `import { db } from '#/db'`)
- **Module system**: ESM only (`"type": "module"`)
- **Routes**: Follow TanStack Router file-based routing conventions
- **DB schema**: Define all tables in `src/db/schema.ts`
- **Environment**: DB connection string in `DATABASE_URL` via `.env.local` or `.env`
- **Typescript**: Never use type any, always define types
- **Style**: Avoid inline styles, use only when you must use them
