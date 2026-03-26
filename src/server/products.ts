import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '#/db'
import { products } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  createProductSchema,
  updateProductSchema,
} from '#/lib/validators/products'

export const listProducts = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ category: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    if (data?.category) {
      return db.query.products.findMany({
        where: eq(products.category, data.category),
      })
    }
    return db.query.products.findMany()
  })

export const getProduct = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const product = await db.query.products.findFirst({
      where: eq(products.id, data.id),
    })
    if (!product) throw new Error('Product not found')
    return product
  })

export const createProduct = createServerFn()
  .middleware([requireAuth])
  .inputValidator(createProductSchema)
  .handler(async ({ data }) => {
    const [product] = await db.insert(products).values(data).returning()
    return product
  })

export const updateProduct = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z.object({ id: z.int().positive() }).extend(updateProductSchema.shape),
  )
  .handler(async ({ data }) => {
    const { id, ...values } = data
    const result = await db
      .update(products)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()
    if (result.length === 0) throw new Error('Product not found')
    return result[0]
  })

export const deleteProduct = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const result = await db
      .delete(products)
      .where(eq(products.id, data.id))
      .returning()
    if (result.length === 0) throw new Error('Product not found')
    return result[0]
  })
