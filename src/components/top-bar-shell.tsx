"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CatalogSearch } from "@/components/catalog-search";
import type { MartId } from "@/types/leaflet";

type Props = {
  emartHref: string;
  homeplusHref: string;
  activeMart: MartId;
  defaultQuery: string;
  children: ReactNode;
};

const tabBase =
  "relative rounded-lg px-2.5 py-2 text-center text-xs font-bold transition-all duration-200 sm:px-3.5 sm:text-sm";

export function TopBarShell({
  emartHref,
  homeplusHref,
  activeMart,
  defaultQuery,
  children,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  useEffect(() => {
    queueMicrotask(() => setDrawerOpen(false));
  }, [pathname, qs]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/90 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-950/90 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mx-auto flex max-w-7xl min-h-14 flex-wrap items-center gap-3 px-4 py-2 sm:min-h-16 sm:gap-4 sm:px-6">
          <div className="flex w-full items-center gap-3 min-[520px]:w-auto min-[520px]:shrink-0">
            <p className="sr-only">마트 선택</p>
            <div
              className="flex shrink-0 items-center gap-0.5 rounded-2xl border border-zinc-200/90 bg-zinc-100/90 p-1 shadow-inner dark:border-zinc-700/80 dark:bg-zinc-900/80"
              role="tablist"
              aria-label="마트"
            >
              <Link
                href={emartHref}
                role="tab"
                aria-selected={activeMart === "emart"}
                className={`${tabBase} ${
                  activeMart === "emart"
                    ? "bg-white text-emerald-800 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-emerald-200 dark:ring-zinc-600/60"
                    : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                }`}
              >
                이마트
              </Link>
              <Link
                href={homeplusHref}
                role="tab"
                aria-selected={activeMart === "homeplus"}
                className={`${tabBase} ${
                  activeMart === "homeplus"
                    ? "bg-white text-emerald-800 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-emerald-200 dark:ring-zinc-600/60"
                    : "text-zinc-600 hover:bg-white/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                }`}
              >
                홈플러스
              </Link>
              <span
                className={`${tabBase} cursor-not-allowed text-zinc-400/70 dark:text-zinc-600`}
                title="롯데마트 — 데이터 연동 준비 중"
                aria-disabled="true"
              >
                <span className="sm:hidden">롯데</span>
                <span className="hidden sm:inline">롯데마트</span>
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1 basis-full min-[520px]:basis-0">
            <CatalogSearch defaultQuery={defaultQuery} variant="compact" />
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-emerald-300/60 hover:bg-emerald-50/50 lg:hidden dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
          >
            <svg
              className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
            필터
          </button>
        </div>
      </header>

      {drawerOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="필터"
        >
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
            aria-label="닫기"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100vw-2.5rem,22rem)] max-w-full flex-col border-r border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                필터
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
              >
                닫기
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
