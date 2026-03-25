import { authClient } from '#/lib/auth-client'
import { Link } from '@tanstack/react-router'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded bg-muted" />
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
            <span className="text-xs font-medium text-muted-foreground">
              {session.user.name.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            void authClient.signOut()
          }}
          className="h-9 border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/login"
      className="inline-flex h-9 items-center border border-border bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Sign in
    </Link>
  )
}
