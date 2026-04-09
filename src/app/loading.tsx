export default function Loading() {
  return (
    <div className="min-h-full bg-zinc-50 px-4 py-6 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 h-10 max-w-md animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="mb-4 h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="h-[150px] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2 p-3.5">
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-8 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
