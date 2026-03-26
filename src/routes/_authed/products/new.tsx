import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { createProduct } from '#/server/products'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

export const Route = createFileRoute('/_authed/products/new')({
  component: NewProductPage,
})

function NewProductPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createProduct({
        data: {
          sku: formData.get('sku') as string,
          name: formData.get('name') as string,
          description: (formData.get('description') as string) || undefined,
          category: (formData.get('category') as string) || undefined,
          unitOfMeasure: (formData.get('unitOfMeasure') as string) || 'each',
          reorderPoint: Number(formData.get('reorderPoint')) || 0,
        },
      })
      navigate({ to: '/products' })
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader
        title="New Product"
        description="Add a new product to the catalog"
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
          <Input id="unitOfMeasure" name="unitOfMeasure" defaultValue="each" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorderPoint">Reorder Point</Label>
          <Input
            id="reorderPoint"
            name="reorderPoint"
            type="number"
            min={0}
            defaultValue={0}
          />
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Product'}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  )
}
