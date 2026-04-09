import Link from "next/link";

import type { CatalogQuery } from "@/lib/filter-products";
import { catalogPath } from "@/lib/filter-products";

const KEYWORDS = ["삼겹살", "계란", "우유", "라면", "바나나", "두부"];

type Props = {
  base: CatalogQuery;
};

export function QuickSearchChips({ base }: Props) {
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        인기 검색
      </span>
      <div className="flex flex-wrap gap-2">
        {KEYWORDS.map((kw) => {
          const active = base.search.trim() === kw;
          return (
            <Link
              key={kw}
              href={catalogPath({ ...base, search: kw })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-emerald-800 text-white dark:bg-emerald-700"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {kw}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
