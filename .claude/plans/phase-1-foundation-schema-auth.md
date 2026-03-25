# Feature: Phase 1 — Foundation (Schema + Auth)

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files. Use `#/` path alias for all src imports.

## Feature Description

Establish the complete data layer and authentication system for TitanWMS. Replace the placeholder `todos` schema with all domain tables (products, warehouses, stock, movements, suppliers, customers, purchase orders, sales orders) plus Better Auth tables. Wire up Better Auth with Drizzle adapter and admin plugin for role-based access. Create login/register pages and an auth guard layout route.

## User Story

As a Warehouse Manager or Staff member
I want to log in to TitanWMS with role-based access
So that I can securely access inventory management features appropriate to my role

## Problem Statement

The project is a starter template with a placeholder `todos` table and no database-backed auth. No domain entities exist. We need the full foundation before any business logic or UI can be built.

## Solution Statement

1. Define complete Drizzle schema with all domain + auth tables, relations, indexes, constraints
2. Configure Better Auth with Drizzle adapter + admin plugin (roles: admin/staff)
3. Create TanStack Start middleware for auth enforcement
4. Build login/register pages and auth guard layout route
5. Clean up styles.css and all components to use Shadcn/UI exclusively
6. Update branding from starter template to TitanWMS

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Database schema, Authentication, Routing, Styling
**Dependencies**: zod (to install), Better Auth admin plugin (already in better-auth package)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — MUST READ BEFORE IMPLEMENTING

- `src/db/schema.ts` — Current placeholder schema (todos table) — FULL REWRITE
- `src/db/index.ts` (lines 1-5) — DB client setup, uses `drizzle-orm/node-postgres` with schema import
- `src/lib/auth.ts` (lines 1-9) — Current auth config, NO database adapter — UPDATE
- `src/lib/auth-client.ts` (lines 1-3) — Client auth, no plugins — UPDATE
- `src/routes/api/auth/$.ts` (lines 1-11) — Auth API route, already correctly wired
- `src/integrations/better-auth/header-user.tsx` (line 39) — Links to `/demo/better-auth`, change to `/login`
- `src/routes/__root.tsx` (line 22) — Title says "TanStack Start Starter", change to "TitanWMS"
- `src/components/Header.tsx` (line 15) — Branding says "TanStack Start", change to "TitanWMS"
- `src/styles.css` — Has Shadcn imports + variables BUT also full of TanStack template cruft — CLEAN UP
- `src/router.tsx` — Router config, no changes needed
- `drizzle.config.ts` — Drizzle config pointing to `src/db/schema.ts`, no changes needed
- `.env.example` — Has DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET

### New Files to Create

- `src/routes/login.tsx` — Login page
- `src/routes/register.tsx` — Registration page
- `src/routes/_authed.tsx` — Auth guard layout route
- `src/server/middleware.ts` — requireAuth and requireAdmin middleware
- `src/db/seed.ts` — Seed script for demo data

### Relevant Documentation — READ BEFORE IMPLEMENTING

- [Better Auth Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle)
  - Key: `drizzleAdapter(db, { provider: 'pg' })`, `usePlural: true` option
- [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
  - Key: Adds `role` (default "user"), `banned`, `banReason`, `banExpires` to user table; `impersonatedBy` to session
  - Config: `admin({ defaultRole: 'staff' })` to match PRD roles
- [TanStack Start Middleware](https://tanstack.com/start/latest/docs/framework/react/middleware)
  - Key: `createMiddleware().server(({ next, context, request }) => ...)`, throw redirect for auth failures
- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
  - Key: `createServerFn().middleware([mw]).handler(...)` pattern

### Patterns to Follow

**Import style** (from existing code):
```typescript
import { auth } from '#/lib/auth'        // path alias
import { db } from '#/db'                // shorter alias
```

**Code style**: No semicolons, single quotes, trailing commas everywhere (Prettier config)

**Route pattern** (from `src/routes/about.tsx`):
```typescript
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/path')({ component: MyComponent })
function MyComponent() { return (...) }
```

**CSS classes**: Use Shadcn/UI design tokens exclusively — `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `bg-primary`, etc. Do NOT use the old TanStack template classes (island-shell, page-wrap, nav-link, sea-ink, lagoon, etc.) — those will be removed in Task 2.

---

## IMPLEMENTATION PLAN

### Phase 1: Dependencies & Cleanup
- Install zod
- Clean up styles.css: remove all TanStack Start template styles, keep only Shadcn/Tailwind foundation
- Update branding (root title, header text, header-user link)
- Rewrite Header, Footer, root layout, index, about pages to use Shadcn classes

### Phase 2: Database Schema
- Complete rewrite of schema.ts with all 14 tables + enums + relations + indexes + constraints

### Phase 3: Auth Wiring
- Configure Better Auth with Drizzle adapter + admin plugin
- Update auth client with adminClient plugin
- Create server middleware (requireAuth, requireAdmin)

### Phase 4: Auth UI & Guard
- Login page (using Shadcn components: Card, Button, Input, Label)
- Register page (using Shadcn components)
- _authed.tsx layout route

### Phase 5: Database Setup
- Push schema to database
- Create seed script

---

## STEP-BY-STEP TASKS

### Task 1: Install zod dependency

- **ACTION**: Run `npm install zod`
- **VALIDATE**: `npm ls zod`

### Task 2: UPDATE `src/styles.css` — CLEAN UP (remove TanStack template styles)

- **IMPLEMENT**: Strip out all TanStack Start template-specific styles while keeping Shadcn foundation
- **KEEP** (Shadcn/Tailwind foundation):
  - `@import "tailwindcss"`
  - `@import "tw-animate-css"`
  - `@import "shadcn/tailwind.css"`
  - `@import "@fontsource-variable/jetbrains-mono"`
  - `@custom-variant dark (&:is(.dark *))`
  - `@plugin "@tailwindcss/typography"`
  - `@theme` block with `--font-sans`
  - All Shadcn CSS variables (`:root` block with `--background`, `--foreground`, `--primary`, `--card`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-*`, `--radius`, `--sidebar-*`)
  - `.dark` class overrides for Shadcn variables
  - `@theme inline` block with Shadcn color mappings (`--color-*`)
  - `@layer base` block
  - Basic reset: `box-sizing: border-box`, `html/body/#app min-height: 100%`, `body margin: 0`
- **REMOVE** (TanStack Start template cruft):
  - All `--sea-ink`, `--lagoon`, `--palm`, `--sand`, `--foam`, `--surface`, `--line`, `--inset-glint`, `--kicker`, `--bg-base`, `--header-bg`, `--chip-bg`, `--chip-line`, `--link-bg-hover`, `--hero-a`, `--hero-b` CSS variables
  - `:root[data-theme="dark"]` block (old theme system)
  - `@media (prefers-color-scheme: dark)` block with old variables
  - Complex body background gradients (`radial-gradient`, `linear-gradient`)
  - `body::before` and `body::after` pseudo-element overlays
  - Custom `a` link styling (color, text-decoration)
  - Custom `code` styling
  - `.page-wrap`, `.display-title`, `.island-shell`, `.feature-card`, `.island-kicker` classes
  - `.nav-link` and `.nav-link.is-active` classes
  - `.site-footer` class
  - `.rise-in` animation and `@keyframes rise-in`
  - Google Fonts import for Fraunces/Manrope (line 1) — keep only JetBrains Mono
- **ALSO**: Update body base styles to use Shadcn tokens: `body { font-family: var(--font-sans); }` — the `@layer base` block already handles `bg-background text-foreground`
- **GOTCHA**: The `@theme` block with `--font-sans: "Manrope"` should be updated to use a system font stack or kept if you want Manrope. Since we're removing the Google Fonts import for Manrope, update to: `--font-sans: ui-sans-serif, system-ui, sans-serif` or keep Manrope and import it via `@fontsource-variable/manrope` (install first).
- **VALIDATE**: `npm run dev` — app loads with clean Shadcn styling, no broken styles

### Task 3: UPDATE `src/routes/__root.tsx`

- **IMPLEMENT**:
  - Change title meta from "TanStack Start Starter" to "TitanWMS" (line 22)
  - Remove the `THEME_INIT_SCRIPT` and inline `<script>` tag (line 9, 39) — Shadcn dark mode uses `.dark` class, managed differently
  - Update body classes to use Shadcn: `className="min-h-screen font-sans antialiased"` (remove old template classes)
- **VALIDATE**: `npm run build`

### Task 4: UPDATE `src/components/Header.tsx`

- **IMPLEMENT**:
  - Change "TanStack Start" branding to "TitanWMS" (line 15)
  - Rewrite using Shadcn classes: `bg-background border-b border-border` instead of `var(--header-bg)`, `var(--line)`
  - Remove TanStack social links (X/Twitter, GitHub) — not relevant to WMS
  - Keep: BetterAuthHeader, ThemeToggle, nav links
  - Update nav link styles from `.nav-link` / `.is-active` to Shadcn: `text-muted-foreground hover:text-foreground` and `text-foreground font-medium` for active
- **VALIDATE**: `npm run dev` — header renders with Shadcn styling

### Task 4b: UPDATE `src/components/Footer.tsx`

- **IMPLEMENT**: Rewrite using Shadcn classes: `border-t border-border bg-background text-muted-foreground` instead of `.site-footer` and `var(--sea-ink-soft)` etc.
- **VALIDATE**: `npm run dev`

### Task 4c: UPDATE `src/integrations/better-auth/header-user.tsx`

- **IMPLEMENT**: Change sign-in link from `to="/demo/better-auth"` to `to="/login"` (line 39). Update button/link styles to use Shadcn classes (`bg-primary text-primary-foreground`, `border-border`, etc.) instead of hardcoded neutral colors.
- **VALIDATE**: `npm run build`

### Task 4d: UPDATE `src/routes/index.tsx`

- **IMPLEMENT**: Replace the entire TanStack Start template landing page with a simple TitanWMS welcome/redirect. Options:
  - Minimal: redirect authenticated users to dashboard, show login prompt for unauthenticated
  - Or: simple branded landing page using Shadcn Card components
  - Remove all references to old template classes (island-shell, page-wrap, feature-card, rise-in, etc.)
- **VALIDATE**: `npm run dev`, navigate to `/`

### Task 4e: UPDATE `src/routes/about.tsx`

- **IMPLEMENT**: Either remove this route entirely (not needed for WMS) or rewrite content to be about TitanWMS using Shadcn classes. Remove all old template classes (island-shell, island-kicker, page-wrap, etc.)
- **VALIDATE**: `npm run build`

### Task 4f: UPDATE `src/components/ThemeToggle.tsx`

- **IMPLEMENT**: Ensure theme toggle works with Shadcn's `.dark` class convention. The existing implementation toggles `light`/`dark` classes on `<html>` and sets `data-theme` — verify it's compatible with `@custom-variant dark (&:is(.dark *))` from Shadcn config. Update button styles to use Shadcn classes.
- **VALIDATE**: Toggle themes in dev server, verify Shadcn dark mode works

### Task 5: UPDATE `src/db/schema.ts` — FULL REWRITE (most critical task)

- **IMPLEMENT**: Replace entire file with complete domain schema. Details below.
- **IMPORTS**: `pgTable, serial, text, timestamp, integer, boolean, pgEnum, index, unique, check` from `drizzle-orm/pg-core`, `relations, sql` from `drizzle-orm`

#### Enums

```
movementType = pgEnum('movement_type', ['RECEIVE', 'SHIP', 'TRANSFER', 'ADJUSTMENT'])
purchaseOrderStatus = pgEnum('purchase_order_status', ['DRAFT', 'SUBMITTED', 'PARTIALLY_RECEIVED', 'RECEIVED'])
salesOrderStatus = pgEnum('sales_order_status', ['DRAFT', 'CONFIRMED', 'SHIPPED'])
reasonCode = pgEnum('reason_code', ['DAMAGE', 'SHRINKAGE', 'CYCLE_COUNT', 'CORRECTION', 'OTHER'])
```

#### Better Auth Tables (must match Better Auth's expected schema)

**user** table:
| Column | Type | Constraints |
|--------|------|------------|
| id | text | PK |
| name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| emailVerified | boolean('email_verified') | NOT NULL, default false |
| image | text | nullable |
| role | text | NOT NULL, default 'staff' |
| banned | boolean | default false |
| banReason | text('ban_reason') | nullable |
| banExpires | timestamp('ban_expires') | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

**session** table:
| Column | Type | Constraints |
|--------|------|------------|
| id | text | PK |
| userId | text('user_id') | NOT NULL, FK -> user.id |
| token | text | NOT NULL, UNIQUE |
| expiresAt | timestamp('expires_at') | NOT NULL |
| ipAddress | text('ip_address') | nullable |
| userAgent | text('user_agent') | nullable |
| impersonatedBy | text('impersonated_by') | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

**account** table:
| Column | Type | Constraints |
|--------|------|------------|
| id | text | PK |
| userId | text('user_id') | NOT NULL, FK -> user.id |
| accountId | text('account_id') | NOT NULL |
| providerId | text('provider_id') | NOT NULL |
| accessToken | text('access_token') | nullable |
| refreshToken | text('refresh_token') | nullable |
| accessTokenExpiresAt | timestamp('access_token_expires_at') | nullable |
| refreshTokenExpiresAt | timestamp('refresh_token_expires_at') | nullable |
| scope | text | nullable |
| idToken | text('id_token') | nullable |
| password | text | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

**verification** table:
| Column | Type | Constraints |
|--------|------|------------|
| id | text | PK |
| identifier | text | NOT NULL |
| value | text | NOT NULL |
| expiresAt | timestamp('expires_at') | NOT NULL |
| createdAt | timestamp('created_at') | defaultNow |
| updatedAt | timestamp('updated_at') | defaultNow |

#### Domain Tables

**products**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| sku | text | NOT NULL, UNIQUE |
| name | text | NOT NULL |
| description | text | nullable |
| category | text | nullable |
| unitOfMeasure | text('unit_of_measure') | NOT NULL, default 'each' |
| reorderPoint | integer('reorder_point') | NOT NULL, default 0 |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

Index: `products_category_idx` on `category`

**warehouses**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| name | text | NOT NULL |
| location | text | nullable |
| totalCapacity | integer('total_capacity') | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

**stock**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| productId | integer('product_id') | NOT NULL, FK -> products.id |
| warehouseId | integer('warehouse_id') | NOT NULL, FK -> warehouses.id |
| currentQuantity | integer('current_quantity') | NOT NULL, default 0, CHECK >= 0 |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

Constraints: `unique('stock_product_warehouse_uniq').on(productId, warehouseId)`
CHECK: `check('stock_quantity_non_negative', sql\`"current_quantity" >= 0\`)`

**movements**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| productId | integer('product_id') | NOT NULL, FK -> products.id |
| fromWarehouseId | integer('from_warehouse_id') | FK -> warehouses.id, nullable |
| toWarehouseId | integer('to_warehouse_id') | FK -> warehouses.id, nullable |
| quantity | integer | NOT NULL |
| type | movementType('type') | NOT NULL |
| referenceType | text('reference_type') | nullable |
| referenceId | integer('reference_id') | nullable |
| reasonCode | reasonCode('reason_code') | nullable |
| notes | text | nullable |
| createdBy | text('created_by') | NOT NULL, FK -> user.id |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |

Indexes:
- `movements_product_type_created_idx` on `(productId, type, createdAt)`
- `movements_from_warehouse_idx` on `fromWarehouseId`
- `movements_to_warehouse_idx` on `toWarehouseId`

**suppliers**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| name | text | NOT NULL |
| contactName | text('contact_name') | nullable |
| email | text | nullable |
| phone | text | nullable |
| address | text | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

**customers**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| name | text | NOT NULL |
| contactName | text('contact_name') | nullable |
| email | text | nullable |
| phone | text | nullable |
| address | text | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

**purchaseOrders**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| supplierId | integer('supplier_id') | NOT NULL, FK -> suppliers.id |
| status | purchaseOrderStatus('status') | NOT NULL, default 'DRAFT' |
| createdBy | text('created_by') | NOT NULL, FK -> user.id |
| notes | text | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

Index: `purchase_orders_status_idx` on `status`

**purchaseOrderLines**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| purchaseOrderId | integer('purchase_order_id') | NOT NULL, FK -> purchaseOrders.id, onDelete cascade |
| productId | integer('product_id') | NOT NULL, FK -> products.id |
| quantityOrdered | integer('quantity_ordered') | NOT NULL |
| quantityReceived | integer('quantity_received') | NOT NULL, default 0 |
| warehouseId | integer('warehouse_id') | FK -> warehouses.id, nullable |

**salesOrders**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| customerId | integer('customer_id') | NOT NULL, FK -> customers.id |
| status | salesOrderStatus('status') | NOT NULL, default 'DRAFT' |
| createdBy | text('created_by') | NOT NULL, FK -> user.id |
| notes | text | nullable |
| createdAt | timestamp('created_at') | NOT NULL, defaultNow |
| updatedAt | timestamp('updated_at') | NOT NULL, defaultNow |

Index: `sales_orders_status_idx` on `status`

**salesOrderLines**:
| Column | Type | Constraints |
|--------|------|------------|
| id | serial | PK |
| salesOrderId | integer('sales_order_id') | NOT NULL, FK -> salesOrders.id, onDelete cascade |
| productId | integer('product_id') | NOT NULL, FK -> products.id |
| quantity | integer | NOT NULL |
| warehouseId | integer('warehouse_id') | NOT NULL, FK -> warehouses.id |

#### Relations (define using `relations()` from `drizzle-orm`)

Define relations for ALL tables to enable Drizzle's relational query API:

- `userRelations`: many sessions, accounts, movements, purchaseOrders, salesOrders
- `sessionRelations`: one user
- `accountRelations`: one user
- `productsRelations`: many stock, movements, purchaseOrderLines, salesOrderLines
- `warehousesRelations`: many stock, movementsFrom (movements via fromWarehouseId), movementsTo (movements via toWarehouseId)
- `stockRelations`: one product, one warehouse
- `movementsRelations`: one product, one fromWarehouse, one toWarehouse, one createdByUser
- `suppliersRelations`: many purchaseOrders
- `customersRelations`: many salesOrders
- `purchaseOrdersRelations`: one supplier, one createdByUser, many purchaseOrderLines
- `purchaseOrderLinesRelations`: one purchaseOrder, one product, one warehouse
- `salesOrdersRelations`: one customer, one createdByUser, many salesOrderLines
- `salesOrderLinesRelations`: one salesOrder, one product, one warehouse

- **GOTCHA**: Better Auth expects singular table names by default (`user`, `session`, `account`, `verification`). Either use singular names or set `usePlural: true` in the adapter. This plan uses **singular** names for auth tables and **plural** for domain tables.
- **GOTCHA**: For the `check` constraint on stock, use `check('stock_quantity_non_negative', sql\`"current_quantity" >= 0\`)` — quote the column name since it uses snake_case in PostgreSQL.
- **VALIDATE**: `npm run db:generate`

### Task 6: UPDATE `src/lib/auth.ts`

- **IMPLEMENT**: Add Drizzle adapter and admin plugin
- **IMPORTS**: `drizzleAdapter` from `better-auth/adapters/drizzle`, `admin` from `better-auth/plugins`, `db` from `#/db`
- **PATTERN**: Keep existing `emailAndPassword` and `tanstackStartCookies()` config

Target config:
```
betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  plugins: [admin({ defaultRole: 'staff' }), tanstackStartCookies()],
})
```

- **GOTCHA**: The admin plugin's `defaultRole` sets the role for new sign-ups. PRD wants "admin" and "staff" (not "admin" and "user"). Set `defaultRole: 'staff'`.
- **VALIDATE**: `npm run build`

### Task 7: UPDATE `src/lib/auth-client.ts`

- **IMPLEMENT**: Add adminClient plugin
- **IMPORTS**: `adminClient` from `better-auth/client/plugins`

Target:
```
createAuthClient({ plugins: [adminClient()] })
```

- **VALIDATE**: `npm run build`

### Task 8: CREATE `src/server/middleware.ts`

- **IMPLEMENT**: Two middleware functions using TanStack Start's `createMiddleware`:

**requireAuth**:
- Import `createMiddleware` from `@tanstack/react-start`
- Import `auth` from `#/lib/auth`
- In `.server()`: get session via `auth.api.getSession({ headers: request.headers })`
- If no session: `throw redirect({ to: '/login' })`
- If session: `return next({ context: { user: session.user, session: session.session } })`
- Import `redirect` from `@tanstack/react-router`

**requireAdmin**:
- Chain `.middleware([requireAuth])` to get user from context
- Check `context.user.role === 'admin'`
- If not admin: `throw redirect({ to: '/' })`
- Otherwise: `return next()`

- **GOTCHA**: `auth.api.getSession()` needs the request headers. In TanStack Start middleware, `request` is available in the server callback params.
- **GOTCHA**: The middleware `.server()` callback receives `{ next, context, request }`. Ensure you destructure correctly.
- **VALIDATE**: `npm run build`

### Task 9: CREATE `src/routes/login.tsx`

- **IMPLEMENT**: Login page with email/password form using Shadcn components
- **PATTERN**: Follow route pattern — `createFileRoute('/login')({ component })`
- **UI COMPONENTS**: Use Shadcn `Card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`), `Button`, `Input`, `Label` — these are available via `shadcn/tailwind.css` import and Tailwind classes (e.g. `bg-card`, `bg-primary`, `border-input`)
- Use `authClient.signIn.email()` from `#/lib/auth-client`
- Use React `useState` for form state and error messages
- On success: use `useNavigate()` from `@tanstack/react-router` to redirect to `/`
- Layout: centered card on `min-h-screen flex items-center justify-center bg-background`
- Include link to `/register`
- **VALIDATE**: `npm run dev`, navigate to `/login`

### Task 10: CREATE `src/routes/register.tsx`

- **IMPLEMENT**: Registration page with name, email, password, confirm password using Shadcn components
- **PATTERN**: Mirror login.tsx structure and Shadcn component usage
- **UI COMPONENTS**: Same as login — Card, Button, Input, Label
- Use `authClient.signUp.email()` from `#/lib/auth-client`
- Client-side validation: passwords match, required fields
- On success: redirect to `/login` or auto-sign-in
- Include link to `/login`
- **VALIDATE**: `npm run dev`, navigate to `/register`

### Task 11: CREATE `src/routes/_authed.tsx`

- **IMPLEMENT**: Auth guard layout route
- **PATTERN**: TanStack Router layout routes — `createFileRoute('/_authed')`
- Use `beforeLoad` to check auth server-side:
  - Create a server function that calls `auth.api.getSession({ headers: request.headers })`
  - If no session, `throw redirect({ to: '/login' })`
  - Return user data to route context
- Render `<Outlet />` in component
- **GOTCHA**: `_authed` prefix (underscore) makes it a pathless layout route in TanStack Router — it doesn't add a URL segment
- **VALIDATE**: `npm run build`

### Task 12: Push schema to database

- **ACTION**: Run `npm run db:push` (faster for dev, pushes schema directly without migration files)
- **ALTERNATIVE**: `npm run db:generate && npm run db:migrate` for migration files
- **DEPENDS ON**: PostgreSQL running, DATABASE_URL set in `.env.local`
- **VALIDATE**: `npm run db:studio` — verify all 14 tables visible

### Task 13: CREATE `src/db/seed.ts`

- **IMPLEMENT**: Seed script that populates database with demo data
- Import `db` from `#/db` (use direct import since this runs via tsx)
- Import all schema tables
- Use `db.insert()` for each table
- Seed order (respecting FK constraints):
  1. Create admin user (use Better Auth's `auth.api.signUpEmail()` or direct insert)
  2. Create staff user
  3. Create 3-4 warehouses
  4. Create 10-15 products with varied categories
  5. Create 3-4 suppliers
  6. Create 3-4 customers
  7. Create initial stock records
  8. Create sample movements
  9. Create sample purchase orders with lines
  10. Create sample sales orders with lines
- Add `"db:seed": "npx tsx src/db/seed.ts"` to package.json scripts
- **GOTCHA**: For user creation, Better Auth hashes passwords. Either use `auth.api.signUpEmail()` programmatically or use bcrypt/scrypt directly matching Better Auth's hashing.
- **VALIDATE**: `npm run db:seed`

---

## TESTING STRATEGY

### Unit Tests

No unit tests for schema definitions — schema correctness is validated by migration success and seed script execution.

### Integration Tests

- Auth flow: register -> login -> access protected route -> sign out -> redirect to login
- Role enforcement: staff user cannot access admin-only resources

### Edge Cases

- Register with duplicate email -> should show error
- Login with wrong password -> should show error
- Access `/_authed/*` while unauthenticated -> redirect to `/login`
- Schema CHECK constraint: inserting stock with negative quantity -> should fail at DB level

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npm run check          # Prettier + ESLint auto-fix
npm run lint           # ESLint check
npm run format         # Prettier check
```

### Level 2: Build
```bash
npm run build          # Full production build — catches all TypeScript errors
```

### Level 3: Database
```bash
npm run db:push        # Push schema to PostgreSQL
npm run db:studio      # Visual verification of all tables
```

### Level 4: Manual Validation
1. `npm run dev` — start dev server
2. Navigate to `/login` — page renders
3. Navigate to `/register` — page renders
4. Register a new account — redirects to login
5. Login with credentials — redirects to home
6. Header shows user avatar/initial + sign out button
7. Sign out — redirects to login
8. Access any `/_authed/*` route while logged out — redirects to `/login`

### Level 5: Seed Data
```bash
npm run db:seed        # Populate with demo data
npm run db:studio      # Verify data in all tables
```

---

## ACCEPTANCE CRITERIA

- [ ] All 14 tables exist in PostgreSQL with correct columns, types, constraints
- [ ] stock.current_quantity has CHECK >= 0 constraint
- [ ] stock has unique(product_id, warehouse_id) constraint
- [ ] All indexes created (movements, products, purchase_orders, sales_orders)
- [ ] Better Auth uses Drizzle adapter with PostgreSQL
- [ ] Admin plugin active with defaultRole 'staff'
- [ ] Login page functional at /login
- [ ] Register page functional at /register
- [ ] Auth guard layout redirects unauthenticated users to /login
- [ ] requireAuth middleware works in server functions
- [ ] requireAdmin middleware blocks non-admin users
- [ ] styles.css cleaned: no TanStack template styles remain (no sea-ink, island-shell, etc.)
- [ ] All components use Shadcn design tokens (bg-background, text-foreground, border-border, etc.)
- [ ] Header shows "TitanWMS" branding with Shadcn styling
- [ ] Page title shows "TitanWMS"
- [ ] Sign-in link goes to /login
- [ ] Login/register pages use Shadcn Card, Button, Input, Label patterns
- [ ] Seed script creates demo data successfully
- [ ] `npm run build` passes with zero errors
- [ ] `npm run check` passes with zero errors

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order (Tasks 1-13, including 4b-4f)
- [ ] Each task validation passed
- [ ] Full build succeeds (`npm run build`)
- [ ] Lint/format passes (`npm run check`)
- [ ] Schema pushed to database
- [ ] Seed script runs successfully
- [ ] Manual auth flow verified end-to-end
- [ ] All acceptance criteria met

---

## NOTES

- **Better Auth table names**: Using singular names (`user`, `session`, `account`, `verification`) to match Better Auth defaults. Domain tables use plural (`products`, `warehouses`, etc.).
- **Role strategy**: Using Better Auth's admin plugin with `defaultRole: 'staff'`. First admin user created via seed script. PRD roles are "admin" and "staff" (not "admin" and "user").
- **Middleware location**: `src/server/middleware.ts` — matches PRD's `src/server/` directory for server functions. The middleware will be reused by all server functions in Phase 2.
- **Shadcn/UI from the start**: Shadcn is already installed (`shadcn/tailwind.css` imported, all CSS variables present). All UI should use Shadcn design tokens and Tailwind utility classes from day one. The old TanStack Start template styles (island-shell, sea-ink, lagoon, etc.) are removed in Task 2.
- **Style cleanup scope**: Task 2 removes ~200 lines of template CSS. Tasks 3-4f update all existing components/routes to use Shadcn classes. This means Header, Footer, ThemeToggle, index page, about page, and header-user all get rewritten to use `bg-background`, `text-foreground`, `border-border`, etc.
- **Schema is the most critical file**: ~300-400 lines. Triple-check all FK references, enum usage, and constraint syntax before running db:push.
