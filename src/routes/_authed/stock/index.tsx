import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getStockOverview, getLowStockAlerts } from '#/server/stock'
import { listWarehouses } from '#/server/warehouses'
import { PageHeader } from '#/components/page-header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Badge } from '#/components/ui/badge'

export const Route = createFileRoute('/_authed/stock/')({
  loader: async () => {
    const [stockData, warehouses, lowStockAlerts] = await Promise.all([
      getStockOverview(),
      listWarehouses(),
      getLowStockAlerts(),
    ])
    return { stockData, warehouses, lowStockAlerts }
  },
  component: StockOverviewPage,
})

interface StockRow {
  productId: number
  productName: string
  sku: string
  reorderPoint: number
  quantities: Record<number, number>
  totalQuantity: number
}

function buildGrid(
  stockData: Array<{
    currentQuantity: number
    product: { id: number; name: string; sku: string; reorderPoint: number }
    warehouse: { id: number; name: string }
  }>,
): StockRow[] {
  const rowMap = new Map<number, StockRow>()

  for (const entry of stockData) {
    const pid = entry.product.id
    let row = rowMap.get(pid)
    if (!row) {
      row = {
        productId: pid,
        productName: entry.product.name,
        sku: entry.product.sku,
        reorderPoint: entry.product.reorderPoint,
        quantities: {},
        totalQuantity: 0,
      }
      rowMap.set(pid, row)
    }
    row.quantities[entry.warehouse.id] = entry.currentQuantity
    row.totalQuantity += entry.currentQuantity
  }

  return Array.from(rowMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName),
  )
}

function getStockColor(quantity: number, reorderPoint: number): string {
  if (quantity <= reorderPoint) return 'text-red-600 font-semibold'
  if (quantity <= reorderPoint * 2) return 'text-yellow-600 font-semibold'
  return 'text-green-600'
}

function StockOverviewPage() {
  const { stockData, warehouses, lowStockAlerts } = Route.useLoaderData()
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all')

  const filteredStock =
    warehouseFilter === 'all'
      ? stockData
      : stockData.filter((s) => s.warehouse.id === Number(warehouseFilter))

  const grid = buildGrid(filteredStock)

  const displayWarehouses =
    warehouseFilter === 'all'
      ? warehouses
      : warehouses.filter((w) => w.id === Number(warehouseFilter))

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <PageHeader
        title="Stock Overview"
        description="Product quantities across all warehouses"
        action={
          <Select
            value={warehouseFilter}
            onValueChange={(v) => setWarehouseFilter(v ?? 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={String(w.id)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {lowStockAlerts.length > 0 && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <h2 className="mb-2 text-sm font-semibold text-red-800 dark:text-red-200">
            Low Stock Alerts ({lowStockAlerts.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {lowStockAlerts.map((alert) => (
              <Badge key={alert.productId} variant="destructive">
                {alert.sku} — {alert.productName}: {alert.totalStock} /{' '}
                {alert.reorderPoint}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              {displayWarehouses.map((w) => (
                <TableHead key={w.id} className="text-right">
                  {w.name}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Reorder Point</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grid.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={displayWarehouses.length + 4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No stock data found.
                </TableCell>
              </TableRow>
            ) : (
              grid.map((row) => (
                <TableRow key={row.productId}>
                  <TableCell className="font-mono text-sm">{row.sku}</TableCell>
                  <TableCell>{row.productName}</TableCell>
                  {displayWarehouses.map((w) => {
                    const qty = row.quantities[w.id] ?? 0
                    return (
                      <TableCell
                        key={w.id}
                        className={`text-right ${getStockColor(qty, row.reorderPoint)}`}
                      >
                        {qty}
                      </TableCell>
                    )
                  })}
                  <TableCell
                    className={`text-right font-semibold ${getStockColor(row.totalQuantity, row.reorderPoint)}`}
                  >
                    {row.totalQuantity}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.reorderPoint}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
