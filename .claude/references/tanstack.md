# TanStack Start Reference

Learnings and gotchas discovered while working with TanStack Start in this project.

## Server Functions

- `createServerFn` is exported from `@tanstack/react-start`
- The handler callback receives `{ data, serverFnMeta, context, method }` — **NOT** `request`
- To access the current request inside a server function, use `getRequest()` from `@tanstack/react-start/server`
- `getWebRequest` does NOT exist — use `getRequest()` instead

## Request/Response Helpers

All from `@tanstack/react-start/server` (re-exported from `@tanstack/start-server-core`):

- `getRequest()` — returns the current `Request` object
- `getRequestHeaders()` — typed request headers
- `getRequestHeader(name)` — single header
- `getRequestIP()`, `getRequestHost()`, `getRequestUrl()`, `getRequestProtocol()`
- `getResponseHeaders()`, `setResponseHeaders()`, `setResponseHeader()`, `removeResponseHeader()`
- `getResponseStatus()`, `setResponseStatus()`
- `getCookies()`, `getCookie(name)`, `setCookie()`, `deleteCookie()`
- `getResponse()` — returns `{ status, statusText, headers }`

## Middleware

- `createMiddleware` is exported from `@tanstack/react-start`
- **Function middleware** (`.server()`) receives `{ data, context, next, method, serverFnMeta, signal }` — no `request`
- **Request middleware** (`.server()` on request-type middleware) receives `{ request, pathname, context, next }`
- To access `request` in function middleware, use `getRequest()` from `@tanstack/react-start/server`
- Chain middleware: `createMiddleware().middleware([parentMw]).server(...)`
- Pass context downstream: `return next({ context: { ... } })`

## File-Based Routing

- Pathless layout routes use underscore prefix: `_authed.tsx` or `_authed/route.tsx`
- A pathless layout route WITHOUT child routes will conflict with `index.tsx` at the same level (both resolve to `/`)
- Use directory format `_authed/route.tsx` + child routes like `_authed/dashboard.tsx` to avoid conflicts
- Route pattern: `createFileRoute('/path')({ component, beforeLoad, ... })`
- Layout routes render `<Outlet />` for child content

## Route `beforeLoad`

- Use `createServerFn` + `getRequest()` to check auth server-side in `beforeLoad`
- Throw `redirect({ to: '/login' })` from `@tanstack/react-router` for auth failures
- Return data from `beforeLoad` to make it available via `Route.useRouteContext()`

## Build & Dev

- TanStack Start uses Vite 7
- Route tree is auto-generated in `src/routeTree.gen.ts` — don't edit manually
- Build runs client + SSR environments sequentially
- `vinxi` is NOT used in current TanStack Start versions — it uses native Vite
