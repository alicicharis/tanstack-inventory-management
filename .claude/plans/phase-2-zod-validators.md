# Feature: Zod Validators for All TitanWMS Entities

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Create Zod validation schemas for all domain entities (products, warehouses, suppliers, customers, stock/movements, purchase orders, sales orders). These validators will be used by server functions in later tasks to validate user input at system boundaries.

## User Story

As a developer implementing server functions
I want pre-built Zod schemas for all domain entities
So that I can validate inputs consistently across all server functions

## Problem Statement

Server functions need input validation before database operations. No validators exist yet.

## Solution Statement

Create `src/lib/validators/` with one file per entity domain, each exporting create/update Zod schemas that mirror the DB schema columns (excluding auto-generated fields like id, createdAt, updatedAt).

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: `src/lib/validators/`
**Dependencies**: `zod` (already installed v4.3.6)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — YOU MUST READ THESE BEFORE IMPLEMENTING

- `src/db/schema.ts` (lines 1-399) — Why: All table definitions; validators must mirror these column types/constraints
- `package.json` (line 48) — Why: Confirms zod v4.3.6 installed

### New Files to Create

- `src/lib/validators/products.ts`
- `src/lib/validators/warehouses.ts`
- `src/lib/validators/suppliers.ts`
- `src/lib/validators/customers.ts`
- `src/lib/validators/stock.ts`
- `src/lib/validators/purchase-orders.ts`
- `src/lib/validators/sales-orders.ts`
- `src/lib/validators/index.ts` — barrel export

### Patterns to Follow

**Import Convention:**

```typescript
import { z } from 'zod'
```

**Naming Convention:**

- Create schemas: `create{Entity}Schema` (e.g., `createProductSchema`)
- Update schemas: `update{Entity}Schema` — same as create but all fields optional (`.partial()`)
- Inferred types: `Create{Entity}Input`, `Update{Entity}Input`

**Path Alias:** Use `#/` prefix for imports from `src/` (e.g., `import { ... } from '#/lib/validators'`)

**Schema Design Rules:**

- Only include user-provided fields (exclude `id`, `createdAt`, `updatedAt`, `createdBy`)
- Match DB constraints: `.min(1)` for required text NOT NULL fields, `.int().nonnegative()` for quantities
- Use `z.enum()` for DB enums (match exact values from schema.ts pgEnum definitions)
- `createdBy` is injected by server functions from auth session — never in validator

---

## IMPLEMENTATION PLAN

### Phase 1: Simple Entity Validators (products, warehouses, suppliers, customers)

Create validators for the four CRUD entities. These are straightforward — flat schemas with no nested data.

### Phase 2: Stock & Movement Validators

Transfer and adjustment schemas with enum constraints (movementType, reasonCode).

### Phase 3: Order Validators (PO, SO)

More complex — nested line items using `z.array()`. PO receiving schema with partial quantities.

### Phase 4: Barrel Export

Single `index.ts` re-exporting everything.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `src/lib/validators/products.ts`

```typescript
import { z } from 'zod'

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unitOfMeasure: z.string().min(1).default('each'),
  reorderPoint: z.int().nonnegative().default(0),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 2: CREATE `src/lib/validators/warehouses.ts`

```typescript
import { z } from 'zod'

export const createWarehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  totalCapacity: z.int().positive().optional(),
})

export const updateWarehouseSchema = createWarehouseSchema.partial()

export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 3: CREATE `src/lib/validators/suppliers.ts`

```typescript
import { z } from 'zod'

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const updateSupplierSchema = createSupplierSchema.partial()

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 4: CREATE `src/lib/validators/customers.ts`

Same shape as suppliers (schema.ts lines 192-201 mirrors suppliers).

```typescript
import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 5: CREATE `src/lib/validators/stock.ts`

Transfer needs: productId, fromWarehouseId, toWarehouseId, quantity.
Adjustment needs: productId, warehouseId, quantityChange (can be negative), reasonCode, notes.

```typescript
import { z } from 'zod'

export const transferStockSchema = z.object({
  productId: z.int().positive(),
  fromWarehouseId: z.int().positive(),
  toWarehouseId: z.int().positive(),
  quantity: z.int().positive(),
})

export const adjustStockSchema = z.object({
  productId: z.int().positive(),
  warehouseId: z.int().positive(),
  quantityChange: z.int(),
  reasonCode: z.enum([
    'DAMAGE',
    'SHRINKAGE',
    'CYCLE_COUNT',
    'CORRECTION',
    'OTHER',
  ]),
  notes: z.string().optional(),
})

export type TransferStockInput = z.infer<typeof transferStockSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
```

- **GOTCHA**: `quantityChange` can be negative (for reductions) — do NOT use `.nonnegative()`. But it must not be zero.
- **GOTCHA**: `fromWarehouseId` must differ from `toWarehouseId` — add `.refine()`:
  ```typescript
  transferStockSchema.refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
    message: 'Source and destination warehouses must be different',
  })
  ```
  Actually, apply the refine directly in the schema definition or export the refined version.
- **VALIDATE**: `npx tsc --noEmit`

### Task 6: CREATE `src/lib/validators/purchase-orders.ts`

PO create: supplierId, notes, lines array. Each line: productId, quantityOrdered, warehouseId (optional).
PO receive: lines array with lineId + quantityReceived + warehouseId.

```typescript
import { z } from 'zod'

const purchaseOrderLineSchema = z.object({
  productId: z.int().positive(),
  quantityOrdered: z.int().positive(),
  warehouseId: z.int().positive().optional(),
})

export const createPurchaseOrderSchema = z.object({
  supplierId: z.int().positive(),
  notes: z.string().optional(),
  lines: z.array(purchaseOrderLineSchema).min(1),
})

const receiveLineSchema = z.object({
  lineId: z.int().positive(),
  quantityReceived: z.int().positive(),
  warehouseId: z.int().positive(),
})

export const receivePurchaseOrderSchema = z.object({
  lines: z.array(receiveLineSchema).min(1),
})

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'PARTIALLY_RECEIVED', 'RECEIVED']),
})

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>
export type ReceivePurchaseOrderInput = z.infer<
  typeof receivePurchaseOrderSchema
>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 7: CREATE `src/lib/validators/sales-orders.ts`

SO create: customerId, notes, lines array. Each line: productId, quantity, warehouseId.

```typescript
import { z } from 'zod'

const salesOrderLineSchema = z.object({
  productId: z.int().positive(),
  quantity: z.int().positive(),
  warehouseId: z.int().positive(),
})

export const createSalesOrderSchema = z.object({
  customerId: z.int().positive(),
  notes: z.string().optional(),
  lines: z.array(salesOrderLineSchema).min(1),
})

export const updateSalesOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'SHIPPED']),
})

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>
```

- **VALIDATE**: `npx tsc --noEmit`

### Task 8: CREATE `src/lib/validators/index.ts`

Barrel file re-exporting all validators:

```typescript
export * from './products'
export * from './warehouses'
export * from './suppliers'
export * from './customers'
export * from './stock'
export * from './purchase-orders'
export * from './sales-orders'
```

- **VALIDATE**: `npx tsc --noEmit`

---

## TESTING STRATEGY

### Unit Tests

No unit tests required for this task — validators are pure Zod schemas that will be exercised by server function tests in Tasks 2-4. The TypeScript compiler is the primary validation tool here.

### Validation Approach

Type-check compilation is the acceptance gate. Validators will be integration-tested when server functions use them.

---

## VALIDATION COMMANDS

### Level 1: Type Check

```bash
npx tsc --noEmit
```

### Level 2: Lint & Format

```bash
npm run check
```

### Level 3: Verify Imports Work

```bash
# Quick smoke test — import the barrel and confirm no runtime errors
npx tsx -e "import '#/lib/validators'; console.log('validators OK')"
```

---

## ACCEPTANCE CRITERIA

- [ ] All 7 validator files + 1 index file created in `src/lib/validators/`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run check` (lint + format) passes
- [ ] Create schemas include all user-provided fields matching DB schema
- [ ] Update schemas use `.partial()` on create schemas
- [ ] Enum values exactly match `pgEnum` definitions in `schema.ts`
- [ ] No auto-generated fields (id, createdAt, updatedAt, createdBy) in any validator
- [ ] Order validators include nested line item arrays with `.min(1)`
- [ ] Transfer validator has refinement preventing same source/dest warehouse
- [ ] All types are exported for use by server functions

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run check` passes
- [ ] Barrel export works

---

## NOTES

- **Zod v4**: This project uses Zod v4.3.6. Use `z.int()` (available in v4) instead of `z.number().int()`.
- **No `drizzle-zod`**: We write validators by hand to keep them decoupled from the ORM and to control exactly which fields are exposed at each boundary.
- **`quantityChange` in adjustments**: Intentionally allows negative values (stock reductions). Zero should be disallowed — add `.refine(v => v !== 0, { message: 'Quantity change must not be zero' })`.
