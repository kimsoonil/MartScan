import { isPriceOnlyRetailDetail } from "@/lib/is-price-only-detail";
import type { LeafletProduct, ProductCategory, MartId } from "@/types/leaflet";

const BADGE: Record<ProductCategory, string> = {
  meat_fish: "정육·수산",
  produce: "과일·채소",
  dairy: "유제품",
  quick_meal: "간편식",
  staple: "조미·양념",
  beverage_snack: "음료·간식",
  other: "기타",
};

function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

const MART_BADGE: Record<MartId, string> = {
  emart: "이마트",
  homeplus: "홈플러스",
};

export function ProductCard({ product }: { product: LeafletProduct }) {
  const mart = product.mart ?? "emart";
  const promos = product.promoHighlights ?? [];
  const price =
    product.saleWon != null
      ? product.saleWon
      : product.originalWon != null
        ? product.originalWon
        : null;
  const hasDiscount =
    product.originalWon != null &&
    product.saleWon != null &&
    product.originalWon > product.saleWon;

  const detailLines = product.detailLines ?? [];
  const showHomeplusDetails =
    mart === "homeplus" &&
    detailLines.length > 0 &&
    !isPriceOnlyRetailDetail(detailLines.join(" "));

  const showEmartDetails =
    mart === "emart" &&
    promos.length === 0 &&
    product.detailTail &&
    !isPriceOnlyRetailDetail(product.detailTail);

  return (
    <article className="group flex h-full min-h-0 flex-col rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-900 dark:bg-violet-950/80 dark:text-violet-200">
          {MART_BADGE[mart]}
        </span>
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {product.sheetLabel}
        </span>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          {BADGE[product.category]}
        </span>
      </div>
      <h2 className="mt-2 text-sm font-semibold leading-snug text-zinc-900 sm:text-base dark:text-zinc-50">
        {product.name}
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        행사 {product.periodLabel}
      </p>
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        {price != null ? (
          <>
            {hasDiscount ? (
              <span className="text-sm text-zinc-400 line-through dark:text-zinc-500">
                {formatWon(product.originalWon!)}
              </span>
            ) : null}
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatWon(product.saleWon ?? product.originalWon!)}
            </span>
          </>
        ) : (
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            가격은 전단 이미지·매장에서 확인
          </span>
        )}
      </div>
      {promos.length > 0 ? (
        <ul className="mt-3 list-none space-y-2 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/40">
          {promos.map((line, i) => (
            <li
              key={`${product.id}-promo-${i}`}
              className="line-clamp-4 text-sm font-medium leading-snug text-amber-950 dark:text-amber-100"
            >
              <span className="mr-1.5 text-amber-600 dark:text-amber-400">▸</span>
              {line}
            </li>
          ))}
        </ul>
      ) : null}
      {product.grams != null && product.wonPer100g != null && price != null ? (
        <p className="mt-2 text-sm text-teal-800 dark:text-teal-300">
          약 {product.grams}g 기준 ·{" "}
          <span className="font-semibold">100g당 {formatWon(product.wonPer100g)}</span>
        </p>
      ) : product.grams != null ? (
        <p className="mt-2 text-xs text-zinc-500">표기 중량 약 {product.grams}g</p>
      ) : null}
      {showHomeplusDetails ? (
        <details className="group mt-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-700/80 dark:bg-zinc-900/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 [&::-webkit-details-marker]:hidden dark:text-zinc-400">
            <span>상세 안내</span>
            <span
              aria-hidden
              className="text-[10px] text-zinc-400 transition-transform duration-200 group-open:rotate-180 dark:text-zinc-500"
            >
              ▼
            </span>
          </summary>
          <ul className="list-none space-y-2 px-3 pb-2.5 pt-0 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-sm">
            {detailLines.map((line, i) => (
              <li key={`${product.id}-dl-${i}`} className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {showEmartDetails ? (
        <details className="group mt-2 rounded-lg border border-zinc-200/70 bg-zinc-50/50 dark:border-zinc-700/60 dark:bg-zinc-900/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-500 [&::-webkit-details-marker]:hidden dark:text-zinc-400">
            <span>상세 안내</span>
            <span
              aria-hidden
              className="text-[10px] text-zinc-400 transition-transform duration-200 group-open:rotate-180 dark:text-zinc-500"
            >
              ▼
            </span>
          </summary>
          <p className="px-2.5 pb-2.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {product.detailTail}
          </p>
        </details>
      ) : null}
    </article>
  );
}
