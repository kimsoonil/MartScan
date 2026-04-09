import Link from "next/link";
import { Suspense } from "react";

import { CatalogSearch } from "@/components/catalog-search";
import {
  catalogPath,
  type DealFilterCounts,
  type DealFilterParams,
} from "@/lib/filter-products";
import type { MartId, ProductCategory } from "@/types/leaflet";

const CATEGORY_LABELS: { id: "all" | ProductCategory; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "meat_fish", label: "정육·수산" },
  { id: "produce", label: "과일·채소·견과" },
  { id: "dairy", label: "유제품" },
  { id: "quick_meal", label: "간편식" },
  { id: "staple", label: "조미·양념" },
  { id: "beverage_snack", label: "음료·간식" },
  { id: "other", label: "그 외" },
];

type Props = {
  mart: MartId;
  category: "all" | ProductCategory;
  counts: Partial<Record<"all" | ProductCategory, number>>;
  deal: DealFilterParams;
  dealCounts: DealFilterCounts;
  search: string;
};

export function LeafletToolbar({
  mart,
  category,
  counts,
  deal,
  dealCounts,
  search,
}: Props) {
  return (
    <div className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <Suspense
          fallback={
            <div
              className="h-11 w-full animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80"
              aria-hidden
            />
          }
        >
          <CatalogSearch defaultQuery={search} />
        </Suspense>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-full text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:w-auto sm:py-1.5">
            카테고리
          </span>
          {CATEGORY_LABELS.map(({ id, label }) => {
            const active = category === id;
            const count = counts[id];
            return (
              <Link
                key={id}
                href={catalogPath({ mart, category: id, deal, search })}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  active
                    ? "bg-teal-700 text-white dark:bg-teal-600"
                    : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {label}
                {count != null && count > 0 ? (
                  <span className="ml-1 opacity-80">({count})</span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-zinc-200/60 pt-2 dark:border-zinc-800/80">
          <span className="w-full shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:w-auto sm:py-1.5">
            할인 · 1+1
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              할인
            </span>
            <Link
              href={catalogPath({
                mart,
                category,
                deal: { ...deal, discountKeyword: "all" },
                search,
              })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                deal.discountKeyword === "all"
                  ? "bg-rose-700 text-white dark:bg-rose-600"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              전체
            </Link>
            <Link
              title="상품명·상세·행사 문구에 ‘할인’이 포함된 상품"
              href={catalogPath({
                mart,
                category,
                deal: { ...deal, discountKeyword: "only" },
                search,
              })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                deal.discountKeyword === "only"
                  ? "bg-rose-700 text-white dark:bg-rose-600"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              할인
              {dealCounts.discountText > 0 ? (
                <span className="ml-1 opacity-80">({dealCounts.discountText})</span>
              ) : null}
            </Link>
          </div>
          <span
            className="hidden h-6 w-px bg-zinc-200 sm:block dark:bg-zinc-700"
            aria-hidden
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              1+1
            </span>
            <Link
              href={catalogPath({
                mart,
                category,
                deal: { ...deal, promo: "all" },
                search,
              })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                deal.promo === "all"
                  ? "bg-violet-700 text-white dark:bg-violet-600"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              전체
            </Link>
            <Link
              title="1+1 또는 하나사면 하나 더 문구가 포함된 상품"
              href={catalogPath({
                mart,
                category,
                deal: { ...deal, promo: "bogo" },
                search,
              })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                deal.promo === "bogo"
                  ? "bg-violet-700 text-white dark:bg-violet-600"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              1+1
              {dealCounts.bogo > 0 ? (
                <span className="ml-1 opacity-80">({dealCounts.bogo})</span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
