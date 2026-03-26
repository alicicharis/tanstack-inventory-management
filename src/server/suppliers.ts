import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '#/db'
import { suppliers } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  createSupplierSchema,
  updateSupplierSchema,
} from '#/lib/validators/suppliers'

export const listSuppliers = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.suppliers.findMany()
  })

export const getSupplier = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, data.id),
    })
    if (!supplier) throw new Error('Supplier not found')
    return supplier
  })

export const createSupplier = createServerFn()
  .middleware([requireAuth])
  .inputValidator(createSupplierSchema)
  .handler(async ({ data }) => {
    const [supplier] = await db.insert(suppliers).values(data).returning()
    return supplier
  })

export const updateSupplier = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z.object({ id: z.int().positive() }).extend(updateSupplierSchema.shape),
  )
  .handler(async ({ data }) => {
    const { id, ...values } = data
    const result = await db
      .update(suppliers)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning()
    if (result.length === 0) throw new Error('Supplier not found')
    return result[0]
  })

export const deleteSupplier = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const result = await db
      .delete(suppliers)
      .where(eq(suppliers.id, data.id))
      .returning()
    if (result.length === 0) throw new Error('Supplier not found')
    return result[0]
  })
