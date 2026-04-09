export default function Loading() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div
        className="h-14 animate-pulse border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        aria-hidden
      />
      <div
        className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-zinc-50/95 px-4 dark:border-zinc-800 dark:bg-zinc-950/95"
        aria-hidden
      >
        <div className="h-10 w-56 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 min-w-0 flex-1 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-28 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
          <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-[3/2] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-2 p-3.5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-9 w-2/3 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-7 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
