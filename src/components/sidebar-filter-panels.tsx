import Link from "next/link";

import { QuickSearchChips } from "@/components/quick-search-chips";
import {
  CATALOG_SECTION_LABELS,
  leafCategoryOptionsForSection,
  productCategoryAllowedInSection,
  type CatalogSection,
} from "@/lib/catalog-section";
import {
  catalogPath,
  type CatalogQuery,
  type CatalogSort,
  type DealFilterCounts,
  type DealFilterParams,
} from "@/lib/filter-products";
import type { MartId, ProductCategory } from "@/types/leaflet";

const MART_LABEL: Record<MartId, string> = {
  emart: "이마트",
  homeplus: "홈플러스",
};

const CATEGORY_LABEL: Record<"all" | ProductCategory, string> = {
  all: "전체",
  meat_fish: "정육·수산",
  produce: "과일·채소",
  dairy: "유제품",
  quick_meal: "간편식",
  staple: "조미·양념",
  beverage_snack: "음료·간식",
  other: "그 외",
};

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

const SORT_OPTIONS: { id: CatalogSort; label: string }[] = [
  { id: "default", label: "추천 (단가 우선)" },
  { id: "price_asc", label: "낮은 가격순" },
  { id: "price_desc", label: "높은 가격순" },
  { id: "unit_asc", label: "100g당 저렴한 순" },
  { id: "unit_desc", label: "100g당 비싼 순" },
  { id: "discount_desc", label: "할인율 높은 순" },
];

function sectionLabel(section: CatalogSection): string {
  return CATALOG_SECTION_LABELS.find((s) => s.id === section)?.label ?? "전체";
}

function navBtn(active: boolean, tone: "emerald" | "teal" | "indigo" | "rose" | "violet") {
  const tones = {
    emerald: active
      ? "bg-emerald-800 text-white dark:bg-emerald-700"
      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    teal: active
      ? "bg-teal-700 text-white dark:bg-teal-600"
      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    indigo: active
      ? "bg-indigo-700 text-white dark:bg-indigo-600"
      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    rose: active
      ? "bg-rose-700 text-white dark:bg-rose-600"
      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    violet: active
      ? "bg-violet-700 text-white dark:bg-violet-600"
      : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  };
  return `block w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tones[tone]}`;
}

type Props = {
  mart: MartId;
  section: CatalogSection;
  category: "all" | ProductCategory;
  deal: DealFilterParams;
  search: string;
  sort: CatalogSort;
  counts: Partial<Record<"all" | ProductCategory, number>>;
  dealCounts: DealFilterCounts;
};

export function SidebarFilterPanels({
  mart,
  section,
  category,
  deal,
  search,
  sort,
  counts,
  dealCounts,
}: Props) {
  const catalogQuery: CatalogQuery = {
    mart,
    section,
    category,
    deal,
    search,
    sort,
  };

  const base = { mart, section, category, deal, search, sort };

  const leafOptions = leafCategoryOptionsForSection(section);
  const visibleCategories = leafOptions
    .map((id) => CATEGORY_LABELS.find((c) => c.id === id))
    .filter((x): x is (typeof CATEGORY_LABELS)[number] => x != null);

  return (
    <nav className="flex flex-col gap-5" aria-label="카탈로그 필터">
      <div className="rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 dark:border-zinc-700/80 dark:bg-zinc-900/50">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          적용 중
        </p>
        <p className="mt-1 text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          {MART_LABEL[mart]} · {sectionLabel(section)} · {CATEGORY_LABEL[category]}
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          할인 · 1+1
        </h2>
        <p className="mb-1 text-[11px] text-zinc-500">할인 키워드</p>
        <ul className="mb-3 flex flex-col gap-1">
          <li>
            <Link
              href={catalogPath({
                ...base,
                deal: { ...deal, discountKeyword: "all" },
              })}
              className={navBtn(deal.discountKeyword === "all", "rose")}
            >
              전체
            </Link>
          </li>
          <li>
            <Link
              href={catalogPath({
                ...base,
                deal: { ...deal, discountKeyword: "only" },
              })}
              className={navBtn(deal.discountKeyword === "only", "rose")}
            >
              할인 문구만
              {dealCounts.discountText > 0 ? ` (${dealCounts.discountText})` : ""}
            </Link>
          </li>
        </ul>
        <p className="mb-1 text-[11px] text-zinc-500">1+1 행사</p>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href={catalogPath({
                ...base,
                deal: { ...deal, promo: "all" },
              })}
              className={navBtn(deal.promo === "all", "violet")}
            >
              전체
            </Link>
          </li>
          <li>
            <Link
              href={catalogPath({
                ...base,
                deal: { ...deal, promo: "bogo" },
              })}
              className={navBtn(deal.promo === "bogo", "violet")}
            >
              1+1
              {dealCounts.bogo > 0 ? ` (${dealCounts.bogo})` : ""}
            </Link>
          </li>
        </ul>
      </section>

      <div>
        <QuickSearchChips base={catalogQuery} />
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          정렬
        </h2>
        <ul className="flex flex-col gap-1">
          {SORT_OPTIONS.map(({ id, label }) => (
            <li key={id}>
              <Link
                href={catalogPath({ ...base, sort: id })}
                className={navBtn(sort === id, "indigo")}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          쇼핑 구역
        </h2>
        <ul className="flex flex-col gap-1">
          {CATALOG_SECTION_LABELS.map(({ id, label }) => {
            const active = section === id;
            const nextCategory =
              category !== "all" && productCategoryAllowedInSection(category, id)
                ? category
                : "all";
            return (
              <li key={id}>
                <Link
                  href={catalogPath({
                    mart,
                    section: id,
                    category: nextCategory,
                    deal,
                    search,
                    sort,
                  })}
                  className={navBtn(active, "emerald")}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          세부 분류
        </h2>
        <ul className="flex flex-col gap-1">
          {visibleCategories.map(({ id, label }) => {
            const active = category === id;
            const count = counts[id];
            return (
              <li key={id}>
                <Link
                  href={catalogPath({ ...base, category: id })}
                  className={navBtn(active, "teal")}
                >
                  {label}
                  {count != null && count > 0 ? (
                    <span className="ml-1 text-xs opacity-80">({count})</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <a
        href="https://my.homeplus.co.kr/leaflet"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-zinc-200 px-3 py-2 text-center text-xs font-medium text-emerald-800 hover:bg-emerald-50 dark:border-zinc-600 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
      >
        홈플러스 전단 원문 ↗
      </a>
    </nav>
  );
}
