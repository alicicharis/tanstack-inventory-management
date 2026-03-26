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

export type TransferStockInput = z.infer<typeof transferStockSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
