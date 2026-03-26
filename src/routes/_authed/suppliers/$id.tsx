import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getSupplier,
  updateSupplier,
  deleteSupplier,
} from '#/server/suppliers'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/_authed/suppliers/$id')({
  loader: ({ params }) => getSupplier({ data: { id: Number(params.id) } }),
  component: SupplierDetailPage,
})

function SupplierDetailPage() {
  const supplier = Route.useLoaderData()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      await updateSupplier({
        data: {
          id: supplier.id,
          name: form.get('name') as string,
          contactName: (form.get('contactName') as string) || undefined,
          email: (form.get('email') as string) || undefined,
          phone: (form.get('phone') as string) || undefined,
          address: (form.get('address') as string) || undefined,
        },
      })
      navigate({ to: '/suppliers' })
    } catch {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this supplier?')) return
    setDeleting(true)
    try {
      await deleteSupplier({ data: { id: supplier.id } })
      navigate({ to: '/suppliers' })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <PageHeader
        title="Edit Supplier"
        description={`Editing ${supplier.name}`}
        action={
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={supplier.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={supplier.contactName ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={supplier.email ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={supplier.phone ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={supplier.address ?? ''}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/suppliers' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
