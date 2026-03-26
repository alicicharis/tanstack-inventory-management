import { z } from 'zod'

const salesOrderLineSchema = z.object({
  productId: z.int().positive(),
  quantity: z.int().positive(),
  warehouseId: z.int().positive(),
})

export const createSalesOrderSchema = z.object({
  customerId: z.int().positive(),
  notes: z.string().optional(),
  lines: z.array(salesOrderLineSchema).min(1),
})

export const updateSalesOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'CONFIRMED', 'SHIPPED']),
})

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>
