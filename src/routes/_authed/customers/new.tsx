import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createCustomer } from '#/server/customers'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { Card, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/_authed/customers/new')({
  component: NewCustomerPage,
})

function NewCustomerPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData(e.currentTarget)
      const customer = await createCustomer({
        data: {
          name: form.get('name') as string,
          contactName: (form.get('contactName') as string) || undefined,
          email: (form.get('email') as string) || undefined,
          phone: (form.get('phone') as string) || undefined,
          address: (form.get('address') as string) || undefined,
        },
      })
      navigate({ to: '/customers/$id', params: { id: String(customer.id) } })
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <PageHeader title="New Customer" description="Add a new customer" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" name="contactName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Customer'}
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
