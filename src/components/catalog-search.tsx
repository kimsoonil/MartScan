"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type FormEvent,
} from "react";

type Props = {
  defaultQuery: string;
};

export function CatalogSearch({ defaultQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultQuery);
  }, [defaultQuery]);

  const pushWithSearch = useCallback(
    (raw: string) => {
      const p = new URLSearchParams(searchParams.toString());
      const t = raw.trim();
      if (t) p.set("q", t.slice(0, 200));
      else p.delete("q");
      const qs = p.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname || "/");
      });
    },
    [pathname, router, searchParams],
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pushWithSearch(value);
  };

  const hasActiveQuery = defaultQuery.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
      role="search"
    >
      <label
        htmlFor="catalog-search-q"
        className="w-full shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:w-auto sm:py-1.5"
      >
        검색
      </label>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id="catalog-search-q"
          name="q"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="상품명·상세·행사 문구 (띄어쓰기로 모두 포함)"
          maxLength={200}
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            검색
          </button>
          {hasActiveQuery || value.trim() ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setValue("");
                pushWithSearch("");
              }}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-60 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:bg-zinc-800"
            >
              초기화
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
