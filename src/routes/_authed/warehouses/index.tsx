import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { listWarehouses } from '#/server/warehouses'
import { PageHeader } from '#/components/page-header'
import { DataTable, type Column } from '#/components/data-table'
import { Button } from '#/components/ui/button'

interface WarehouseRow {
  id: number
  name: string
  location: string | null
  totalCapacity: number | null
}

const columns: Column<WarehouseRow>[] = [
  { header: 'Name', accessorKey: 'name' },
  {
    header: 'Location',
    accessorKey: 'location',
    cell: (row) => row.location ?? '—',
  },
  {
    header: 'Total Capacity',
    accessorKey: 'totalCapacity',
    cell: (row) =>
      row.totalCapacity != null ? row.totalCapacity.toLocaleString() : '—',
  },
]

export const Route = createFileRoute('/_authed/warehouses/')({
  loader: () => listWarehouses(),
  component: WarehousesListPage,
})

function WarehousesListPage() {
  const warehouses = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 space-y-6">
      <PageHeader
        title="Warehouses"
        action={
          <Button asChild>
            <Link to="/warehouses/new">Add Warehouse</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={warehouses}
        onRowClick={(row) => navigate({ to: '/warehouses/$id', params: { id: String(row.id) } })}
        emptyMessage="No warehouses found."
      />
    </main>
  )
}
