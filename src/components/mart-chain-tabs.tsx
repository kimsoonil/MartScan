import Link from "next/link";

import { catalogPath, type DealFilterParams } from "@/lib/filter-products";
import type { MartId, ProductCategory } from "@/types/leaflet";

type Props = {
  active: MartId;
  category: "all" | ProductCategory;
  deal: DealFilterParams;
  search: string;
};

export function MartChainTabs({ active, category, deal, search }: Props) {
  return (
    <div className="border-b border-emerald-900/20 bg-emerald-950/90 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl gap-2">
        <span className="py-1.5 pr-2 text-xs font-medium text-emerald-200/80">
          마트
        </span>
        <Link
          href={catalogPath({ mart: "emart", category, deal, search })}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === "emart"
              ? "bg-white text-emerald-900 shadow"
              : "text-emerald-100 hover:bg-emerald-800/60"
          }`}
        >
          이마트
        </Link>
        <Link
          href={catalogPath({ mart: "homeplus", category, deal, search })}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === "homeplus"
              ? "bg-white text-emerald-900 shadow"
              : "text-emerald-100 hover:bg-emerald-800/60"
          }`}
        >
          홈플러스
        </Link>
        <a
          href="https://my.homeplus.co.kr/leaflet"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto self-center text-xs text-emerald-200/70 underline-offset-2 hover:text-white hover:underline"
        >
          홈플러스 전단 원문
        </a>
      </div>
    </div>
  );
}
