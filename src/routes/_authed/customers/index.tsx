import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { listCustomers } from '#/server/customers'
import { DataTable  } from '#/components/data-table'
import type {Column} from '#/components/data-table';
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'

interface Customer {
  id: number
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
}

const columns: Column<Customer>[] = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Contact Name', accessorKey: 'contactName' },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Phone', accessorKey: 'phone' },
]

export const Route = createFileRoute('/_authed/customers/')({
  loader: () => listCustomers(),
  component: CustomersPage,
})

function CustomersPage() {
  const customers = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customers"
        action={
          <Button asChild>
            <Link to="/customers/new">Add Customer</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={customers}
        onRowClick={(row) =>
          navigate({ to: '/customers/$id', params: { id: String(row.id) } })
        }
        emptyMessage="No customers found."
      />
    </main>
  )
}
