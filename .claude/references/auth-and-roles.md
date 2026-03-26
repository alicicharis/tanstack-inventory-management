# Auth & Roles

## Overview

Authentication uses Better Auth with email/password login and session-based auth. Authorization is two-tier: admin and staff roles, enforced via server function middleware that injects user context.

## Key Decisions

- **Admin role via Better Auth admin plugin**: Uses `admin({ defaultRole: 'staff' })` plugin with `tanstackStartCookies()` for session management.
  - **Why**: Leverages Better Auth's built-in role system instead of a custom RBAC implementation. Keeps it simple for two roles.

- **Role set via direct DB update in seed**: Seed script creates users with `auth.api.signUpEmail()` then updates role directly in the DB rather than using the admin plugin's `setRole` API.

## Patterns & Conventions

- **Server function signature**: `createServerFn().middleware([requireAuth]).inputValidator(zodSchema).handler(async ({ data, context }) => { ... })`
- **Middleware injects context**: `requireAuth` adds `{ user, session }` to `context`. `requireAdmin` chains onto `requireAuth` and checks `user.role === 'admin'`.
- **Unauthenticated → redirect to `/login`**. Unauthorized (non-admin) → redirect to `/`.
- **Route-level auth guard**: `_authed.tsx` layout route protects all authenticated routes.

## Key Files

- `src/lib/auth.ts` — Better Auth server config with admin plugin.
- `src/lib/auth-client.ts` — Client-side auth (minimal, uses `adminClient()` plugin).
- `src/server/middleware.ts` — `requireAuth()` and `requireAdmin()` middleware.
- `src/routes/_authed/route.tsx` — Auth guard layout route.
