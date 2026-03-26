# Order Workflows

## Overview

Purchase Orders (inbound) and Sales Orders (outbound) follow distinct workflows reflecting real warehouse operations. POs support partial receiving with auto-status transitions. SOs enforce stock validation on confirm and decrement stock atomically on ship.

## Key Decisions

- **PO warehouse decided at receive time, SO warehouse at creation**: PO lines have nullable `warehouseId` (destination unknown when ordering). SO lines require `warehouseId` (source warehouse must be committed upfront).
  - **Why**: Reflects real warehouse workflows — inbound destination is flexible, outbound source must be known to validate stock.

- **PO supports partial receiving, SO does not support partial shipment**: PO lines track `quantityOrdered` vs `quantityReceived` for incremental fulfillment. SO ships all lines at once.
  - **Why**: Partial receiving is common in real warehouses (supplier sends in batches). Partial shipping adds complexity that wasn't needed for MVP.

- **PO status auto-updates on receive**: Status is calculated from line fulfillment, not set manually. If all lines are fully received → RECEIVED, otherwise → PARTIALLY_RECEIVED.

## Patterns & Conventions

- **PO status flow**: DRAFT → SUBMITTED → PARTIALLY_RECEIVED → RECEIVED
- **SO status flow**: DRAFT → CONFIRMED → SHIPPED
- **Movement references**: Stock movements link back to source orders via `referenceType: 'purchase_order' | 'sales_order'` and `referenceId`.
- **SO confirm is a validation gate**: `confirmSalesOrder` checks stock availability for every line but doesn't decrement. Actual stock decrement happens in `shipSalesOrder`.

## Gotchas & Pitfalls

- **Don't manually set PO status to RECEIVED**: The `receivePurchaseOrder` function calculates it. Manually setting it would desync status from actual line fulfillment.

- **`updateSalesOrderStatus` allows any enum value**: No server-side guard preventing invalid transitions (e.g., SHIPPED → DRAFT). Workflow enforcement relies on using the specific `confirmSalesOrder` and `shipSalesOrder` functions.

- **SO warehouse isolation**: Each SO line specifies a single source warehouse. The system doesn't split lines across warehouses automatically. If a product is in multiple warehouses, create multiple lines or transfer stock first.

## Key Files

- `src/server/purchase-orders.ts` — PO CRUD, `receivePurchaseOrder` with partial receiving and auto-status.
- `src/server/sales-orders.ts` — SO CRUD, `confirmSalesOrder` (stock validation), `shipSalesOrder` (stock decrement).
- `src/lib/validators/purchase-orders.ts` — PO and receive schemas.
- `src/lib/validators/sales-orders.ts` — SO line schemas.
