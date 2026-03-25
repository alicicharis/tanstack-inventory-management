# TitanWMS — Product Requirements Document

## 1. Executive Summary

TitanWMS is a web-based Warehouse Management System designed to maintain **100% data integrity** across multiple physical warehouse locations. The system enforces that every stock change is tied to an immutable Movement Ledger entry (Inbound, Outbound, Transfer, or Adjustment), wrapped in atomic database transactions.

The core value proposition is a reliable, auditable inventory system where stock levels can never drift from reality — every unit is accounted for by a traceable movement. The system supports full Purchase Order and Sales Order workflows, inter-warehouse transfers, manual adjustments with reason codes, and role-based access control.

The MVP goal is a fully functional WMS with complete data integrity guarantees, rich dashboard analytics, and comprehensive CRUD operations for all entities — ready for demo and real-world use.

## 2. Mission

**Mission Statement:** Provide a warehouse management system where stock data integrity is guaranteed by design, not by discipline.

**Core Principles:**

1. **Ledger-First** — No stock change without a corresponding movement record
2. **Atomic Operations** — All stock mutations wrapped in database transactions
3. **Schema-First** — Database constraints (CHECK, FK, UNIQUE) as the last line of defense
4. **Auditability** — Every change is traceable to a user, timestamp, and source document
5. **Simplicity** — Minimal complexity for maximum reliability

## 3. Target Users

**Primary Personas:**

- **Warehouse Manager (Admin):** Oversees inventory across all locations, manages products/warehouses/suppliers/customers, reviews audit trails, monitors KPIs. Technically comfortable with business software.
- **Warehouse Staff:** Performs day-to-day operations — receiving shipments, picking/shipping orders, transferring stock between locations, making inventory adjustments. Needs a fast, intuitive interface.

**Key Needs:**

- Real-time stock visibility across all warehouses
- Confidence that stock numbers are accurate
- Quick receiving and shipping workflows
- Ability to trace any discrepancy back to its source

## 4. MVP Scope

### In Scope

- ✅ Product management (SKU, name, category, UOM, reorder point)
- ✅ Warehouse management with enforced capacity limits
- ✅ Stock tracking (product × warehouse junction table with CHECK >= 0)
- ✅ Movement ledger (RECEIVE, SHIP, TRANSFER, ADJUSTMENT)
- ✅ Purchase Orders with partial receiving (Draft → Submitted → Partially Received → Received)
- ✅ Sales Orders (Draft → Confirmed → Shipped)
- ✅ Supplier and Customer management
- ✅ Inter-warehouse transfers with source stock validation
- ✅ Manual adjustments with reason codes (DAMAGE, SHRINKAGE, CYCLE_COUNT, CORRECTION, OTHER)
- ✅ Role-based access (Admin + Staff)
- ✅ Rich dashboard with KPI cards, charts, low stock alerts
- ✅ Full movement audit trail with filters and pagination
- ✅ Comprehensive seed data for demo

### Out of Scope

- ❌ Inventory valuation / cost tracking (FIFO, LIFO, WAC)
- ❌ Multiple units of measure with conversions
- ❌ Bin/location-level tracking within warehouses
- ❌ Lot/batch/serial number tracking
- ❌ Barcode/RFID scanning
- ❌ Pick/pack workflow (shipping is single-step)
- ❌ Email notifications / alerts
- ❌ Multi-tenant support
- ❌ Mobile-optimized interface
- ❌ API for external integrations
- ❌ Reporting exports (CSV/PDF)

## 5. User Stories

1. **As a Warehouse Manager**, I want to view a dashboard with KPI cards and charts, so that I can monitor inventory health at a glance.

2. **As a Warehouse Manager**, I want to see all products below their reorder point, so that I can initiate restocking before stockouts occur.

3. **As a Warehouse Staff member**, I want to receive a Purchase Order (fully or partially) into a specific warehouse, so that stock levels are automatically updated with a traceable movement record.

4. **As a Warehouse Staff member**, I want to transfer stock from one warehouse to another, so that inventory is balanced across locations — with the system preventing transfers that would result in negative stock.

5. **As a Warehouse Staff member**, I want to confirm and ship a Sales Order, so that stock is decremented from the correct warehouses and a SHIP movement is logged.

6. **As a Warehouse Manager**, I want to view the complete movement history for any product, so that I can trace exactly how the current stock level was reached.

7. **As a Warehouse Manager**, I want to make inventory adjustments with a reason code, so that discrepancies from cycle counts or damage are documented.

8. **As a Warehouse Manager**, I want the system to block receiving into a warehouse that would exceed its capacity, so that physical space constraints are respected.

## 6. Core Architecture & Patterns

### High-Level Architecture

- **Full-stack SSR** via TanStack Start with server functions
- **Server-first data fetching** via route loaders calling server functions
- **Client mutations** via TanStack Query (React Query) wrapping server function calls
- **Database transactions** for all stock-mutating operations via Drizzle ORM

### Directory Structure

```
src/
├── db/
│   ├── schema.ts           # All Drizzle table definitions, relations, indexes
│   ├── index.ts            # DB connection
│   └── seed.ts             # Comprehensive seed script
├── lib/
│   ├── auth.ts             # Better Auth server config (extended with roles)
│   ├── auth-client.ts      # Better Auth client
│   └── validators/         # Zod schemas per entity
├── server/                 # Server functions (createServerFn)
│   ├── middleware.ts        # requireAuth(), requireAdmin()
│   ├── products.ts
│   ├── warehouses.ts
│   ├── stock.ts
│   ├── movements.ts        # Core transactional stock logic
│   ├── suppliers.ts
│   ├── customers.ts
│   ├── purchase-orders.ts
│   ├── sales-orders.ts
│   └── dashboard.ts
├── components/
│   ├── ui/                 # Shadcn/UI components
│   ├── data-table.tsx      # Reusable table component
│   ├── page-header.tsx
│   ├── kpi-card.tsx
│   └── status-badge.tsx
├── routes/
│   ├── __root.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── _authed.tsx         # Auth guard layout
│   └── _authed/
│       ├── index.tsx        # Dashboard
│       ├── products/
│       ├── warehouses/
│       ├── stock/
│       ├── suppliers/
│       ├── customers/
│       ├── purchase-orders/
│       ├── sales-orders/
│       ├── movements/
│       └── settings/
```

### Key Design Patterns

- **Ledger pattern**: Movements are append-only; corrections are new ADJUSTMENT entries, never edits
- **Transactional mutations**: Every stock change is a Drizzle `db.transaction()` that updates stock + inserts movement atomically
- **Validator reuse**: Same Zod schemas used on client (forms) and server (validation)
- **Route loaders**: Data fetched server-side in `Route.loader` for SSR
- **Optimistic UI**: TanStack Query mutations with optimistic updates where appropriate

## 7. Features

### Products Management

- CRUD with SKU uniqueness enforcement
- Category and UOM fields
- Reorder point configuration
- Search and filter by category

### Warehouse Management

- CRUD with capacity definition
- Capacity utilization display (current stock sum vs. total capacity)
- Enforced capacity check on all inbound movements

### Stock Overview

- Product × Warehouse grid view
- Color-coded: red (below reorder point), yellow (approaching)
- Filter by warehouse and category

### Purchase Order Workflow

- Create PO with supplier and line items (product + quantity)
- Status progression: Draft → Submitted → Partially Received → Received
- Partial receiving: per-line quantity input with warehouse selection
- Auto-status update based on line fulfillment

### Sales Order Workflow

- Create SO with customer and line items (product + quantity + source warehouse)
- Confirm: validates sufficient stock across all lines
- Ship: creates SHIP movements for all lines, decrements stock, updates status

### Transfers

- Select product, source warehouse, destination warehouse, quantity
- Displays current stock at source for validation
- Atomic: decrement source + increment destination + log movement

### Adjustments

- Select product, warehouse, quantity delta (+/-)
- Required reason code: DAMAGE, SHRINKAGE, CYCLE_COUNT, CORRECTION, OTHER
- Optional notes field
- Creates ADJUSTMENT movement

### Movement Audit Trail

- Chronological list of all movements
- Filters: date range, movement type, product, warehouse
- Pagination for large datasets
- Links to source documents (PO/SO)

### Dashboard

- KPI cards: total products, warehouses, stock units, low stock alert count
- Bar chart: stock quantity by warehouse
- Line chart: movement volume by type over last 30 days
- Low stock alerts table
- Recent movements table (last 10)

## 8. Technology Stack

| Layer         | Technology               | Version |
| ------------- | ------------------------ | ------- |
| Framework     | TanStack Start           | Latest  |
| Language      | TypeScript (Strict)      | 5.7.2   |
| Runtime       | React                    | 19.2.0  |
| Database      | PostgreSQL               | —       |
| ORM           | Drizzle ORM              | 0.45.1  |
| Styling       | Tailwind CSS             | 4.1.18  |
| UI Components | Shadcn/UI                | Latest  |
| Validation    | Zod                      | Latest  |
| Auth          | Better Auth              | 1.5.3   |
| Charts        | Recharts                 | Latest  |
| Icons         | Lucide React             | 0.545.0 |
| Date Utils    | date-fns                 | Latest  |
| Build         | Vite                     | 7.3.1   |
| Testing       | Vitest + Testing Library | —       |

### Dependencies to Add

```
npm add recharts date-fns
```

## 9. Security & Configuration

### Authentication

- Better Auth with email/password login
- Session-based authentication
- Auth API route: `/api/auth/*`

### Authorization

- Two roles: `admin` and `staff` (stored on user record)
- **Admin**: full CRUD on all entities, user management, settings
- **Staff**: create/view POs, SOs, transfers, adjustments; view products/warehouses/stock
- Role enforcement via `requireAuth()` and `requireAdmin()` middleware on server functions
- Route-level auth guard via `_authed.tsx` layout route

### Configuration

- `DATABASE_URL` — PostgreSQL connection string
- Better Auth config in `src/lib/auth.ts`
- Drizzle config in `drizzle.config.ts`

### Security Measures

- All mutations validated server-side with Zod
- Database CHECK constraint prevents negative stock
- Foreign key constraints ensure referential integrity
- Transactions prevent partial state updates
- No direct SQL — all queries through Drizzle ORM

## 10. Database Schema

### Tables & Relationships

```
products (1) ←→ (N) stock ←→ (1) warehouses
products (1) ←→ (N) purchase_order_lines ←→ (1) purchase_orders ←→ (1) suppliers
products (1) ←→ (N) sales_order_lines ←→ (1) sales_orders ←→ (1) customers
products (1) ←→ (N) movements
warehouses (1) ←→ (N) movements (from/to)
user (1) ←→ (N) movements
user (1) ←→ (N) purchase_orders (created_by)
user (1) ←→ (N) sales_orders (created_by)
```

### Key Constraints

- `stock.current_quantity CHECK (>= 0)`
- `products.sku UNIQUE`
- `stock (product_id, warehouse_id) UNIQUE` composite key
- All foreign keys with appropriate cascade behavior

### Indexes

- `movements(product_id, type, created_at)` — audit trail queries
- `movements(from_warehouse_id)`, `movements(to_warehouse_id)` — warehouse movement lookups
- `purchase_orders(status)`, `sales_orders(status)` — status-filtered lists
- `products(sku)`, `products(category)` — search and filter

## 11. Success Criteria

### MVP Success Definition

A fully functional WMS where a user can complete all core workflows end-to-end with guaranteed data integrity.

### Functional Requirements

- ✅ All stock changes produce a movement record within a transaction
- ✅ Stock can never go negative (DB constraint enforced)
- ✅ Warehouse capacity is enforced on inbound movements
- ✅ POs can be partially received with accurate status tracking
- ✅ Sales Orders validate stock before confirmation and decrement on shipment
- ✅ Transfers atomically update both source and destination
- ✅ Adjustments require a reason code
- ✅ Dashboard displays real-time KPIs and charts
- ✅ Movement audit trail is complete and filterable
- ✅ Admin and Staff roles are enforced

### Quality Indicators

- Zero data integrity violations under concurrent operations
- All server functions fully typed end-to-end
- Zod validation on every input boundary
- Seed data demonstrates all workflows

## 12. Implementation Phases

### Phase 1: Foundation (Schema + Auth)

**Goal:** Establish the data layer and authentication

- ✅ Drizzle schema with all tables, relations, indexes, constraints
- ✅ Run migrations
- ✅ Extend Better Auth with role field
- ✅ Auth middleware (requireAuth, requireAdmin)
- ✅ Login/Register pages
- ✅ Auth guard layout route
- **Validation:** `npm db:push` succeeds, login/register works, roles stored

### Phase 2: Server Functions + Validators

**Goal:** Complete business logic layer

- ✅ Zod validators for all entities
- ✅ CRUD server functions for products, warehouses, suppliers, customers
- ✅ Transactional stock operations (receive, ship, transfer, adjust)
- ✅ PO and SO workflow functions
- ✅ Dashboard aggregation queries
- **Validation:** Server functions callable from route loaders, transactions enforce integrity

### Phase 3: Core UI

**Goal:** CRUD pages for all entities + stock overview

- ✅ Install Shadcn components
- ✅ Shared components (data-table, page-header, status-badge, kpi-card)
- ✅ Products, Warehouses, Suppliers, Customers CRUD pages
- ✅ Stock overview page
- **Validation:** Can create/edit/view all entities through the UI

### Phase 4: Workflows + Dashboard + Seed

**Goal:** Complete the application

- ✅ PO workflow pages (create, view, receive)
- ✅ SO workflow pages (create, confirm, ship)
- ✅ Transfer and Adjustment pages
- ✅ Movement audit trail page
- ✅ Rich dashboard with charts
- ✅ Comprehensive seed data
- **Validation:** Full end-to-end workflows work, dashboard populated with seed data

## 13. Future Considerations

- **Inventory valuation** (FIFO/weighted average cost tracking)
- **Bin-level tracking** within warehouses
- **Lot/batch/serial number tracking** for regulated industries
- **Barcode/RFID scanning** integration
- **Pick/pack workflow** for multi-step order fulfillment
- **Email/push notifications** for low stock and order status changes
- **CSV/PDF export** for reports
- **Mobile-responsive** warehouse floor interface
- **REST/GraphQL API** for external system integration
- **Multi-tenant** support for SaaS deployment
- **Cycle counting** workflows with variance reconciliation
- **Dynamic safety stock** based on demand patterns

## 14. Risks & Mitigations

| Risk                                                  | Impact                         | Mitigation                                                                            |
| ----------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Concurrent stock updates cause race conditions        | Data integrity violation       | DB CHECK constraint as safety net + transactions with appropriate isolation level     |
| Large movement tables degrade query performance       | Slow audit trail and dashboard | Composite indexes on (product_id, type, created_at), cursor-based pagination          |
| Better Auth role extension complexity                 | Auth delays                    | Role stored as simple field on user table, not a complex RBAC system                  |
| Shadcn/UI component compatibility with TanStack Start | UI development blocked         | Shadcn components are framework-agnostic React; fallback to raw Tailwind if needed    |
| Seed data doesn't reflect realistic scenarios         | Poor demo experience           | Model seed data on real warehouse workflows with varied statuses and movement history |

## 15. Appendix

### Key Files

- `src/db/schema.ts` — All table definitions (most critical file)
- `src/server/movements.ts` — Core transactional stock logic
- `src/routes/_authed.tsx` — Auth guard layout route
- `drizzle.config.ts` — Database configuration
- `src/lib/auth.ts` — Better Auth server configuration

### Existing Infrastructure

- TanStack Start + Vite configured and running
- Better Auth integrated with API route at `/api/auth/*`
- Drizzle ORM connected to PostgreSQL via `DATABASE_URL`
- Tailwind CSS v4 with Vite plugin
- TypeScript strict mode enabled
- Path aliases: `@/*` and `#/*` → `./src/*`
