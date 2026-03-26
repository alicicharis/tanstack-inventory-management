import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { listProducts } from '#/server/products'
import { PageHeader } from '#/components/page-header'
import { DataTable  } from '#/components/data-table'
import type {Column} from '#/components/data-table';
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_authed/products/')({
  loader: () => listProducts(),
  component: ProductsListPage,
})

interface Product {
  id: number
  sku: string
  name: string
  category: string | null
  unitOfMeasure: string
  reorderPoint: number
}

const columns: Column<Product>[] = [
  { header: 'SKU', accessorKey: 'sku' },
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category' },
  { header: 'Unit of Measure', accessorKey: 'unitOfMeasure' },
  { header: 'Reorder Point', accessorKey: 'reorderPoint' },
]

function ProductsListPage() {
  const products = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button asChild>
            <Link to="/products/new">Add Product</Link>
          </Button>
        }
      />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={products}
          onRowClick={(product) =>
            navigate({
              to: '/products/$id',
              params: { id: String(product.id) },
            })
          }
          emptyMessage="No products found."
        />
      </div>
    </main>
  )
}
