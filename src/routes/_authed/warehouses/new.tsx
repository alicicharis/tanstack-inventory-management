import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createWarehouse } from '#/server/warehouses'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/_authed/warehouses/new')({
  component: NewWarehousePage,
})

function NewWarehousePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [totalCapacity, setTotalCapacity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createWarehouse({
        data: {
          name,
          location: location || undefined,
          totalCapacity: totalCapacity ? Number(totalCapacity) : undefined,
        },
      })
      navigate({ to: '/warehouses' })
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <PageHeader title="New Warehouse" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCapacity">Total Capacity</Label>
              <Input
                id="totalCapacity"
                type="number"
                min="1"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Warehouse'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/warehouses' })}
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
