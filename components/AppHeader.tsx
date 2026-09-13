export function AppHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl italic tracking-tight text-[var(--ink)]">
            CompetitorMap
          </span>
          <span className="hidden text-xs text-[var(--muted)] sm:inline">
            dask.me
          </span>
        </div>
        <span className="rounded border border-[var(--border)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
          MVP
        </span>
      </div>
    </header>
  );
}
