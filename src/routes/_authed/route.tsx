import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

const getAuthSession = createServerFn().handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return {
    user: session.user,
    session: session.session,
  }
})

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const data = await getAuthSession()
    return { user: data.user, session: data.session }
  },
  component: AuthedLayout,
})

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/products', label: 'Products' },
  { to: '/warehouses', label: 'Warehouses' },
  { to: '/stock', label: 'Stock' },
  { to: '/suppliers', label: 'Suppliers' },
  { to: '/customers', label: 'Customers' },
] as const

function AuthedLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
        <nav className="flex flex-col gap-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{
                className:
                  'rounded-md px-3 py-2 text-sm font-medium bg-accent text-foreground',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
