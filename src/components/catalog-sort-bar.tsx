import Link from "next/link";

import {
  catalogPath,
  type CatalogQuery,
  type CatalogSort,
} from "@/lib/filter-products";

const SORT_CHIPS: { id: CatalogSort; label: string }[] = [
  { id: "discount_desc", label: "할인율 높은 순" },
  { id: "price_asc", label: "낮은 가격순" },
  { id: "default", label: "추천" },
];

type Props = {
  query: CatalogQuery;
};

export function CatalogSortBar({ query }: Props) {
  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-2 border-b border-zinc-200/90 pb-3 dark:border-zinc-800"
      role="navigation"
      aria-label="정렬"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        정렬
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SORT_CHIPS.map(({ id, label }) => {
          const active = query.sort === id;
          const href = catalogPath({ ...query, sort: id });
          return (
            <Link
              key={id}
              href={href}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-emerald-700 text-white shadow-sm dark:bg-emerald-600"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
