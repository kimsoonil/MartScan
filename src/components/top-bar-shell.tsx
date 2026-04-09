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
    setDrawerOpen(false);
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
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200/90 bg-zinc-50/95 px-4 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-950 p-1 shadow-inner dark:bg-emerald-900">
          <Link
            href={emartHref}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              activeMart === "emart"
                ? "bg-white text-emerald-900 shadow"
                : "text-emerald-100 hover:bg-emerald-800/50"
            }`}
          >
            이마트
          </Link>
          <Link
            href={homeplusHref}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
              activeMart === "homeplus"
                ? "bg-white text-emerald-900 shadow"
                : "text-emerald-100 hover:bg-emerald-800/50"
            }`}
          >
            홈플러스
          </Link>
        </div>

        <div className="min-w-0 flex-1">
          <CatalogSearch defaultQuery={defaultQuery} />
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="shrink-0 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm lg:hidden dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        >
          필터
        </button>
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
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="닫기"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100vw-3rem,20rem)] max-w-full flex-col border-r border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                필터
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
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
