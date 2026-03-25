import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  index,
  unique,
  check,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

// --- Enums ---

export const movementType = pgEnum('movement_type', [
  'RECEIVE',
  'SHIP',
  'TRANSFER',
  'ADJUSTMENT',
])

export const purchaseOrderStatus = pgEnum('purchase_order_status', [
  'DRAFT',
  'SUBMITTED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
])

export const salesOrderStatus = pgEnum('sales_order_status', [
  'DRAFT',
  'CONFIRMED',
  'SHIPPED',
])

export const reasonCode = pgEnum('reason_code', [
  'DAMAGE',
  'SHRINKAGE',
  'CYCLE_COUNT',
  'CORRECTION',
  'OTHER',
])

// --- Better Auth Tables ---

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text(),
  role: text().notNull().default('staff'),
  banned: boolean().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  token: text().notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  impersonatedBy: text('impersonated_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text(),
  idToken: text('id_token'),
  password: text(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// --- Domain Tables ---

export const products = pgTable(
  'products',
  {
    id: serial().primaryKey(),
    sku: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    category: text(),
    unitOfMeasure: text('unit_of_measure').notNull().default('each'),
    reorderPoint: integer('reorder_point').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('products_category_idx').on(t.category)],
)

export const warehouses = pgTable('warehouses', {
  id: serial().primaryKey(),
  name: text().notNull(),
  location: text(),
  totalCapacity: integer('total_capacity'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const stock = pgTable(
  'stock',
  {
    id: serial().primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    warehouseId: integer('warehouse_id')
      .notNull()
      .references(() => warehouses.id),
    currentQuantity: integer('current_quantity').notNull().default(0),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    unique('stock_product_warehouse_uniq').on(t.productId, t.warehouseId),
    check('stock_quantity_non_negative', sql`"current_quantity" >= 0`),
  ],
)

export const movements = pgTable(
  'movements',
  {
    id: serial().primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    fromWarehouseId: integer('from_warehouse_id').references(
      () => warehouses.id,
    ),
    toWarehouseId: integer('to_warehouse_id').references(() => warehouses.id),
    quantity: integer().notNull(),
    type: movementType('type').notNull(),
    referenceType: text('reference_type'),
    referenceId: integer('reference_id'),
    reasonCode: reasonCode('reason_code'),
    notes: text(),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('movements_product_type_created_idx').on(
      t.productId,
      t.type,
      t.createdAt,
    ),
    index('movements_from_warehouse_idx').on(t.fromWarehouseId),
    index('movements_to_warehouse_idx').on(t.toWarehouseId),
  ],
)

export const suppliers = pgTable('suppliers', {
  id: serial().primaryKey(),
  name: text().notNull(),
  contactName: text('contact_name'),
  email: text(),
  phone: text(),
  address: text(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const customers = pgTable('customers', {
  id: serial().primaryKey(),
  name: text().notNull(),
  contactName: text('contact_name'),
  email: text(),
  phone: text(),
  address: text(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const purchaseOrders = pgTable(
  'purchase_orders',
  {
    id: serial().primaryKey(),
    supplierId: integer('supplier_id')
      .notNull()
      .references(() => suppliers.id),
    status: purchaseOrderStatus('status').notNull().default('DRAFT'),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    notes: text(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('purchase_orders_status_idx').on(t.status)],
)

export const purchaseOrderLines = pgTable('purchase_order_lines', {
  id: serial().primaryKey(),
  purchaseOrderId: integer('purchase_order_id')
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantityOrdered: integer('quantity_ordered').notNull(),
  quantityReceived: integer('quantity_received').notNull().default(0),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
})

export const salesOrders = pgTable(
  'sales_orders',
  {
    id: serial().primaryKey(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    status: salesOrderStatus('status').notNull().default('DRAFT'),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    notes: text(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('sales_orders_status_idx').on(t.status)],
)

export const salesOrderLines = pgTable('sales_order_lines', {
  id: serial().primaryKey(),
  salesOrderId: integer('sales_order_id')
    .notNull()
    .references(() => salesOrders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer().notNull(),
  warehouseId: integer('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
})

// --- Relations ---

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  movements: many(movements),
  purchaseOrders: many(purchaseOrders),
  salesOrders: many(salesOrders),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const productsRelations = relations(products, ({ many }) => ({
  stock: many(stock),
  movements: many(movements),
  purchaseOrderLines: many(purchaseOrderLines),
  salesOrderLines: many(salesOrderLines),
}))

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  stock: many(stock),
  movementsFrom: many(movements, { relationName: 'fromWarehouse' }),
  movementsTo: many(movements, { relationName: 'toWarehouse' }),
}))

export const stockRelations = relations(stock, ({ one }) => ({
  product: one(products, {
    fields: [stock.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [stock.warehouseId],
    references: [warehouses.id],
  }),
}))

export const movementsRelations = relations(movements, ({ one }) => ({
  product: one(products, {
    fields: [movements.productId],
    references: [products.id],
  }),
  fromWarehouse: one(warehouses, {
    fields: [movements.fromWarehouseId],
    references: [warehouses.id],
    relationName: 'fromWarehouse',
  }),
  toWarehouse: one(warehouses, {
    fields: [movements.toWarehouseId],
    references: [warehouses.id],
    relationName: 'toWarehouse',
  }),
  createdByUser: one(user, {
    fields: [movements.createdBy],
    references: [user.id],
  }),
}))

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
}))

export const customersRelations = relations(customers, ({ many }) => ({
  salesOrders: many(salesOrders),
}))

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),
    createdByUser: one(user, {
      fields: [purchaseOrders.createdBy],
      references: [user.id],
    }),
    lines: many(purchaseOrderLines),
  }),
)

export const purchaseOrderLinesRelations = relations(
  purchaseOrderLines,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderLines.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    product: one(products, {
      fields: [purchaseOrderLines.productId],
      references: [products.id],
    }),
    warehouse: one(warehouses, {
      fields: [purchaseOrderLines.warehouseId],
      references: [warehouses.id],
    }),
  }),
)

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesOrders.customerId],
    references: [customers.id],
  }),
  createdByUser: one(user, {
    fields: [salesOrders.createdBy],
    references: [user.id],
  }),
  lines: many(salesOrderLines),
}))

export const salesOrderLinesRelations = relations(
  salesOrderLines,
  ({ one }) => ({
    salesOrder: one(salesOrders, {
      fields: [salesOrderLines.salesOrderId],
      references: [salesOrders.id],
    }),
    product: one(products, {
      fields: [salesOrderLines.productId],
      references: [products.id],
    }),
    warehouse: one(warehouses, {
      fields: [salesOrderLines.warehouseId],
      references: [warehouses.id],
    }),
  }),
)
