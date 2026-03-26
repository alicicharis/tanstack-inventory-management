# UI Conventions

## Overview

Phase 3 established the CRUD UI patterns used across all entity pages. All pages use shared components (DataTable, PageHeader, StatusBadge, KpiCard) built on Shadcn/UI primitives. Forms use uncontrolled inputs with `FormData` extraction — no react-hook-form.

## Patterns & Conventions

### Route File Structure (CRUD Entity)

Each entity has 3 route files:
- `_authed/{entity}/index.tsx` — List page with DataTable + PageHeader
- `_authed/{entity}/new.tsx` — Create form (no loader needed)
- `_authed/{entity}/$id.tsx` — Edit form + delete with confirmation dialog

### List Page Pattern

```tsx
export const Route = createFileRoute('/_authed/products/')({
  loader: () => listProducts(),
  component: ProductsListPage,
})

function ProductsListPage() {
  const data = Route.useLoaderData()
  const navigate = useNavigate()
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader title="Products" description="..." action={<Button asChild><Link to="/products/new">Add Product</Link></Button>} />
      <div className="mt-6">
        <DataTable columns={columns} data={data} onRowClick={(row) => navigate({ to: '/products/$id', params: { id: String(row.id) } })} />
      </div>
    </main>
  )
}
```

### Form Pattern (Create & Edit)

- **Uncontrolled inputs** with `defaultValue` — no `useState` per field
- **FormData extraction** in `handleSubmit`: `const formData = new FormData(e.currentTarget)`
- **Submitting state** via single `useState(false)` boolean
- **Server fn call**: `await createProduct({ data: { ... } })`
- **Navigation on success**: `navigate({ to: '/products' })`
- **Error handling**: catch block resets submitting state, lets error boundary handle display
- **Layout**: `max-w-2xl` for forms, `max-w-5xl` for lists, `max-w-7xl` for grids (stock)

### Delete Pattern

- Uses Shadcn `Dialog` with `DialogTrigger` wrapping a destructive button
- `DialogTrigger` uses `render` prop: `<DialogTrigger render={<Button type="button" variant="destructive" />}>`
- `DialogClose` also uses `render` prop: `<DialogClose render={<Button variant="outline" />}>`
- Separate `deleting` state boolean

### DataTable Component

Generic component at `src/components/data-table.tsx`:
- `Column<T>` interface: `{ header, accessorKey, cell? }`
- `accessorKey` is typed as `keyof T & string`
- Default cell renders `String(row[accessorKey] ?? '')`
- `onRowClick` adds `cursor-pointer` class
- No built-in sorting or pagination — pages handle that

### Shared Components

| Component | File | Props | Notes |
|-----------|------|-------|-------|
| PageHeader | `src/components/page-header.tsx` | `title, description?, action?` | Flex layout, title left, action right |
| DataTable | `src/components/data-table.tsx` | `columns, data, onRowClick?, emptyMessage?` | Generic `<T>`, wraps Shadcn Table |
| StatusBadge | `src/components/status-badge.tsx` | `status: string` | Maps status to Badge variant, replaces `_` with space |
| KpiCard | `src/components/kpi-card.tsx` | `title, value, description?, icon?` | Uses Shadcn Card with `size="sm"` |

### Authed Layout

- Sidebar nav in `_authed/route.tsx` with `navLinks` array
- Uses TanStack Router `activeProps` for active link styling
- Sidebar hidden on mobile (`hidden md:block`), 56-width (`w-56`)
- Content area wraps `<Outlet />` with `p-6`

### Stock Overview (Grid Pattern)

- Flat stock data pivoted client-side via `buildGrid()` into `StockRow` with `quantities: Record<warehouseId, number>`
- Color-coded cells: red (`<= reorderPoint`), yellow (`<= 2x reorderPoint`), green otherwise
- Warehouse filter is client-side using `Select` component with "all" default
- Low stock alerts shown as destructive `Badge` components in a red-tinted alert box

## Gotchas & Pitfalls

- **Route params are strings** — always `Number(params.id)` when passing to server fns
- **Shadcn Dialog uses `render` prop** for `DialogTrigger` and `DialogClose` — not `asChild` like some versions
- **Server fns in loaders** run on server (SSR); in event handlers they run as RPC — both use `{ data: { ... } }` wrapper
- **`type` imports** — use `import type { Column }` when importing only types from data-table
- **StatusBadge variant mapping** is limited to Shadcn's built-in variants (default, secondary, outline, destructive) — no custom success/warning colors

## Key Files

- `src/components/data-table.tsx` — Reusable generic table, used by all list pages
- `src/components/page-header.tsx` — Consistent page headers across all routes
- `src/components/status-badge.tsx` — Status-to-badge-variant mapping for orders
- `src/components/kpi-card.tsx` — Dashboard metric cards
- `src/routes/_authed/route.tsx` — Auth guard + sidebar nav layout
- `src/routes/_authed/products/` — Template CRUD pattern (copy for new entities)
- `src/routes/_authed/stock/index.tsx` — Grid/pivot pattern for cross-entity views
