import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { listSuppliers } from '#/server/suppliers'
import { DataTable, type Column } from '#/components/data-table'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'

interface Supplier {
  id: number
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
}

const columns: Column<Supplier>[] = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Contact Name', accessorKey: 'contactName' },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Phone', accessorKey: 'phone' },
]

export const Route = createFileRoute('/_authed/suppliers/')({
  loader: () => listSuppliers(),
  component: SuppliersPage,
})

function SuppliersPage() {
  const suppliers = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your suppliers"
        action={
          <Button asChild>
            <Link to="/suppliers/new">Add Supplier</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={suppliers}
        onRowClick={(row) => navigate({ to: '/suppliers/$id', params: { id: String(row.id) } })}
        emptyMessage="No suppliers found."
      />
    </main>
  )
}
