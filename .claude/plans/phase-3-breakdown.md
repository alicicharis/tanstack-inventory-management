# Phase 3 Breakdown: Core UI

## Source

- **PRD**: `.claude/PRD.md`
- **Phase**: 3 — Core UI
- **Phase Goal**: CRUD pages for all entities + stock overview

## Prerequisites

- Phase 1 (Schema + Auth) complete: all tables, auth, middleware
- Phase 2 (Server Functions + Validators) complete: all CRUD server fns, stock queries, validators
- Shadcn CLI configured (`components.json` exists, icon library: phosphor)
- Only `button.tsx` exists in `src/components/ui/` — need many more Shadcn components

## Shared Context

### Patterns to Follow

- `src/server/products.ts` (lines 1-68) — CRUD server function pattern (list, get, create, update, delete)
- `src/server/warehouses.ts` (lines 1-72) — Same pattern with utilization query
- `src/routes/_authed/dashboard.tsx` (lines 1-25) — Route component pattern using `createFileRoute` + `Route.useRouteContext()`
- `src/routes/_authed/route.tsx` (lines 1-32) — Auth guard with `beforeLoad` returning `{ user, session }` to context
- `src/lib/validators/products.ts` (lines 1-15) — Zod schema pattern, types exported

### Naming Conventions

- Routes: `src/routes/_authed/{entity}/index.tsx` (list), `$id.tsx` (detail), `new.tsx` (create)
- Components: PascalCase files in `src/components/`
- Server imports: `#/server/{entity}` for server fns
- Validator imports: `#/lib/validators/{entity}` for Zod schemas + types
- Path alias: `#/` maps to `src/`

### Key Imports & Utils

- `cn()` from `#/lib/utils` — class merging
- `Link`, `createFileRoute` from `@tanstack/react-router`
- `createServerFn` from `@tanstack/react-start`
- `useQueryClient` from `@tanstack/react-query` for cache invalidation
- Server fns: `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct` (same for warehouses, suppliers, customers)
- Stock: `getStockOverview`, `getStockByWarehouse`, `getLowStockAlerts`
- Validators: `createProductSchema`, `updateProductSchema`, etc.

### Gotchas

- Use `#/` path alias, NOT `@/`
- Shadcn configured with `rsc: false` and icon library `phosphor` (NOT lucide — but PRD says lucide; check what's installed)
- TanStack Router file-based routing auto-generates `routeTree.gen.ts` — just create files in correct paths
- `beforeLoad` data available via `Route.useRouteContext()` in components
- Route loaders call server functions directly (SSR), mutations use client-side calls
- No inline styles — use Tailwind classes only

### Validation Commands

```bash
npm run build        # Must pass — catches type errors and route issues
npm run lint         # ESLint check
npm run check        # Auto-fix formatting + lint
npm run dev          # Manual verification
```

## Task Dependency Graph

```
Task 1 (Shadcn components install)
  |
  v
Task 2 (Shared UI components: data-table, page-header, status-badge, kpi-card)
  |
  +------------------------------------------+
  |                    |                      |
  v                    v                      v
Task 3 (Products    Task 4 (Warehouses     Task 5 (Suppliers &
 CRUD pages)         CRUD pages)            Customers CRUD pages)
  |                    |                      |
  +--------------------+----------------------+
  |
  v
Task 6 (Stock overview page)
  |
  v
Task 7 (Navigation update + polish)
```

## Parallel Groups

- **Group A**: Task 1 (sequential prerequisite)
- **Group B**: Task 2 (depends on Task 1)
- **Group C** (can run in parallel): Tasks 3, 4, 5
- **Group D**: Task 6 (depends on Group C for pattern, but technically only needs Task 2)
- **Group E**: Task 7 (depends on all)

---

## Task 1: Install Required Shadcn UI Components

**Done when**: All needed Shadcn primitives are installed in `src/components/ui/`
**Complexity**: Low
**Pattern**: Command execution
**Estimated scope**: ~0 lines written (CLI installs)
**Depends on**: none
**Layer**: Setup

### Implementation Steps

1. **RUN** `npx shadcn@latest add table input label select textarea dialog dropdown-menu badge card separator toast tabs` — install all primitives needed for CRUD pages, data tables, forms, and status badges
2. **RUN** `npx shadcn@latest add form` — if available, for form handling (uses react-hook-form + zod resolver)
3. **VALIDATE**: `ls src/components/ui/` shows all installed components
4. **VALIDATE**: `npm run build` passes

### Gotchas

- Shadcn config uses `phosphor` icons — installed components may reference `@phosphor-icons/react` instead of `lucide-react`
- If `form` component isn't available in this Shadcn version, we'll build forms manually with controlled inputs

### Acceptance Criteria

- [ ] `src/components/ui/` contains: table, input, label, select, textarea, dialog, dropdown-menu, badge, card, separator, tabs (at minimum)
- [ ] `npm run build` passes

---

## Task 2: Shared UI Components (data-table, page-header, status-badge, kpi-card)

**Done when**: Four reusable components exist and are importable, with correct types
**Complexity**: Medium
**Pattern**: Template-first (establishes patterns for all pages)
**Estimated scope**: ~250 lines across 4 files
**Depends on**: Task 1
**Layer**: UI Components

### Files to Read First

- `src/components/ui/table.tsx` — Shadcn table primitive to wrap
- `src/components/ui/badge.tsx` — for status-badge base
- `src/components/ui/card.tsx` — for kpi-card base
- `src/components/Header.tsx` (lines 1-43) — existing component style

### Files to Create

- `src/components/data-table.tsx` — Generic data table with column definitions, sorting, optional search
- `src/components/page-header.tsx` — Page title + description + optional action button
- `src/components/status-badge.tsx` — Color-coded badge for PO/SO statuses
- `src/components/kpi-card.tsx` — Metric card with title, value, optional icon/trend

### Implementation Steps

1. **CREATE** `src/components/page-header.tsx`
   - Props: `title: string`, `description?: string`, `action?: ReactNode`
   - Simple flex layout with title left, action right

2. **CREATE** `src/components/data-table.tsx`
   - Generic component with column definition type: `{ header: string, accessorKey: string, cell?: (row) => ReactNode }`
   - Uses Shadcn Table primitives
   - Props: `columns`, `data`, `onRowClick?`, `emptyMessage?`
   - Keep simple — no built-in pagination or sorting for now (pages handle that)

3. **CREATE** `src/components/status-badge.tsx`
   - Maps status strings to variant/color: DRAFT=secondary, SUBMITTED=default, PARTIALLY_RECEIVED=warning, RECEIVED=success, CONFIRMED=default, SHIPPED=success
   - Uses Shadcn Badge component

4. **CREATE** `src/components/kpi-card.tsx`
   - Uses Shadcn Card
   - Props: `title: string`, `value: string | number`, `description?: string`, `icon?: ReactNode`

5. **VALIDATE**: `npm run build`

### Acceptance Criteria

- [ ] All 4 components export correctly from their files
- [ ] Components use Shadcn primitives (not raw HTML tables/badges)
- [ ] `npm run build` passes

---

## Task 3: Products CRUD Pages

**Done when**: Can list, view, create, edit, and delete products through the UI
**Complexity**: Medium
**Pattern**: Template-first (establishes CRUD page pattern for other entities)
**Estimated scope**: ~300 lines across 3-4 files
**Depends on**: Task 2
**Layer**: UI (Routes)

### Files to Read First

- `src/server/products.ts` (lines 1-68) — available server functions
- `src/lib/validators/products.ts` — form validation schema
- `src/components/data-table.tsx` — table component (from Task 2)
- `src/components/page-header.tsx` — header component (from Task 2)

### Files to Create

- `src/routes/_authed/products/index.tsx` — Product list page
- `src/routes/_authed/products/new.tsx` — Create product form
- `src/routes/_authed/products/$id.tsx` — Product detail/edit page

### Implementation Steps

1. **CREATE** `src/routes/_authed/products/index.tsx`
   - Route loader calls `listProducts()`
   - Renders PageHeader with "Products" title and "Add Product" link
   - Renders DataTable with columns: SKU, Name, Category, UOM, Reorder Point
   - Row click navigates to `$id` detail page

2. **CREATE** `src/routes/_authed/products/new.tsx`
   - Form with fields matching `createProductSchema`: sku, name, description, category, unitOfMeasure, reorderPoint
   - Uses Shadcn Input, Label, Select (for UOM), Textarea (for description)
   - On submit: calls `createProduct()`, navigates to products list
   - Cancel button returns to list

3. **CREATE** `src/routes/_authed/products/$id.tsx`
   - Route loader calls `getProduct({ id })` (parse `$id` param as int)
   - Edit form pre-filled with product data, using `updateProductSchema`
   - Delete button with confirmation dialog
   - On save: calls `updateProduct()`, on delete: calls `deleteProduct()`, navigate back

4. **VALIDATE**: `npm run build`

### Gotchas

- Route params are strings — parse `$id` to int: `Number(params.id)`
- Use `Route.useLoaderData()` to access loader data in component
- Server functions called in loader run on server (SSR); called in event handlers run as RPC

### Acceptance Criteria

- [ ] `/products` shows list of all products
- [ ] `/products/new` form creates a product and redirects to list
- [ ] `/products/$id` shows edit form, saves changes, can delete
- [ ] `npm run build` passes

---

## Task 4: Warehouses CRUD Pages

**Done when**: Can list, view, create, edit, and delete warehouses through the UI, with capacity utilization shown
**Complexity**: Low
**Pattern**: Replicate Products pattern
**Estimated scope**: ~250 lines across 3 files
**Depends on**: Task 2 (and Task 3 as pattern reference)
**Layer**: UI (Routes)

### Files to Read First

- `src/routes/_authed/products/index.tsx` — pattern to replicate (from Task 3)
- `src/server/warehouses.ts` (lines 1-72) — server functions (note: `getWarehouse` returns `currentUtilization`)
- `src/lib/validators/warehouses.ts` — form schema

### Files to Create

- `src/routes/_authed/warehouses/index.tsx` — Warehouse list
- `src/routes/_authed/warehouses/new.tsx` — Create warehouse
- `src/routes/_authed/warehouses/$id.tsx` — Warehouse detail/edit with capacity bar

### Implementation Steps

1. **CREATE** list page — MIRROR products/index.tsx pattern
   - Columns: Name, Location, Total Capacity

2. **CREATE** new page — MIRROR products/new.tsx pattern
   - Fields: name, location, totalCapacity

3. **CREATE** detail page — MIRROR products/$id.tsx pattern
   - Additionally show capacity utilization: `currentUtilization / totalCapacity` as a progress bar or fraction
   - Edit form + delete button

4. **VALIDATE**: `npm run build`

### Acceptance Criteria

- [ ] `/warehouses` lists all warehouses
- [ ] `/warehouses/new` creates a warehouse
- [ ] `/warehouses/$id` shows edit form with capacity utilization display
- [ ] `npm run build` passes

---

## Task 5: Suppliers & Customers CRUD Pages

**Done when**: Can list, view, create, edit, and delete both suppliers and customers through the UI
**Complexity**: Low
**Pattern**: Replicate Products pattern (x2, nearly identical schemas)
**Estimated scope**: ~400 lines across 6 files
**Depends on**: Task 2 (and Task 3 as pattern reference)
**Layer**: UI (Routes)

### Files to Read First

- `src/routes/_authed/products/index.tsx` — pattern (from Task 3)
- `src/server/suppliers.ts` + `src/server/customers.ts` — server functions
- `src/lib/validators/suppliers.ts` + `src/lib/validators/customers.ts` — schemas

### Files to Create

- `src/routes/_authed/suppliers/index.tsx`
- `src/routes/_authed/suppliers/new.tsx`
- `src/routes/_authed/suppliers/$id.tsx`
- `src/routes/_authed/customers/index.tsx`
- `src/routes/_authed/customers/new.tsx`
- `src/routes/_authed/customers/$id.tsx`

### Implementation Steps

1. **CREATE** suppliers list, new, detail — MIRROR products pattern
   - Columns: Name, Contact Name, Email, Phone
   - Fields: name, contactName, email, phone, address

2. **CREATE** customers list, new, detail — MIRROR suppliers exactly (identical schema)
   - Replace "Supplier" with "Customer" everywhere

3. **VALIDATE**: `npm run build`

### Gotchas

- Suppliers and customers have identical schemas — maximize copy-paste, just swap entity name and imports

### Acceptance Criteria

- [ ] `/suppliers` and `/customers` list pages work
- [ ] Create and edit forms for both entities work
- [ ] Delete works for both
- [ ] `npm run build` passes

---

## Task 6: Stock Overview Page

**Done when**: Stock overview page shows product x warehouse grid with color-coded quantities and filters
**Complexity**: Medium
**Pattern**: Unique (grid layout, not standard CRUD)
**Estimated scope**: ~200 lines across 1-2 files
**Depends on**: Task 2
**Layer**: UI (Route)

### Files to Read First

- `src/server/stock.ts` (lines 1-58) — `getStockOverview`, `getStockByWarehouse`, `getLowStockAlerts`
- `src/server/warehouses.ts` — `listWarehouses` for filter dropdown
- `src/db/schema.ts` (lines 104-146) — stock/product/warehouse schemas for types
- `src/components/data-table.tsx` — may reuse or build custom grid

### Files to Create

- `src/routes/_authed/stock/index.tsx` — Stock overview page

### Implementation Steps

1. **CREATE** `src/routes/_authed/stock/index.tsx`
   - Route loader: call `getStockOverview()` and `listWarehouses()` in parallel
   - Display as a table/grid: rows = products, columns include warehouse quantities
   - Color-code cells: red if quantity <= reorder point, yellow if within 2x reorder point, green otherwise
   - Optional warehouse filter dropdown (client-side filter or call `getStockByWarehouse`)
   - Show low stock alerts section using `getLowStockAlerts()` or derive from overview data
   - Use PageHeader with "Stock Overview" title

2. **VALIDATE**: `npm run build`

### Gotchas

- Stock overview returns flat array of `{ product, warehouse, currentQuantity }` — need to pivot into grid format client-side
- Products without any stock records won't appear — that's expected (no stock = no row)

### Acceptance Criteria

- [ ] `/stock` shows product x warehouse grid
- [ ] Low stock items are visually highlighted (red/yellow)
- [ ] Optional filter by warehouse works
- [ ] `npm run build` passes

---

## Task 7: Navigation Update + Layout Polish

**Done when**: Header navigation includes links to all entity pages, authed layout has sidebar or top nav, app is navigable
**Complexity**: Low
**Pattern**: Unique
**Estimated scope**: ~100 lines across 2-3 files
**Depends on**: Tasks 3-6
**Layer**: UI (Layout)

### Files to Read First

- `src/components/Header.tsx` (lines 1-43) — current header with Home/About links
- `src/routes/_authed/route.tsx` (lines 1-32) — current authed layout (bare Outlet)

### Files to Modify

- `src/components/Header.tsx` — Add nav links for authed pages OR create separate authed nav
- `src/routes/_authed/route.tsx` — Add sidebar/nav layout wrapping Outlet

### Implementation Steps

1. **UPDATE** `src/routes/_authed/route.tsx`
   - Add a sidebar or top navigation bar within the authed layout
   - Links: Dashboard, Products, Warehouses, Stock, Suppliers, Customers
   - Highlight active route using TanStack Router's `activeProps`
   - Wrap content in a layout with nav + main content area

2. **UPDATE** `src/components/Header.tsx`
   - Remove or conditionalize "Home" / "About" links for authed users
   - Or keep header minimal and let the authed layout handle entity navigation

3. **VALIDATE**: `npm run build` and manual check that all navigation works

### Acceptance Criteria

- [ ] All CRUD pages are reachable from navigation
- [ ] Active page is visually indicated
- [ ] Navigation is consistent across all authed pages
- [ ] `npm run build` passes

---

## Summary

| #   | Task                                                                   | Complexity | Depends On | Layer      | Est. Lines |
| --- | ---------------------------------------------------------------------- | ---------- | ---------- | ---------- | ---------- |
| 1   | Install Shadcn UI components                                           | Low        | none       | Setup      | ~0 (CLI)   |
| 2   | Shared UI components (data-table, page-header, status-badge, kpi-card) | Medium     | 1          | Components | ~250       |
| 3   | Products CRUD pages (template)                                         | Medium     | 2          | Routes     | ~300       |
| 4   | Warehouses CRUD pages                                                  | Low        | 2, (3 ref) | Routes     | ~250       |
| 5   | Suppliers & Customers CRUD pages                                       | Low        | 2, (3 ref) | Routes     | ~400       |
| 6   | Stock overview page                                                    | Medium     | 2          | Routes     | ~200       |
| 7   | Navigation update + layout polish                                      | Low        | 3-6        | Layout     | ~100       |

**Total tasks**: 7
**Critical path**: Task 1 -> Task 2 -> Task 3 -> Task 7
**Parallel opportunities**: Tasks 3, 4, 5, 6 can all run in parallel after Task 2
**Estimated confidence for one-pass execution**: 8/10 per task (straightforward CRUD UI with clear patterns)
