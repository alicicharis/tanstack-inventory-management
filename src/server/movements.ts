import { createServerFn } from '@tanstack/react-start'
import { and, eq, gte, lte, sql, count } from 'drizzle-orm'
import { db } from '#/db'
import { stock, movements } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  transferStockSchema,
  adjustStockSchema,
  getMovementsSchema,
} from '#/lib/validators/stock'

export const createTransfer = createServerFn()
  .middleware([requireAuth])
  .inputValidator(transferStockSchema)
  .handler(async ({ data: input, context }) => {
    return db.transaction(async (tx) => {
      // Validate source stock
      const sourceRows = await tx
        .select()
        .from(stock)
        .where(
          and(
            eq(stock.productId, input.productId),
            eq(stock.warehouseId, input.fromWarehouseId),
          ),
        )

      if (
        sourceRows.length === 0 ||
        sourceRows[0].currentQuantity < input.quantity
      ) {
        throw new Error('Insufficient stock at source warehouse')
      }

      // Decrement source
      await tx
        .update(stock)
        .set({
          currentQuantity: sql`"current_quantity" - ${input.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(stock.productId, input.productId),
            eq(stock.warehouseId, input.fromWarehouseId),
          ),
        )

      // Upsert destination
      await tx
        .insert(stock)
        .values({
          productId: input.productId,
          warehouseId: input.toWarehouseId,
          currentQuantity: input.quantity,
        })
        .onConflictDoUpdate({
          target: [stock.productId, stock.warehouseId],
          set: {
            currentQuantity: sql`"current_quantity" + ${input.quantity}`,
            updatedAt: new Date(),
          },
        })

      // Insert movement
      const [movement] = await tx
        .insert(movements)
        .values({
          productId: input.productId,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          quantity: input.quantity,
          type: 'TRANSFER',
          createdBy: context.user.id,
        })
        .returning()

      return movement
    })
  })

export const createAdjustment = createServerFn()
  .middleware([requireAuth])
  .inputValidator(adjustStockSchema)
  .handler(async ({ data: input, context }) => {
    return db.transaction(async (tx) => {
      if (input.quantityChange > 0) {
        // Positive adjustment: upsert stock
        await tx
          .insert(stock)
          .values({
            productId: input.productId,
            warehouseId: input.warehouseId,
            currentQuantity: input.quantityChange,
          })
          .onConflictDoUpdate({
            target: [stock.productId, stock.warehouseId],
            set: {
              currentQuantity: sql`"current_quantity" + ${input.quantityChange}`,
              updatedAt: new Date(),
            },
          })
      } else {
        // Negative adjustment: update existing stock (DB CHECK prevents < 0)
        const result = await tx
          .update(stock)
          .set({
            currentQuantity: sql`"current_quantity" + ${input.quantityChange}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(stock.productId, input.productId),
              eq(stock.warehouseId, input.warehouseId),
            ),
          )
          .returning()

        if (result.length === 0) {
          throw new Error(
            'No stock record found for this product and warehouse',
          )
        }
      }

      // Insert movement
      const absQuantity = Math.abs(input.quantityChange)
      const [movement] = await tx
        .insert(movements)
        .values({
          productId: input.productId,
          fromWarehouseId: input.quantityChange < 0 ? input.warehouseId : null,
          toWarehouseId: input.quantityChange > 0 ? input.warehouseId : null,
          quantity: absQuantity,
          type: 'ADJUSTMENT',
          reasonCode: input.reasonCode,
          notes: input.notes,
          createdBy: context.user.id,
        })
        .returning()

      return movement
    })
  })

export const getMovements = createServerFn()
  .middleware([requireAuth])
  .inputValidator(getMovementsSchema)
  .handler(async ({ data: input }) => {
    const conditions = []

    if (input.productId) {
      conditions.push(eq(movements.productId, input.productId))
    }
    if (input.warehouseId) {
      conditions.push(
        sql`(${movements.fromWarehouseId} = ${input.warehouseId} OR ${movements.toWarehouseId} = ${input.warehouseId})`,
      )
    }
    if (input.type) {
      conditions.push(eq(movements.type, input.type))
    }
    if (input.dateFrom) {
      conditions.push(gte(movements.createdAt, new Date(input.dateFrom)))
    }
    if (input.dateTo) {
      conditions.push(lte(movements.createdAt, new Date(input.dateTo)))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    const offset = (input.page - 1) * input.pageSize

    const [data, [{ total }]] = await Promise.all([
      db.query.movements.findMany({
        where: whereClause,
        with: {
          product: true,
          fromWarehouse: true,
          toWarehouse: true,
          createdByUser: true,
        },
        orderBy: (m, { desc }) => [desc(m.createdAt)],
        limit: input.pageSize,
        offset,
      }),
      db.select({ total: count() }).from(movements).where(whereClause),
    ])

    return { data, total, page: input.page, pageSize: input.pageSize }
  })
