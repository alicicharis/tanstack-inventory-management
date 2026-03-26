# Server Function Patterns

## Overview

All business logic lives in `src/server/` as TanStack Start server functions. Every function follows a consistent structure: middleware → validation → handler. CRUD operations are uniform across entities. Dashboard uses parallel query execution.

## Patterns & Conventions

- **CRUD uniformity**: Every entity follows `list*`, `get*`, `create*`, `update*`, `delete*` with `.returning()` on all mutations.

- **Validator structure**: Each entity has `create*Schema` (required fields) and `update*Schema` (`.partial()` version). Stock operations have dedicated schemas with `.refine()` for cross-field business rules.

- **Error philosophy**: Throw descriptive errors, never return `{ error }`. Zod handles input validation, handlers throw for business logic violations, DB constraints catch the rest.

- **Dashboard parallel queries**: `Promise.all()` runs 7 independent aggregation queries simultaneously (KPIs, charts, alerts, recent movements).

## Key Files

- `src/server/products.ts`, `warehouses.ts`, `suppliers.ts`, `customers.ts` — Standard CRUD.
- `src/server/dashboard.ts` — Parallel aggregation queries for KPIs and charts.
- `src/db/seed.ts` — Creates 2 users (admin + staff), 12 products, 3 warehouses, sample orders and movements.
