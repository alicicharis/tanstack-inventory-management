# Project Brief TitanWMS (Warehouse Management System)

## Architect Goal

The primary goal of this project is to maintain **100% data integrity** across multiple physical locations. Stock levels must never be updated in isolation; every change must be tied to a "Movement Ledger" (Inbound, Outbound, or Internal Transfer).

## Tech Stack

- **Framework:** TanStack Start
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL via Drizzle ORM
- **Styling:** Tailwind CSS + Shadcn/UI
- **Validation:** Zod (for all Schema and API validation)
- **State Management:** Use as much server side as possible, use Tanstack Query (react query) for client side

## Core Data Entities & Relationships

- **Products:** SKU (Unique string), Name, Category, Unit of Measure, Reorder Point.
- **Warehouses:** Name, Location, Total Capacity.
- **Stock (Junction Table):** Connects `Product` + `Warehouse`. Tracks `current_quantity`.
- **Movements (The Ledger):**
  - Fields: `product_id`, `from_warehouse_id` (nullable), `to_warehouse_id` (nullable), `quantity`, `type`.
  - Types: `RECEIVE` (Inbound), `SHIP` (Outbound), `TRANSFER` (Internal), `ADJUSTMENT` (Manual Correction).

## User Journeys

### The Inbound Flow (Receiving)

A user creates a "Purchase Order." When marked as "Received," the system must:

1. Increment the `quantity` in the specific `Stock` record for that Warehouse.
2. Create a `Movement` record of type `RECEIVE`.
3. Wrap both actions in a **Database Transaction**.

### The Internal Transfer

A user moves stock from Warehouse A to Warehouse B. The system must:

1. Check if Warehouse A has sufficient stock.
2. Decrement A, Increment B.
3. Log the `TRANSFER` in the movement ledger.

### The Audit Trail

A Manager views a specific Product. They must see a chronological list of every movement (Inbound, Outbound, Transfer) that resulted in the current stock level.

## Rules of Engagement for the AI Agent

1. **Atomic Operations:** All stock changes **must** use Drizzle `$transaction`. No "loose" updates allowed.
2. **Schema-First:** Propose and finalize the `schema` before generating UI code.
3. **Type Safety:** Ensure all API responses and Server Actions are fully typed.
4. **Error Handling:** Implement graceful error handling for "Out of Stock" or "Warehouse at Capacity" scenarios.

---

### **Action Prompt for Plan Mode:**

"I have provided the Markdown brief for TitanWMS. Please analyze the requirements and start by proposing the **Drizzle Schema** and the **Directory Structure** for this TansStack start project. Do not write UI code yet."
