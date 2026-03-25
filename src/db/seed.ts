import 'dotenv/config'
import { db } from '#/db'
import { auth } from '#/lib/auth'
import {
  warehouses,
  products,
  suppliers,
  customers,
  stock,
  movements,
  purchaseOrders,
  purchaseOrderLines,
  salesOrders,
  salesOrderLines,
} from '#/db/schema'

async function seed() {
  console.log('Seeding database...')

  // Create users via Better Auth (handles password hashing)
  const adminUser = await auth.api.signUpEmail({
    body: {
      name: 'Admin User',
      email: 'admin@titanwms.com',
      password: 'admin123456',
    },
  })

  // Set admin role directly
  await db
    .update((await import('#/db/schema')).user)
    .set({ role: 'admin' })
    .where(
      (await import('drizzle-orm')).eq(
        (await import('#/db/schema')).user.id,
        adminUser.user.id,
      ),
    )

  const staffUser = await auth.api.signUpEmail({
    body: {
      name: 'Staff User',
      email: 'staff@titanwms.com',
      password: 'staff123456',
    },
  })

  console.log('Users created')

  // Warehouses
  const [wh1, wh2, wh3] = await db
    .insert(warehouses)
    .values([
      { name: 'Main Warehouse', location: 'Building A', totalCapacity: 10000 },
      {
        name: 'Secondary Warehouse',
        location: 'Building B',
        totalCapacity: 5000,
      },
      { name: 'Cold Storage', location: 'Building C', totalCapacity: 2000 },
    ])
    .returning()

  console.log('Warehouses created')

  // Products
  const insertedProducts = await db
    .insert(products)
    .values([
      {
        sku: 'WDG-001',
        name: 'Steel Widget',
        category: 'Hardware',
        unitOfMeasure: 'each',
        reorderPoint: 50,
      },
      {
        sku: 'WDG-002',
        name: 'Copper Widget',
        category: 'Hardware',
        unitOfMeasure: 'each',
        reorderPoint: 30,
      },
      {
        sku: 'BLT-001',
        name: 'M8 Bolt',
        category: 'Fasteners',
        unitOfMeasure: 'box',
        reorderPoint: 100,
      },
      {
        sku: 'BLT-002',
        name: 'M10 Bolt',
        category: 'Fasteners',
        unitOfMeasure: 'box',
        reorderPoint: 80,
      },
      {
        sku: 'NUT-001',
        name: 'M8 Nut',
        category: 'Fasteners',
        unitOfMeasure: 'box',
        reorderPoint: 100,
      },
      {
        sku: 'PIP-001',
        name: 'PVC Pipe 2in',
        category: 'Plumbing',
        unitOfMeasure: 'meter',
        reorderPoint: 200,
      },
      {
        sku: 'PIP-002',
        name: 'Copper Pipe 1in',
        category: 'Plumbing',
        unitOfMeasure: 'meter',
        reorderPoint: 150,
      },
      {
        sku: 'ELC-001',
        name: 'LED Panel Light',
        category: 'Electrical',
        unitOfMeasure: 'each',
        reorderPoint: 25,
      },
      {
        sku: 'ELC-002',
        name: '14 AWG Wire',
        category: 'Electrical',
        unitOfMeasure: 'meter',
        reorderPoint: 500,
      },
      {
        sku: 'SAF-001',
        name: 'Safety Helmet',
        category: 'Safety',
        unitOfMeasure: 'each',
        reorderPoint: 20,
      },
      {
        sku: 'SAF-002',
        name: 'Work Gloves',
        category: 'Safety',
        unitOfMeasure: 'pair',
        reorderPoint: 40,
      },
      {
        sku: 'TLS-001',
        name: 'Power Drill',
        category: 'Tools',
        unitOfMeasure: 'each',
        reorderPoint: 5,
      },
    ])
    .returning()

  console.log('Products created')

  // Suppliers
  const [sup1, sup2, sup3] = await db
    .insert(suppliers)
    .values([
      {
        name: 'Global Parts Co.',
        contactName: 'John Smith',
        email: 'john@globalparts.com',
        phone: '555-0101',
      },
      {
        name: 'FastFix Supplies',
        contactName: 'Jane Doe',
        email: 'jane@fastfix.com',
        phone: '555-0102',
      },
      {
        name: 'SafetyFirst Inc.',
        contactName: 'Bob Wilson',
        email: 'bob@safetyfirst.com',
        phone: '555-0103',
      },
    ])
    .returning()

  console.log('Suppliers created')

  // Customers
  const [cust1, cust2, cust3] = await db
    .insert(customers)
    .values([
      {
        name: 'BuildRight Construction',
        contactName: 'Alice Brown',
        email: 'alice@buildright.com',
        phone: '555-0201',
      },
      {
        name: 'HomeServ Plumbing',
        contactName: 'Charlie Green',
        email: 'charlie@homeserv.com',
        phone: '555-0202',
      },
      {
        name: 'ElectroPro Services',
        contactName: 'Diana Lee',
        email: 'diana@electropro.com',
        phone: '555-0203',
      },
    ])
    .returning()

  console.log('Customers created')

  // Stock records
  await db.insert(stock).values([
    {
      productId: insertedProducts[0].id,
      warehouseId: wh1.id,
      currentQuantity: 200,
    },
    {
      productId: insertedProducts[1].id,
      warehouseId: wh1.id,
      currentQuantity: 150,
    },
    {
      productId: insertedProducts[2].id,
      warehouseId: wh1.id,
      currentQuantity: 500,
    },
    {
      productId: insertedProducts[3].id,
      warehouseId: wh1.id,
      currentQuantity: 300,
    },
    {
      productId: insertedProducts[4].id,
      warehouseId: wh2.id,
      currentQuantity: 400,
    },
    {
      productId: insertedProducts[5].id,
      warehouseId: wh2.id,
      currentQuantity: 1000,
    },
    {
      productId: insertedProducts[6].id,
      warehouseId: wh2.id,
      currentQuantity: 800,
    },
    {
      productId: insertedProducts[7].id,
      warehouseId: wh3.id,
      currentQuantity: 50,
    },
    {
      productId: insertedProducts[8].id,
      warehouseId: wh1.id,
      currentQuantity: 2000,
    },
    {
      productId: insertedProducts[9].id,
      warehouseId: wh1.id,
      currentQuantity: 75,
    },
    {
      productId: insertedProducts[10].id,
      warehouseId: wh1.id,
      currentQuantity: 120,
    },
    {
      productId: insertedProducts[11].id,
      warehouseId: wh2.id,
      currentQuantity: 15,
    },
  ])

  console.log('Stock records created')

  // Movements
  await db.insert(movements).values([
    {
      productId: insertedProducts[0].id,
      toWarehouseId: wh1.id,
      quantity: 200,
      type: 'RECEIVE',
      createdBy: staffUser.user.id,
    },
    {
      productId: insertedProducts[2].id,
      toWarehouseId: wh1.id,
      quantity: 500,
      type: 'RECEIVE',
      createdBy: staffUser.user.id,
    },
    {
      productId: insertedProducts[0].id,
      fromWarehouseId: wh1.id,
      toWarehouseId: wh2.id,
      quantity: 50,
      type: 'TRANSFER',
      createdBy: adminUser.user.id,
    },
    {
      productId: insertedProducts[5].id,
      fromWarehouseId: wh2.id,
      quantity: 100,
      type: 'SHIP',
      createdBy: staffUser.user.id,
    },
    {
      productId: insertedProducts[9].id,
      fromWarehouseId: wh1.id,
      quantity: 5,
      type: 'ADJUSTMENT',
      reasonCode: 'DAMAGE',
      notes: 'Damaged in transit',
      createdBy: adminUser.user.id,
    },
  ])

  console.log('Movements created')

  // Purchase Orders
  const [po1] = await db
    .insert(purchaseOrders)
    .values([
      {
        supplierId: sup1.id,
        status: 'RECEIVED',
        createdBy: adminUser.user.id,
        notes: 'Initial stock order',
      },
      {
        supplierId: sup2.id,
        status: 'SUBMITTED',
        createdBy: staffUser.user.id,
        notes: 'Fastener restock',
      },
      { supplierId: sup3.id, status: 'DRAFT', createdBy: staffUser.user.id },
    ])
    .returning()

  await db.insert(purchaseOrderLines).values([
    {
      purchaseOrderId: po1.id,
      productId: insertedProducts[0].id,
      quantityOrdered: 200,
      quantityReceived: 200,
      warehouseId: wh1.id,
    },
    {
      purchaseOrderId: po1.id,
      productId: insertedProducts[1].id,
      quantityOrdered: 150,
      quantityReceived: 150,
      warehouseId: wh1.id,
    },
  ])

  console.log('Purchase orders created')

  // Sales Orders
  const [so1] = await db
    .insert(salesOrders)
    .values([
      {
        customerId: cust1.id,
        status: 'SHIPPED',
        createdBy: staffUser.user.id,
        notes: 'Construction site delivery',
      },
      {
        customerId: cust2.id,
        status: 'CONFIRMED',
        createdBy: staffUser.user.id,
      },
      { customerId: cust3.id, status: 'DRAFT', createdBy: adminUser.user.id },
    ])
    .returning()

  await db.insert(salesOrderLines).values([
    {
      salesOrderId: so1.id,
      productId: insertedProducts[2].id,
      quantity: 50,
      warehouseId: wh1.id,
    },
    {
      salesOrderId: so1.id,
      productId: insertedProducts[3].id,
      quantity: 30,
      warehouseId: wh1.id,
    },
  ])

  console.log('Sales orders created')
  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
