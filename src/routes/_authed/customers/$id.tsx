import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '#/server/customers'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/_authed/customers/$id')({
  loader: ({ params }) => getCustomer({ data: { id: Number(params.id) } }),
  component: CustomerDetailPage,
})

function CustomerDetailPage() {
  const customer = Route.useLoaderData()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      await updateCustomer({
        data: {
          id: customer.id,
          name: form.get('name') as string,
          contactName: (form.get('contactName') as string) || undefined,
          email: (form.get('email') as string) || undefined,
          phone: (form.get('phone') as string) || undefined,
          address: (form.get('address') as string) || undefined,
        },
      })
      navigate({ to: '/customers' })
    } catch {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    setDeleting(true)
    try {
      await deleteCustomer({ data: { id: customer.id } })
      navigate({ to: '/customers' })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <PageHeader
        title="Edit Customer"
        description={`Editing ${customer.name}`}
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
                defaultValue={customer.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={customer.contactName ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={customer.address ?? ''}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/customers' })}
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
