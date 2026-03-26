# Feature: CRUD Server Functions for Products, Warehouses, Suppliers, Customers

The following plan should be complete, but validate documentation and codebase patterns before implementing.

## Feature Description

Create server-side CRUD functions (list, getById, create, update, delete) for the four simple entities: products, warehouses, suppliers, and customers. These are the data management backbone that all other features (orders, stock, dashboard) depend on.

## User Story

As a warehouse manager
I want to create, view, edit, and delete products, warehouses, suppliers, and customers
So that I can manage the core reference data for my inventory system

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: `src/server/`
**Dependencies**: Zod validators (Task 1 — already complete in `src/lib/validators/`)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ BEFORE IMPLEMENTING

- `src/server/middleware.ts` (lines 1-33) — Auth middleware pattern: `requireAuth`, `requireAdmin`
- `src/db/schema.ts` (lines 104-118) — Products table definition
- `src/db/schema.ts` (lines 120-127) — Warehouses table definition
- `src/db/schema.ts` (lines 181-190) — Suppliers table definition
- `src/db/schema.ts` (lines 192-201) — Customers table definition
- `src/db/index.ts` — DB client: `import { db } from '#/db'`
- `src/lib/validators/products.ts` — `createProductSchema`, `updateProductSchema`
- `src/lib/validators/warehouses.ts` — `createWarehouseSchema`, `updateWarehouseSchema`
- `src/lib/validators/suppliers.ts` — `createSupplierSchema`, `updateSupplierSchema`
- `src/lib/validators/customers.ts` — `createCustomerSchema`, `updateCustomerSchema`
- `src/routes/_authed/route.tsx` (lines 6-20) — Existing `createServerFn` usage pattern
- `.claude/references/tanstack.md` — TanStack Start server function conventions

### New Files to Create

- `src/server/products.ts` — CRUD server functions for products
- `src/server/warehouses.ts` — CRUD server functions for warehouses
- `src/server/suppliers.ts` — CRUD server functions for suppliers
- `src/server/customers.ts` — CRUD server functions for customers

### Patterns to Follow

**Server Function with Middleware + Validator:**

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '#/db'
import { products } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import { createProductSchema } from '#/lib/validators/products'

// List (no input needed)
export const listProducts = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.products.findMany()
  })

// Get by ID (validate id param)
export const getProduct = createServerFn()
  .middleware([requireAuth])
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const product = await db.query.products.findFirst({
      where: eq(products.id, data.id),
    })
    if (!product) throw new Error('Product not found')
    return product
  })

// Create (validate body with Zod schema)
export const createProduct = createServerFn()
  .middleware([requireAuth])
  .validator(createProductSchema)
  .handler(async ({ data }) => {
    const [product] = await db.insert(products).values(data).returning()
    return product
  })

// Update (validate id + partial body)
export const updateProduct = createServerFn()
  .middleware([requireAuth])
  .validator(z.object({ id: z.number().int().positive() }).extend(updateProductSchema.shape))
  .handler(async ({ data }) => {
    const { id, ...values } = data
    const [product] = await db.update(products).set({ ...values, updatedAt: new Date() }).where(eq(products.id, id)).returning()
    if (!product) throw new Error('Product not found')
    return product
  })

// Delete
export const deleteProduct = createServerFn()
  .middleware([requireAuth])
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const [deleted] = await db.delete(products).where(eq(products.id, data.id)).returning()
    if (!deleted) throw new Error('Product not found')
    return deleted
  })
```

**Naming Convention**: `listX`, `getX`, `createX`, `updateX`, `deleteX` — camelCase, entity singular.

**Error Handling**: Throw errors with descriptive messages per CLAUDE.md convention.

**Imports**: Use `#/` path alias. Use `eq`, `like`, `ilike` from `drizzle-orm` for queries.

**GOTCHA — Zod v4**: The existing validators use `z.int().positive()` (Zod v4 syntax), NOT `z.number().int().positive()`. Use `z.int().positive()` for ID validation to stay consistent.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `src/server/products.ts`

- **IMPLEMENT**: 5 server functions: `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`
- **PATTERN**: Follow the pattern above exactly
- **SPECIAL**: `listProducts` should accept an optional `category` filter: `.validator(z.object({ category: z.string().optional() }).optional())` — if category provided, filter with `eq(products.category, data.category)`
- **IMPORTS**: `createServerFn` from `@tanstack/react-start`, `z` from `zod`, `eq` from `drizzle-orm`, `db` from `#/db`, `products` from `#/db/schema`, `requireAuth` from `#/server/middleware`, validators from `#/lib/validators/products`
- **VALIDATE**: `npx tsc --noEmit`

### Task 2: CREATE `src/server/warehouses.ts`

- **IMPLEMENT**: 5 server functions: `listWarehouses`, `getWarehouse`, `createWarehouse`, `updateWarehouse`, `deleteWarehouse`
- **MIRROR**: Same CRUD pattern as products.ts
- **SPECIAL**: `getWarehouse` should include a capacity utilization query — join with `stock` table to sum `currentQuantity` for that warehouse and return it alongside the warehouse data
- **IMPORTS**: Same pattern, swap entity references to `warehouses`, `createWarehouseSchema`, `updateWarehouseSchema`. Also import `stock` from schema and `sum` from `drizzle-orm` for capacity query.
- **VALIDATE**: `npx tsc --noEmit`

### Task 3: CREATE `src/server/suppliers.ts`

- **IMPLEMENT**: 5 server functions: `listSuppliers`, `getSupplier`, `createSupplier`, `updateSupplier`, `deleteSupplier`
- **MIRROR**: Same CRUD pattern as products.ts — straightforward, no special queries
- **IMPORTS**: Same pattern, swap entity references to `suppliers`, `createSupplierSchema`, `updateSupplierSchema`
- **VALIDATE**: `npx tsc --noEmit`

### Task 4: CREATE `src/server/customers.ts`

- **IMPLEMENT**: 5 server functions: `listCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`, `deleteCustomer`
- **MIRROR**: Same CRUD pattern as suppliers.ts (identical table structure)
- **IMPORTS**: Same pattern, swap entity references to `customers`, `createCustomerSchema`, `updateCustomerSchema`
- **VALIDATE**: `npx tsc --noEmit`

### Task 5: Final validation

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

---

## ACCEPTANCE CRITERIA

- [ ] 4 new files created: `src/server/{products,warehouses,suppliers,customers}.ts`
- [ ] Each file exports 5 server functions: list, get, create, update, delete
- [ ] All functions use `requireAuth` middleware
- [ ] All mutating functions validate input with Zod schemas from `src/lib/validators/`
- [ ] Products list supports optional category filter
- [ ] Warehouse get includes capacity utilization (sum of stock quantities)
- [ ] Update functions set `updatedAt: new Date()`
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run check` passes

---

## NOTES

- The update validator approach: merge `{ id }` with the partial update schema using `.extend()`.
- No transactions needed for simple CRUD — reserved for stock-mutating operations (Task 3+).
- Delete operations may fail due to FK constraints (e.g., deleting a product with stock). Let DB constraint errors propagate — don't add soft-delete.
- Zod v4 uses `z.int()` not `z.number().int()` — match existing validator syntax.
- Confidence score: **9/10** — repetitive pattern, low complexity, all dependencies in place.
