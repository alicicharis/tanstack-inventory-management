import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-14">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Warehouse Management
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          TitanWMS
        </h1>
        <p className="mb-8 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A modern inventory and warehouse management system. Track products,
          manage stock across warehouses, and streamline purchase and sales
          orders.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/login"
            className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition hover:bg-accent hover:text-accent-foreground"
          >
            Create Account
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            'Inventory Tracking',
            'Real-time stock levels across all warehouses.',
          ],
          [
            'Purchase Orders',
            'Manage supplier orders and receiving workflows.',
          ],
          [
            'Sales Orders',
            'Process customer orders and shipments efficiently.',
          ],
          [
            'Role-Based Access',
            'Admin and staff roles with appropriate permissions.',
          ],
        ].map(([title, desc]) => (
          <article
            key={title}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 className="mb-2 text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="m-0 text-sm text-muted-foreground">{desc}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
