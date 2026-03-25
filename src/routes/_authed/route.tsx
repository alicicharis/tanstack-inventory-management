import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
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

function AuthedLayout() {
  return <Outlet />
}
