# Phase 2 Breakdown: Server Functions + Validators

## Source

- **PRD**: `.claude/PRD.md`
- **Phase**: 2 — Server Functions + Validators
- **Phase Goal**: Complete business logic layer

## Prerequisites

- Phase 1 complete: full schema in `src/db/schema.ts` (399 lines, all tables/relations/indexes/constraints)
- Auth middleware in `src/server/middleware.ts` (requireAuth, requireAdmin)
- Zod already installed (v4.3.6)
- Missing dependencies: `recharts`, `date-fns` (needed for dashboard)

## Task Dependency Graph

```
Task 1 (install deps + validators)
  |
  +---> Task 2 (simple CRUD: products, warehouses, suppliers, customers)
  |
  +---> Task 3 (stock queries + movements core logic)
  |         |
  |         +---> Task 4 (PO workflow + SO workflow)
  |         |
  |         +---> Task 5 (dashboard aggregation queries)
  |
  (Task 2 and Task 3 can run in parallel after Task 1)
```

## Parallel Groups

- **Group A** (after Task 1): Task 2, Task 3
- **Group B** (after Task 3): Task 4, Task 5

---

## Task 1: Zod Validators for All Entities

**Done when**: All entity validators exist in `src/lib/validators/` and compile without errors
**Complexity**: Low
**Pattern**: Template-first (first validator sets pattern, rest replicate)
**Estimated scope**: ~200 lines across 7 files
**Depends on**: None
**Layer**: Validators

**Deliverables:**

- `src/lib/validators/products.ts` — create/update schemas
- `src/lib/validators/warehouses.ts` — create/update schemas
- `src/lib/validators/suppliers.ts` — create/update schemas
- `src/lib/validators/customers.ts` — create/update schemas
- `src/lib/validators/stock.ts` — transfer/adjustment schemas
- `src/lib/validators/purchase-orders.ts` — create, receive schemas
- `src/lib/validators/sales-orders.ts` — create, confirm, ship schemas

**Plan command**: `/plan-feature Zod validator schemas for all TitanWMS entities (products, warehouses, suppliers, customers, stock/transfer/adjustment, purchase orders, sales orders) in src/lib/validators/`

**Validation**: `npx tsc --noEmit` passes; import all validators in a test file

---

## Task 2: Simple CRUD Server Functions

**Done when**: Products, warehouses, suppliers, and customers have list/get/create/update/delete server functions
**Complexity**: Low
**Pattern**: Repetitive (4 entities, same CRUD pattern)
**Estimated scope**: ~300 lines across 4 files
**Depends on**: Task 1
**Layer**: Server

**Deliverables:**

- `src/server/products.ts` — list (with category filter), getById, create, update, delete
- `src/server/warehouses.ts` — list, getById, create, update, delete (with capacity utilization query)
- `src/server/suppliers.ts` — list, getById, create, update, delete
- `src/server/customers.ts` — list, getById, create, update, delete

**Plan command**: `/plan-feature CRUD server functions for products, warehouses, suppliers, and customers using createServerFn with Zod validation and auth middleware`

**Validation**: Call each server function from a route loader and confirm data returns correctly; test create/update/delete operations

---

## Task 3: Stock Queries + Core Movement Logic

**Done when**: Stock overview queries work, and transfer/adjustment operations create movements atomically
**Complexity**: High
**Pattern**: Unique (transactional logic, capacity checks, stock validation)
**Estimated scope**: ~250 lines across 2 files
**Depends on**: Task 1
**Layer**: Server

**Deliverables:**

- `src/server/stock.ts` — getStockOverview (product x warehouse grid), getStockByWarehouse, getStockByProduct, getLowStockAlerts
- `src/server/movements.ts` — createTransfer (atomic: decrement source + increment dest + log movement), createAdjustment (atomic: update stock + log movement with reason code), getMovements (with filters: date range, type, product, warehouse + pagination)

**Plan command**: `/plan-feature Transactional stock and movement server functions: stock overview queries, atomic transfer with source validation and capacity check, atomic adjustment with reason codes, and paginated movement audit trail`

**Validation**: Create a transfer — verify source decremented, dest incremented, movement logged. Try transfer exceeding stock — verify it fails. Create adjustment — verify stock updated and movement has reason code.

---

## Task 4: Purchase Order + Sales Order Workflow Functions

**Done when**: Full PO receiving workflow and SO confirm/ship workflow operate with correct stock mutations
**Complexity**: High
**Pattern**: Unique (state machines, partial receiving, multi-line transactions)
**Estimated scope**: ~300 lines across 2 files
**Depends on**: Task 3 (reuses movement/stock patterns)
**Layer**: Server

**Deliverables:**

- `src/server/purchase-orders.ts` — createPO (with lines), getPO, listPOs, updatePOStatus, receivePO (partial receiving: per-line qty + warehouse, atomic: update stock + create RECEIVE movements + update line received qty + auto-status update)
- `src/server/sales-orders.ts` — createSO (with lines), getSO, listSOs, confirmSO (validate stock across all lines), shipSO (atomic: decrement stock per line + create SHIP movements + update status)

**Plan command**: `/plan-feature Purchase Order and Sales Order workflow server functions: PO create with lines, partial receiving with atomic stock updates and auto-status progression; SO create with lines, confirm with stock validation, ship with atomic stock decrement and movement logging`

**Validation**: Create a PO, partially receive it — verify status moves to PARTIALLY_RECEIVED, stock incremented, RECEIVE movement logged. Receive remaining — verify RECEIVED status. Create SO, confirm, ship — verify stock decremented and SHIP movements created.

---

## Task 5: Dashboard Aggregation Queries

**Done when**: Dashboard server function returns KPIs, chart data, low stock alerts, and recent movements
**Complexity**: Medium
**Pattern**: Unique (aggregation queries)
**Estimated scope**: ~120 lines in 1 file
**Depends on**: Task 3 (uses stock and movement queries)
**Layer**: Server

**Deliverables:**

- `src/server/dashboard.ts` — getDashboardData: KPI cards (total products, warehouses, stock units, low stock count), stock by warehouse (for bar chart), movement volume by type over last 30 days (for line chart), low stock alerts table, recent movements (last 10)

**Also**: Install `recharts` and `date-fns` (needed by dashboard and movement date filtering)

**Plan command**: `/plan-feature Dashboard aggregation server function returning KPI counts, stock-by-warehouse chart data, 30-day movement volume by type, low stock alerts, and recent movements — plus install recharts and date-fns`

**Validation**: Call getDashboardData after seeding — verify all data sections populated with correct counts

---

## Summary

| #   | Task                                                               | Complexity | Depends On | Layer      | Est. Lines |
| --- | ------------------------------------------------------------------ | ---------- | ---------- | ---------- | ---------- |
| 1   | Zod validators for all entities                                    | Low        | None       | Validators | ~200       |
| 2   | CRUD server functions (products, warehouses, suppliers, customers) | Low        | 1          | Server     | ~300       |
| 3   | Stock queries + movement logic (transfer, adjust)                  | High       | 1          | Server     | ~250       |
| 4   | PO + SO workflow functions                                         | High       | 3          | Server     | ~300       |
| 5   | Dashboard aggregation queries                                      | Medium     | 3          | Server     | ~120       |

**Total tasks**: 5
**Critical path**: Task 1 -> Task 3 -> Task 4 (longest chain)
**Parallel opportunities**: Tasks 2+3 after Task 1; Tasks 4+5 after Task 3
**Estimated confidence for one-pass execution**: 8/10 per task (with `/plan-feature` planning each)
