import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          About
        </p>
        <h1 className="mb-3 text-4xl font-bold text-foreground sm:text-5xl">
          TitanWMS
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-muted-foreground">
          TitanWMS is a modern warehouse management system built with TanStack
          Start, PostgreSQL, and Drizzle ORM. It provides real-time inventory
          tracking, purchase and sales order management, and role-based access
          control for warehouse operations.
        </p>
      </section>
    </main>
  )
}
