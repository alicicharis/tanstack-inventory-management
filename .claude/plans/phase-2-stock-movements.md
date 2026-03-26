# Feature: Stock Queries + Core Movement Logic

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Create server-side functions for querying stock levels across products and warehouses, plus atomic transfer and adjustment operations that maintain inventory integrity through database transactions.

## User Story

As a warehouse manager
I want to view stock levels across all warehouses, transfer stock between locations, and record inventory adjustments
So that I can maintain accurate, real-time inventory records with full audit trails

## Problem Statement

The system has stock and movement tables but no server functions to query stock or perform stock mutations. All stock-changing operations must be atomic to prevent inconsistencies.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: `src/server/`, `src/lib/validators/`
**Dependencies**: Zod validators (Task 1 — complete), DB schema (Phase 1 — complete)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ BEFORE IMPLEMENTING

- `src/db/schema.ts` (lines 129-146) — `stock` table: productId, warehouseId, currentQuantity; unique constraint on (productId, warehouseId); CHECK `current_quantity >= 0`
- `src/db/schema.ts` (lines 148-179) — `movements` table: productId, fromWarehouseId (nullable), toWarehouseId (nullable), quantity, type (enum), reasonCode (enum), notes, createdBy, createdAt; indexes on product+type+createdAt
- `src/db/schema.ts` (lines 104-118) — `products` table: id, sku, name, reorderPoint
- `src/db/schema.ts` (lines 120-127) — `warehouses` table: id, name, totalCapacity
- `src/db/schema.ts` (lines 297-327) — stock and movement relations (stock→product/warehouse, movements→product/fromWarehouse/toWarehouse/createdByUser)
- `src/lib/validators/stock.ts` — `transferStockSchema`, `adjustStockSchema` (already implemented)
- `src/server/middleware.ts` — `requireAuth` middleware providing `context.user.id`
- `src/db/index.ts` — `export const db = drizzle(process.env.DATABASE_URL!, { schema })`
- `.claude/references/tanstack.md` — Server function conventions, handler signature `{ data, context }`
- `.claude/plans/phase-2-crud-server-functions.md` — CRUD pattern reference (follow same structure)

### New Files to Create

- `src/server/stock.ts` — Stock query server functions (4 functions)
- `src/server/movements.ts` — Movement mutation + query server functions (3 functions)

### Files to Modify

- `src/lib/validators/stock.ts` — Add `getMovementsSchema` for paginated movement queries

### Patterns to Follow

**Server Function with Middleware + Validator (from CRUD plan):**

```typescript
export const someFunction = createServerFn()
  .middleware([requireAuth])
  .validator(someSchema)
  .handler(async ({ data: input, context }) => {
    const userId = context.user.id
    // ...
  })
```

**Naming Convention**: `getStockOverview`, `createTransfer`, etc. — camelCase, descriptive verb + noun.

**Error Handling**: Throw errors with descriptive messages. Let DB constraint errors propagate.

**Imports**: Use `#/` path alias. Zod v4 syntax: `z.int().positive()`.

**Transactions**: `db.transaction(async (tx) => { ... })` — use `tx` (not `db`) for all operations inside.

---

## IMPLEMENTATION PLAN

### Phase 1: Add Movement Query Validator

Add `getMovementsSchema` to `src/lib/validators/stock.ts` for the paginated/filtered movement query.

### Phase 2: Stock Query Functions

Create `src/server/stock.ts` with 4 read-only query functions. Uses Drizzle relational queries for simple lookups, core API with aggregation for low stock alerts.

### Phase 3: Movement Mutation + Query Functions

Create `src/server/movements.ts` with 2 transactional mutation functions and 1 paginated query function. This is the most complex part — atomic stock changes with movement audit trail.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `src/lib/validators/stock.ts` — Add movement query validator

- **ADD** after existing exports:

```typescript
export const getMovementsSchema = z.object({
  page: z.int().positive().optional().default(1),
  pageSize: z.int().positive().max(100).optional().default(20),
  productId: z.int().positive().optional(),
  warehouseId: z.int().positive().optional(),
  type: z.enum(['RECEIVE', 'SHIP', 'TRANSFER', 'ADJUSTMENT']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export type GetMovementsInput = z.infer<typeof getMovementsSchema>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 2: CREATE `src/server/stock.ts` — Stock query functions

- **IMPORTS**:

  ```typescript
  import { createServerFn } from '@tanstack/react-start'
  import { z } from 'zod'
  import { eq, sql, sum } from 'drizzle-orm'
  import { db } from '#/db'
  import { stock, products } from '#/db/schema'
  import { requireAuth } from '#/server/middleware'
  ```

- **IMPLEMENT `getStockOverview`**: No input. Use `db.query.stock.findMany({ with: { product: true, warehouse: true } })`. Returns all stock rows with nested product/warehouse.

- **IMPLEMENT `getStockByWarehouse`**: Input `z.object({ warehouseId: z.int().positive() })`. Filter `eq(stock.warehouseId, data.warehouseId)`, include `{ product: true }`.

- **IMPLEMENT `getStockByProduct`**: Input `z.object({ productId: z.int().positive() })`. Filter `eq(stock.productId, data.productId)`, include `{ warehouse: true }`.

- **IMPLEMENT `getLowStockAlerts`**: No input. Use Drizzle core API with aggregation:

  ```typescript
  db.select({
    productId: stock.productId,
    productName: products.name,
    sku: products.sku,
    reorderPoint: products.reorderPoint,
    totalStock: sum(stock.currentQuantity).mapWith(Number).as('total_stock'),
  })
    .from(stock)
    .innerJoin(products, eq(stock.productId, products.id))
    .groupBy(
      stock.productId,
      products.name,
      products.sku,
      products.reorderPoint,
    )
    .having(sql`SUM(${stock.currentQuantity}) <= ${products.reorderPoint}`)
  ```

- **GOTCHA**: `sum()` returns `string | null`. Use `.mapWith(Number)` to coerce.
- **VALIDATE**: `npx tsc --noEmit`

### Task 3: CREATE `src/server/movements.ts` — Transfer, adjustment, and query functions

- **IMPORTS**:

  ```typescript
  import { createServerFn } from '@tanstack/react-start'
  import { and, eq, gte, lte, sql, count } from 'drizzle-orm'
  import { db } from '#/db'
  import { stock, movements } from '#/db/schema'
  import { requireAuth } from '#/server/middleware'
  import {
    transferStockSchema,
    adjustStockSchema,
    getMovementsSchema,
  } from '#/lib/validators/stock'
  ```

- **IMPLEMENT `createTransfer`**: Validator `transferStockSchema`. Inside `db.transaction()`:
  1. Read source stock row: `tx.select().from(stock).where(and(eq(stock.productId, ...), eq(stock.warehouseId, ...)))`
  2. Validate: `if (!sourceStock || sourceStock.currentQuantity < input.quantity)` → throw `'Insufficient stock at source warehouse'`
  3. Decrement source: `tx.update(stock).set({ currentQuantity: sql\`"current_quantity" - ${input.quantity}\`, updatedAt: new Date() }).where(...)`
  4. Upsert destination: `tx.insert(stock).values({ productId, warehouseId: toWarehouseId, currentQuantity: quantity }).onConflictDoUpdate({ target: [stock.productId, stock.warehouseId], set: { currentQuantity: sql\`"current_quantity" + ${input.quantity}\`, updatedAt: new Date() } })`
  5. Insert movement: `tx.insert(movements).values({ productId, fromWarehouseId, toWarehouseId, quantity, type: 'TRANSFER', createdBy: context.user.id })`
  6. Return the movement record

- **IMPLEMENT `createAdjustment`**: Validator `adjustStockSchema`. Inside `db.transaction()`:
  1. If `quantityChange > 0`: upsert stock with `onConflictDoUpdate` adding to `current_quantity`
  2. If `quantityChange < 0`: update existing stock row, subtracting. Throw `'No stock record found for this product and warehouse'` if no row affected. DB CHECK constraint prevents going below 0.
  3. Insert movement: `type: 'ADJUSTMENT'`, `reasonCode`, `notes`. Set `fromWarehouseId` if negative (stock leaving), `toWarehouseId` if positive (stock arriving). `quantity: Math.abs(quantityChange)`.
  4. Return the movement record

- **IMPLEMENT `getMovements`**: Validator `getMovementsSchema`. Build dynamic where conditions:
  - `productId` → `eq(movements.productId, ...)`
  - `warehouseId` → `sql\`(${movements.fromWarehouseId} = ${warehouseId} OR ${movements.toWarehouseId} = ${warehouseId})\``
  - `type` → `eq(movements.type, ...)`
  - `dateFrom` → `gte(movements.createdAt, new Date(dateFrom))`
  - `dateTo` → `lte(movements.createdAt, new Date(dateTo))`
  - Combine with `and(...conditions)` or `undefined` if empty
  - Parallel fetch: data (with relations: product, fromWarehouse, toWarehouse, createdByUser; ordered by createdAt desc; limit + offset) + count
  - Return `{ data, total, page, pageSize }`

- **GOTCHA**: Use `"current_quantity"` (quoted column name) in raw SQL since Drizzle maps camelCase to snake_case.
- **GOTCHA**: The `.refine()` on `transferStockSchema` means `.validator(transferStockSchema)` may need the schema passed differently if TanStack Start's validator doesn't support refined schemas. If it fails, extract the refinement check into the handler instead.
- **VALIDATE**: `npx tsc --noEmit`

### Task 4: Final Validation

- **VALIDATE**: `npx tsc --noEmit` — full project type check
- **VALIDATE**: `npm run check` — auto-fix formatting + lint

---

## VALIDATION COMMANDS

### Level 1: Syntax & Types

```bash
npx tsc --noEmit
```

### Level 2: Lint & Format

```bash
npm run check
```

### Level 3: Manual Validation

After seeding data:

1. Call `getStockOverview` — verify returns stock grid with product/warehouse names
2. Call `getLowStockAlerts` — verify returns products at/below reorder point
3. Call `createTransfer` — verify source decremented, dest incremented, movement logged
4. Call `createTransfer` with quantity exceeding source stock — verify it throws
5. Call `createAdjustment` with positive change — verify stock increased, movement logged with reason
6. Call `createAdjustment` with negative change exceeding stock — verify DB CHECK rejects
7. Call `getMovements` with various filters — verify pagination and filtering work

---

## ACCEPTANCE CRITERIA

- [ ] `src/lib/validators/stock.ts` has `getMovementsSchema` with page, pageSize, productId, warehouseId, type, dateFrom, dateTo
- [ ] `src/server/stock.ts` exports: `getStockOverview`, `getStockByWarehouse`, `getStockByProduct`, `getLowStockAlerts`
- [ ] `src/server/movements.ts` exports: `createTransfer`, `createAdjustment`, `getMovements`
- [ ] All functions use `requireAuth` middleware
- [ ] `createTransfer` and `createAdjustment` are wrapped in `db.transaction()`
- [ ] Transfer validates source stock before decrementing
- [ ] Transfer upserts destination stock row
- [ ] Adjustment handles both positive and negative changes
- [ ] Movement records include correct type, createdBy, and optional reasonCode/notes
- [ ] `getMovements` supports pagination and all 5 filter dimensions
- [ ] `getLowStockAlerts` correctly aggregates across warehouses and compares to reorderPoint
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run check` passes

---

## NOTES

- The DB CHECK constraint `current_quantity >= 0` is the safety net for negative stock. We validate in app logic (transfer) but also rely on DB (adjustment).
- `transferStockSchema` uses `.refine()` which returns a `ZodEffects` type. If TanStack Start's `.validator()` doesn't accept it, move the same-warehouse check into the handler.
- Movement `quantity` is always positive in the DB. The direction is encoded by which warehouse IDs are set (from vs to).
- No `updatedAt` on the movements table — it's append-only (createdAt only).
- Confidence score: **8/10** — transactional logic and Drizzle SQL expressions are the main risk areas.
