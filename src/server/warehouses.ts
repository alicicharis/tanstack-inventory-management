import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, sum } from 'drizzle-orm'
import { db } from '#/db'
import { warehouses, stock } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from '#/lib/validators/warehouses'

export const listWarehouses = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.warehouses.findMany()
  })

export const getWarehouse = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const warehouse = await db.query.warehouses.findFirst({
      where: eq(warehouses.id, data.id),
    })
    if (!warehouse) throw new Error('Warehouse not found')

    const [utilization] = await db
      .select({ totalStock: sum(stock.currentQuantity).mapWith(Number) })
      .from(stock)
      .where(eq(stock.warehouseId, data.id))

    return {
      ...warehouse,
      currentUtilization: utilization.totalStock || 0,
    }
  })

export const createWarehouse = createServerFn()
  .middleware([requireAuth])
  .inputValidator(createWarehouseSchema)
  .handler(async ({ data }) => {
    const [warehouse] = await db.insert(warehouses).values(data).returning()
    return warehouse
  })

export const updateWarehouse = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z.object({ id: z.int().positive() }).extend(updateWarehouseSchema.shape),
  )
  .handler(async ({ data }) => {
    const { id, ...values } = data
    const result = await db
      .update(warehouses)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
      .returning()
    if (result.length === 0) throw new Error('Warehouse not found')
    return result[0]
  })

export const deleteWarehouse = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const result = await db
      .delete(warehouses)
      .where(eq(warehouses.id, data.id))
      .returning()
    if (result.length === 0) throw new Error('Warehouse not found')
    return result[0]
  })
