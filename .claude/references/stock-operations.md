# Stock Operations

## Overview

All stock mutations follow a ledger-first pattern: every quantity change produces an immutable movement record within a database transaction. Stock integrity is guaranteed by a DB-level CHECK constraint (`current_quantity >= 0`), not application logic.

## Key Decisions

- **Stock integrity at the DB level**: `stock.current_quantity CHECK (>= 0)` prevents negative stock regardless of application bugs.
  - **Why**: "Data integrity by design, not discipline" — the DB constraint holds even if app logic has bugs.

- **Movement direction via nullable warehouse IDs**: Instead of a `direction` column, movements use `fromWarehouseId` and `toWarehouseId` (both nullable). RECEIVE sets only `to`, SHIP sets only `from`, TRANSFER sets both, ADJUSTMENT sets one based on sign.
  - **Why**: Flexible schema that naturally models all movement types without awkward enums for direction.

- **Movement quantities are always positive**: Direction is encoded by which warehouse IDs are populated, not by the sign of the quantity.

- **Low stock alert aggregates across ALL warehouses**: `SUM(quantity)` across all warehouses compared against a single `reorderPoint` per product.
  - **Why**: Reorder decisions are about total inventory, not per-location levels.

## Patterns & Conventions

- **Stock upsert pattern**: `INSERT ... ON CONFLICT (productId, warehouseId) DO UPDATE SET current_quantity = current_quantity + qty` — used for receiving, transfers (destination), and positive adjustments.

- **Transaction boundary rule**: Use `db.transaction()` when a mutation touches multiple tables or multiple rows. Single-row single-table mutations skip transactions.

- **Aggregations use `sum().mapWith(Number)`**: Drizzle's `sum()` returns string|null; `.mapWith(Number)` converts inline.

## Gotchas & Pitfalls

- **Negative adjustments require existing stock record**: A positive adjustment can create a new stock record via upsert, but a negative adjustment throws "No stock record found" if no record exists. This asymmetry is intentional but easy to forget.

- **No "updated by" tracking**: Only `createdBy` is recorded on movements. If a movement is created by one user, there's no mechanism to track modifications — only creation.

## Key Files

- `src/db/schema.ts` — Stock and movement table definitions, CHECK constraint, composite unique on `(productId, warehouseId)`.
- `src/server/movements.ts` — Core transactional stock logic: `createTransfer`, `createAdjustment`, `getMovements`.
- `src/server/stock.ts` — Read-only stock queries: overview grid, per-warehouse, per-product, low stock alerts.
- `src/lib/validators/stock.ts` — Transfer/adjustment/movement Zod schemas with `.refine()` business rules.
