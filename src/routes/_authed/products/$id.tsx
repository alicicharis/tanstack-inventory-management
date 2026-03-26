import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { getProduct, updateProduct, deleteProduct } from '#/server/products'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '#/components/ui/dialog'

export const Route = createFileRoute('/_authed/products/$id')({
  loader: ({ params }) => getProduct({ data: { id: Number(params.id) } }),
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const product = Route.useLoaderData()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    try {
      await updateProduct({
        data: {
          id: product.id,
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

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProduct({ data: { id: product.id } })
      navigate({ to: '/products' })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader
        title="Edit Product"
        description={`${product.sku} — ${product.name}`}
        action={
          <Button variant="outline" asChild>
            <Link to="/products">Back to List</Link>
          </Button>
        }
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required defaultValue={product.sku} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={product.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product.description ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={product.category ?? ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
          <Input
            id="unitOfMeasure"
            name="unitOfMeasure"
            defaultValue={product.unitOfMeasure}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorderPoint">Reorder Point</Label>
          <Input
            id="reorderPoint"
            name="reorderPoint"
            type="number"
            min={0}
            defaultValue={product.reorderPoint}
          />
        </div>
        <div className="flex items-center gap-2 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                />
              }
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{product.name}"? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </main>
  )
}
