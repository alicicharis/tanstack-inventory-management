import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useRouteContext()

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mb-3 text-4xl font-bold text-foreground">
          Welcome, {user.name}
        </h1>
        <p className="m-0 text-base text-muted-foreground">
          You are signed in as <span className="font-medium">{user.role}</span>.
        </p>
      </section>
    </main>
  )
}
