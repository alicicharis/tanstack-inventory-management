import { createServerFn } from '@tanstack/react-start'
import { count, eq, gte, sql, sum } from 'drizzle-orm'
import { subDays } from 'date-fns'
import { db } from '#/db'
import { products, warehouses, stock, movements } from '#/db/schema'
import { requireAuth } from '#/server/middleware'

export const getDashboardData = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    const thirtyDaysAgo = subDays(new Date(), 30)

    const [
      [{ totalProducts }],
      [{ totalWarehouses }],
      [{ totalStockUnits }],
      lowStockAlerts,
      stockByWarehouse,
      movementsByType,
      recentMovements,
    ] = await Promise.all([
      // KPI: total products
      db.select({ totalProducts: count() }).from(products),
      // KPI: total warehouses
      db.select({ totalWarehouses: count() }).from(warehouses),
      // KPI: total stock units
      db
        .select({
          totalStockUnits: sum(stock.currentQuantity).mapWith(Number),
        })
        .from(stock),
      // Low stock alerts
      db
        .select({
          productId: stock.productId,
          productName: products.name,
          sku: products.sku,
          reorderPoint: products.reorderPoint,
          totalStock: sum(stock.currentQuantity)
            .mapWith(Number)
            .as('total_stock'),
        })
        .from(stock)
        .innerJoin(products, eq(stock.productId, products.id))
        .groupBy(
          stock.productId,
          products.name,
          products.sku,
          products.reorderPoint,
        )
        .having(sql`SUM(${stock.currentQuantity}) <= ${products.reorderPoint}`),
      // Stock by warehouse (bar chart)
      db
        .select({
          warehouseId: stock.warehouseId,
          warehouseName: warehouses.name,
          totalStock: sum(stock.currentQuantity).mapWith(Number),
        })
        .from(stock)
        .innerJoin(warehouses, eq(stock.warehouseId, warehouses.id))
        .groupBy(stock.warehouseId, warehouses.name),
      // Movement volume by type (last 30 days, line chart)
      db
        .select({
          type: movements.type,
          date: sql<string>`DATE(${movements.createdAt})`.as('date'),
          count: count(),
        })
        .from(movements)
        .where(gte(movements.createdAt, thirtyDaysAgo))
        .groupBy(movements.type, sql`DATE(${movements.createdAt})`)
        .orderBy(sql`DATE(${movements.createdAt})`),
      // Recent movements (last 10)
      db.query.movements.findMany({
        with: {
          product: true,
          fromWarehouse: true,
          toWarehouse: true,
          createdByUser: true,
        },
        orderBy: (m, { desc }) => [desc(m.createdAt)],
        limit: 10,
      }),
    ])

    return {
      kpis: {
        totalProducts,
        totalWarehouses,
        totalStockUnits: totalStockUnits || 0,
        lowStockCount: lowStockAlerts.length,
      },
      stockByWarehouse,
      movementsByType,
      lowStockAlerts,
      recentMovements,
    }
  })
