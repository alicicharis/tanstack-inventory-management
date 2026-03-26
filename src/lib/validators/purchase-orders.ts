import { z } from 'zod'

const purchaseOrderLineSchema = z.object({
  productId: z.int().positive(),
  quantityOrdered: z.int().positive(),
  warehouseId: z.int().positive().optional(),
})

export const createPurchaseOrderSchema = z.object({
  supplierId: z.int().positive(),
  notes: z.string().optional(),
  lines: z.array(purchaseOrderLineSchema).min(1),
})

const receiveLineSchema = z.object({
  lineId: z.int().positive(),
  quantityReceived: z.int().positive(),
  warehouseId: z.int().positive(),
})

export const receivePurchaseOrderSchema = z.object({
  lines: z.array(receiveLineSchema).min(1),
})

export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'PARTIALLY_RECEIVED', 'RECEIVED']),
})

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>
export type ReceivePurchaseOrderInput = z.infer<
  typeof receivePurchaseOrderSchema
>
