import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

export const requireAuth = createMiddleware().server(async ({ next }) => {
  const request = getRequest()
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return next({
    context: {
      user: session.user,
      session: session.session,
    },
  })
})

export const requireAdmin = createMiddleware()
  .middleware([requireAuth])
  .server(async ({ next, context }) => {
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/' })
    }

    return next()
  })
