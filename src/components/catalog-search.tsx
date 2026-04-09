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
  /** 상단 고정 바용: 한 줄·라벨 스크린리더 전용 */
  variant?: "default" | "compact";
};

export function CatalogSearch({ defaultQuery, variant = "default" }: Props) {
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

  const isCompact = variant === "compact";

  return (
    <form
      onSubmit={onSubmit}
      className={
        isCompact
          ? "flex w-full min-w-0 items-center gap-2"
          : "flex w-full flex-col gap-2 sm:flex-row sm:items-center"
      }
      role="search"
    >
      <label
        htmlFor="catalog-search-q"
        className={
          isCompact
            ? "sr-only"
            : "w-full shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:w-auto sm:py-1.5"
        }
      >
        검색
      </label>
      <div
        className={
          isCompact
            ? "flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2"
            : "flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center"
        }
      >
        <div className="relative min-w-0 flex-1">
          {!isCompact ? null : (
            <span
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              aria-hidden
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          )}
          <input
            id="catalog-search-q"
            name="q"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              isCompact
                ? "상품·행사 검색"
                : "상품명·상세·행사 문구 (띄어쓰기로 모두 포함)"
            }
            maxLength={200}
            autoComplete="off"
            enterKeyHint="search"
            className={
              isCompact
                ? "min-w-0 w-full rounded-xl border border-zinc-200/90 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/15"
                : "min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-teal-500 dark:focus:ring-teal-500/20"
            }
          />
        </div>
        <div
          className={
            isCompact
              ? "flex shrink-0 items-center gap-1"
              : "flex shrink-0 gap-2"
          }
        >
          <button
            type="submit"
            disabled={isPending}
            className={
              isCompact
                ? "rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 sm:px-3.5 sm:text-sm dark:bg-emerald-600 dark:hover:bg-emerald-500"
                : "rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500"
            }
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
              className={
                isCompact
                  ? "rounded-lg bg-zinc-100 px-2.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-200 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:text-sm"
                  : "rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 disabled:opacity-60 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:bg-zinc-800"
              }
            >
              초기화
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
