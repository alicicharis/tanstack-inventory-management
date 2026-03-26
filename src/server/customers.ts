import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '#/db'
import { customers } from '#/db/schema'
import { requireAuth } from '#/server/middleware'
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '#/lib/validators/customers'

export const listCustomers = createServerFn()
  .middleware([requireAuth])
  .handler(async () => {
    return db.query.customers.findMany()
  })

export const getCustomer = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, data.id),
    })
    if (!customer) throw new Error('Customer not found')
    return customer
  })

export const createCustomer = createServerFn()
  .middleware([requireAuth])
  .inputValidator(createCustomerSchema)
  .handler(async ({ data }) => {
    const [customer] = await db.insert(customers).values(data).returning()
    return customer
  })

export const updateCustomer = createServerFn()
  .middleware([requireAuth])
  .inputValidator(
    z.object({ id: z.int().positive() }).extend(updateCustomerSchema.shape),
  )
  .handler(async ({ data }) => {
    const { id, ...values } = data
    const result = await db
      .update(customers)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning()
    if (result.length === 0) throw new Error('Customer not found')
    return result[0]
  })

export const deleteCustomer = createServerFn()
  .middleware([requireAuth])
  .inputValidator(z.object({ id: z.int().positive() }))
  .handler(async ({ data }) => {
    const result = await db
      .delete(customers)
      .where(eq(customers.id, data.id))
      .returning()
    if (result.length === 0) throw new Error('Customer not found')
    return result[0]
  })
