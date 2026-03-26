import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '#/db'
import { salesOrders, salesOrderLines, stock, movements } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  createSalesOrderSchema,
  updateSalesOrderStatusSchema,
} from '#/lib/validators/sales-orders'

export const listSalesOrders = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.salesOrders.findMany({
      with: {
        customer: true,
        createdByUser: true,
        lines: { with: { product: true, warehouse: true } },
      },
      orderBy: (so, { desc }) => [desc(so.createdAt)],
    })
  })

export const getSalesOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const so = await db.query.salesOrders.findFirst({
      where: eq(salesOrders.id, data.id),
      with: {
        customer: true,
        createdByUser: true,
        lines: { with: { product: true, warehouse: true } },
      },
    })
    if (!so) throw new Error('Sales order not found')
    return so
  })

export const createSalesOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(createSalesOrderSchema)
  .handler(async ({ data: input, context }) => {
    return db.transaction(async (tx) => {
      const [so] = await tx
        .insert(salesOrders)
        .values({
          customerId: input.customerId,
          notes: input.notes,
          status: 'DRAFT',
          createdBy: context.user.id,
        })
        .returning()

      await tx.insert(salesOrderLines).values(
        input.lines.map((line) => ({
          ...line,
          salesOrderId: so.id,
        })),
      )

      return db.query.salesOrders.findFirst({
        where: eq(salesOrders.id, so.id),
        with: {
          customer: true,
          lines: { with: { product: true, warehouse: true } },
        },
      })
    })
  })

export const updateSalesOrderStatus = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z
      .object({ id: z.int().positive() })
      .extend(updateSalesOrderStatusSchema.shape),
  )
  .handler(async ({ data }) => {
    const { id, status } = data
    const result = await db
      .update(salesOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(salesOrders.id, id))
      .returning()
    if (result.length === 0) throw new Error('Sales order not found')
    return result[0]
  })

export const confirmSalesOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    return db.transaction(async (tx) => {
      const so = await tx.query.salesOrders.findFirst({
        where: eq(salesOrders.id, data.id),
        with: { lines: { with: { product: true, warehouse: true } } },
      })
      if (!so) throw new Error('Sales order not found')
      if (so.status !== 'DRAFT') {
        throw new Error('Sales order must be in DRAFT status to confirm')
      }

      // Validate stock for all lines
      for (const line of so.lines) {
        const stockRows = await tx
          .select()
          .from(stock)
          .where(
            and(
              eq(stock.productId, line.productId),
              eq(stock.warehouseId, line.warehouseId),
            ),
          )

        if (
          stockRows.length === 0 ||
          stockRows[0].currentQuantity < line.quantity
        ) {
          throw new Error(
            `Insufficient stock for product ${line.product.name} at warehouse ${line.warehouse.name}`,
          )
        }
      }

      // Update status
      const [updated] = await tx
        .update(salesOrders)
        .set({ status: 'CONFIRMED', updatedAt: new Date() })
        .where(eq(salesOrders.id, data.id))
        .returning()

      return updated
    })
  })

export const shipSalesOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data, context }) => {
    return db.transaction(async (tx) => {
      const so = await tx.query.salesOrders.findFirst({
        where: eq(salesOrders.id, data.id),
        with: { lines: true },
      })
      if (!so) throw new Error('Sales order not found')
      if (so.status !== 'CONFIRMED') {
        throw new Error('Sales order must be CONFIRMED to ship')
      }

      // Decrement stock and create movements for each line
      for (const line of so.lines) {
        await tx
          .update(stock)
          .set({
            currentQuantity: sql`"current_quantity" - ${line.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(stock.productId, line.productId),
              eq(stock.warehouseId, line.warehouseId),
            ),
          )

        await tx.insert(movements).values({
          productId: line.productId,
          fromWarehouseId: line.warehouseId,
          quantity: line.quantity,
          type: 'SHIP',
          referenceType: 'sales_order',
          referenceId: so.id,
          createdBy: context.user.id,
        })
      }

      // Update status
      const [updated] = await tx
        .update(salesOrders)
        .set({ status: 'SHIPPED', updatedAt: new Date() })
        .where(eq(salesOrders.id, data.id))
        .returning()

      return updated
    })
  })
