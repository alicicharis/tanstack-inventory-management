import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '#/server/warehouses'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent } from '#/components/ui/card'

export const Route = createFileRoute('/_authed/warehouses/$id')({
  loader: ({ params }) => getWarehouse({ data: { id: Number(params.id) } }),
  component: WarehouseDetailPage,
})

function WarehouseDetailPage() {
  const warehouse = Route.useLoaderData()
  const navigate = useNavigate()

  const [name, setName] = useState(warehouse.name)
  const [location, setLocation] = useState(warehouse.location ?? '')
  const [totalCapacity, setTotalCapacity] = useState(
    warehouse.totalCapacity != null ? String(warehouse.totalCapacity) : '',
  )
  const [submitting, setSubmitting] = useState(false)

  const utilizationPercent =
    warehouse.totalCapacity && warehouse.totalCapacity > 0
      ? Math.min(
          100,
          Math.round(
            (warehouse.currentUtilization / warehouse.totalCapacity) * 100,
          ),
        )
      : null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updateWarehouse({
        data: {
          id: warehouse.id,
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return
    setSubmitting(true)
    try {
      await deleteWarehouse({ data: { id: warehouse.id } })
      navigate({ to: '/warehouses' })
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-6">
      <PageHeader title={warehouse.name} description="Warehouse details" />

      {utilizationPercent != null && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Capacity Utilization
              </span>
              <span className="font-medium">
                {warehouse.currentUtilization.toLocaleString()} /{' '}
                {warehouse.totalCapacity!.toLocaleString()} (
                {utilizationPercent}%)
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  utilizationPercent >= 90
                    ? 'bg-red-500'
                    : utilizationPercent >= 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
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
                {submitting ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/warehouses' })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={submitting}
                className="ml-auto"
              >
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
