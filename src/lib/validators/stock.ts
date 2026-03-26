import { z } from 'zod'

export const transferStockSchema = z
  .object({
    productId: z.int().positive(),
    fromWarehouseId: z.int().positive(),
    toWarehouseId: z.int().positive(),
    quantity: z.int().positive(),
  })
  .refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
    message: 'Source and destination warehouses must be different',
  })

export const adjustStockSchema = z.object({
  productId: z.int().positive(),
  warehouseId: z.int().positive(),
  quantityChange: z.int().refine((v) => v !== 0, {
    message: 'Quantity change must not be zero',
  }),
  reasonCode: z.enum([
    'DAMAGE',
    'SHRINKAGE',
    'CYCLE_COUNT',
    'CORRECTION',
    'OTHER',
  ]),
  notes: z.string().optional(),
})

export const getMovementsSchema = z.object({
  page: z.int().positive().optional().default(1),
  pageSize: z.int().positive().max(100).optional().default(20),
  productId: z.int().positive().optional(),
  warehouseId: z.int().positive().optional(),
  type: z
    .enum(['RECEIVE', 'SHIP', 'TRANSFER', 'ADJUSTMENT'] as const)
    .optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export type TransferStockInput = z.infer<typeof transferStockSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
export type GetMovementsInput = z.infer<typeof getMovementsSchema>
