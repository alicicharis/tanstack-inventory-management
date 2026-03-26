import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, sql, sum } from 'drizzle-orm'
import { db } from '#/db'
import { stock, products } from '#/db/schema'
import { requireAuth } from '#/server/middleware'

export const getStockOverview = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.stock.findMany({
      with: { product: true, warehouse: true },
    })
  })

export const getStockByWarehouse = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ warehouseId: z.int().positive() }))
  .handler(async ({ data }) => {
    return db.query.stock.findMany({
      where: eq(stock.warehouseId, data.warehouseId),
      with: { product: true },
    })
  })

export const getStockByProduct = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ productId: z.int().positive() }))
  .handler(async ({ data }) => {
    return db.query.stock.findMany({
      where: eq(stock.productId, data.productId),
      with: { warehouse: true },
    })
  })

export const getLowStockAlerts = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db
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
      .having(sql`SUM(${stock.currentQuantity}) <= ${products.reorderPoint}`)
  })
