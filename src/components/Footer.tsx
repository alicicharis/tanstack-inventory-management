export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-border bg-background px-4 pb-14 pt-10 text-muted-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} TitanWMS. All rights reserved.
        </p>
        <p className="m-0 text-xs font-semibold uppercase tracking-widest">
          Built with TanStack Start
        </p>
      </div>
    </footer>
  )
}
