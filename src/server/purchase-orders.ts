import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { db } from '#/db'
import {
  purchaseOrders,
  purchaseOrderLines,
  stock,
  movements,
} from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  createPurchaseOrderSchema,
  receivePurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
} from '#/lib/validators/purchase-orders'

export const listPurchaseOrders = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.purchaseOrders.findMany({
      with: {
        supplier: true,
        createdByUser: true,
        lines: { with: { product: true } },
      },
      orderBy: (po, { desc }) => [desc(po.createdAt)],
    })
  })

export const getPurchaseOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const po = await db.query.purchaseOrders.findFirst({
      where: eq(purchaseOrders.id, data.id),
      with: {
        supplier: true,
        createdByUser: true,
        lines: { with: { product: true, warehouse: true } },
      },
    })
    if (!po) throw new Error('Purchase order not found')
    return po
  })

export const createPurchaseOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(createPurchaseOrderSchema)
  .handler(async ({ data: input, context }) => {
    return db.transaction(async (tx) => {
      const [po] = await tx
        .insert(purchaseOrders)
        .values({
          supplierId: input.supplierId,
          notes: input.notes,
          status: 'DRAFT',
          createdBy: context.user.id,
        })
        .returning()

      await tx.insert(purchaseOrderLines).values(
        input.lines.map((line) => ({
          ...line,
          purchaseOrderId: po.id,
        })),
      )

      return db.query.purchaseOrders.findFirst({
        where: eq(purchaseOrders.id, po.id),
        with: {
          supplier: true,
          lines: { with: { product: true } },
        },
      })
    })
  })

export const updatePurchaseOrderStatus = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z
      .object({ id: z.int().positive() })
      .extend(updatePurchaseOrderStatusSchema.shape),
  )
  .handler(async ({ data }) => {
    const { id, status } = data
    const result = await db
      .update(purchaseOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning()
    if (result.length === 0) throw new Error('Purchase order not found')
    return result[0]
  })

export const receivePurchaseOrder = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z
      .object({ id: z.int().positive() })
      .extend(receivePurchaseOrderSchema.shape),
  )
  .handler(async ({ data: input, context }) => {
    return db.transaction(async (tx) => {
      // Fetch PO with lines
      const po = await tx.query.purchaseOrders.findFirst({
        where: eq(purchaseOrders.id, input.id),
        with: { lines: true },
      })
      if (!po) throw new Error('Purchase order not found')
      if (po.status !== 'SUBMITTED' && po.status !== 'PARTIALLY_RECEIVED') {
        throw new Error(
          'Purchase order must be SUBMITTED or PARTIALLY_RECEIVED to receive',
        )
      }

      // Process each receive line
      for (const receiveLine of input.lines) {
        const poLine = po.lines.find((l) => l.id === receiveLine.lineId)
        if (!poLine) {
          throw new Error(`Purchase order line ${receiveLine.lineId} not found`)
        }

        if (
          poLine.quantityReceived + receiveLine.quantityReceived >
          poLine.quantityOrdered
        ) {
          throw new Error(
            `Receiving ${receiveLine.quantityReceived} units would exceed ordered quantity for line ${receiveLine.lineId}`,
          )
        }

        // Upsert stock
        await tx
          .insert(stock)
          .values({
            productId: poLine.productId,
            warehouseId: receiveLine.warehouseId,
            currentQuantity: receiveLine.quantityReceived,
          })
          .onConflictDoUpdate({
            target: [stock.productId, stock.warehouseId],
            set: {
              currentQuantity: sql`"current_quantity" + ${receiveLine.quantityReceived}`,
              updatedAt: new Date(),
            },
          })

        // Update PO line received quantity
        await tx
          .update(purchaseOrderLines)
          .set({
            quantityReceived: sql`"quantity_received" + ${receiveLine.quantityReceived}`,
            warehouseId: receiveLine.warehouseId,
          })
          .where(eq(purchaseOrderLines.id, receiveLine.lineId))

        // Insert RECEIVE movement
        await tx.insert(movements).values({
          productId: poLine.productId,
          toWarehouseId: receiveLine.warehouseId,
          quantity: receiveLine.quantityReceived,
          type: 'RECEIVE',
          referenceType: 'purchase_order',
          referenceId: po.id,
          createdBy: context.user.id,
        })
      }

      // Auto-status update
      const updatedLines = await tx.query.purchaseOrderLines.findMany({
        where: eq(purchaseOrderLines.purchaseOrderId, po.id),
      })

      const allReceived = updatedLines.every(
        (l) => l.quantityReceived >= l.quantityOrdered,
      )
      const newStatus = allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED'

      await tx
        .update(purchaseOrders)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(purchaseOrders.id, po.id))

      return tx.query.purchaseOrders.findFirst({
        where: eq(purchaseOrders.id, po.id),
        with: {
          supplier: true,
          lines: { with: { product: true, warehouse: true } },
        },
      })
    })
  })
