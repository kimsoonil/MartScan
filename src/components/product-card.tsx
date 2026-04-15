import Image from "next/image";

import { isPriceOnlyRetailDetail } from "@/lib/is-price-only-detail";
import { CATEGORY_CARD_IMAGE } from "@/lib/category-card-image";
import { coupangSearchUrlForProductName } from "@/lib/coupang-search-url";
import {
  productHasCardDiscountHint,
  productLooksLikeBogo,
  productLooksLikeTwoPlusOne,
} from "@/lib/filter-products";
import type { ProductCardInsights } from "@/lib/product-insights";
import { effectiveWonPer100g } from "@/lib/unit-price-helpers";
import type { LeafletProduct, ProductCategory, MartId } from "@/types/leaflet";

import { ProductDetailsDisclosure } from "@/components/product-details-disclosure";
import { ProductShareButton } from "@/components/product-share-button";

const BADGE: Record<ProductCategory, string> = {
  meat_fish: "정육·수산",
  produce: "과일·채소",
  dairy: "유제품",
  quick_meal: "간편식",
  staple: "조미·양념",
  beverage_snack: "음료·간식",
  other: "기타",
};

const CAT_EMOJI: Record<ProductCategory, string> = {
  meat_fish: "🥩",
  produce: "🥦",
  dairy: "🥛",
  quick_meal: "🍱",
  staple: "🧂",
  beverage_snack: "🥤",
  other: "🛒",
};

const CAT_IMAGE_GRADIENT: Record<ProductCategory, string> = {
  meat_fish:
    "from-rose-200/90 via-orange-100/80 to-amber-100 dark:from-rose-950/80 dark:via-orange-950/60 dark:to-amber-950/50",
  produce:
    "from-lime-200/90 via-emerald-100/80 to-green-50 dark:from-lime-950/70 dark:via-emerald-950/50 dark:to-green-950/40",
  dairy:
    "from-sky-200/90 via-blue-50 to-indigo-50 dark:from-sky-950/70 dark:via-blue-950/50 dark:to-indigo-950/40",
  quick_meal:
    "from-amber-200/90 via-yellow-50 to-orange-50 dark:from-amber-950/70 dark:via-yellow-950/40 dark:to-orange-950/40",
  staple:
    "from-stone-200/90 via-neutral-100 to-zinc-50 dark:from-stone-800/80 dark:via-neutral-900/60 dark:to-zinc-900/50",
  beverage_snack:
    "from-fuchsia-200/90 via-pink-50 to-violet-50 dark:from-fuchsia-950/60 dark:via-pink-950/40 dark:to-violet-950/40",
  other:
    "from-slate-200/90 via-zinc-100 to-slate-50 dark:from-slate-800/80 dark:via-zinc-900/60 dark:to-slate-900/50",
};

function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

const MART_BADGE: Record<MartId, string> = {
  emart: "이마트",
  homeplus: "홈플러스",
};

const defaultInsights: ProductCardInsights = {
  megaDeal: false,
  crossMartWin: false,
  categoryCheapestUnit: false,
  cheaperVsHistory: false,
};

function discountPercent(original: number, sale: number): number | null {
  if (original <= 0 || sale >= original) return null;
  return Math.round(((original - sale) / original) * 100);
}

export function ProductCard({
  product,
  insights,
}: {
  product: LeafletProduct;
  insights?: ProductCardInsights;
}) {
  const ins = insights ?? defaultInsights;
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

  const pct =
    hasDiscount && product.originalWon != null && product.saleWon != null
      ? discountPercent(product.originalWon, product.saleWon)
      : null;

  const unit = effectiveWonPer100g(product);
  const hasUnitLabel = unit != null;
  const isBogo = productLooksLikeBogo(product);
  const isTwoPlusOne = productLooksLikeTwoPlusOne(product);
  const hasCardHint = productHasCardDiscountHint(product);

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

  const emoji = CAT_EMOJI[product.category];
  const grad = CAT_IMAGE_GRADIENT[product.category];
  const heroImage = CATEGORY_CARD_IMAGE[product.category];
  const coupangHref = coupangSearchUrlForProductName(product.name);

  const savedWon =
    hasDiscount && product.originalWon != null && product.saleWon != null
      ? product.originalWon - product.saleWon
      : null;

  const discountBarColor =
    pct == null
      ? ""
      : pct >= 40
        ? "bg-red-500"
        : pct >= 30
          ? "bg-orange-500"
          : pct >= 20
            ? "bg-yellow-400"
            : "bg-emerald-500";

  return (
    <article
      id={`product-${product.id}`}
      className={[
        "group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900",
        ins.megaDeal
          ? "border-rose-300 shadow-rose-100/60 ring-1 ring-rose-300/70 dark:border-rose-700/60 dark:shadow-none dark:ring-rose-700/50"
          : "border-zinc-100 dark:border-zinc-800",
      ].join(" ")}
    >
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain object-center p-2"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              unoptimized
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
              aria-hidden
            />
          </>
        ) : heroImage ? (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/20"
              aria-hidden
            />
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${grad}`}
            aria-hidden
          />
        )}

        {!product.imageUrl && !heroImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-3 py-4">
            <span className="select-none text-5xl leading-none drop-shadow-sm sm:text-6xl">
              {emoji}
            </span>
          </div>
        ) : null}

        <span
          className={
            heroImage
              ? "absolute bottom-2 left-1/2 z-[2] max-w-[calc(100%-1rem)] -translate-x-1/2 truncate rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-white/25 backdrop-blur-sm"
              : "absolute bottom-2 left-1/2 z-[2] max-w-[calc(100%-1rem)] -translate-x-1/2 truncate rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium text-zinc-600 backdrop-blur-sm dark:bg-zinc-900/70 dark:text-zinc-300"
          }
        >
          {MART_BADGE[mart]} · {product.sheetLabel}
        </span>

        <div className="absolute left-2 top-2 z-10 flex max-w-[min(72%,11rem)] flex-col items-start gap-1">
          {isTwoPlusOne ? (
            <span className="rounded-md bg-fuchsia-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              2+1
            </span>
          ) : null}
          {isBogo ? (
            <span className="rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              1+1
            </span>
          ) : null}
          {hasCardHint ? (
            <span className="rounded-md bg-sky-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-md dark:bg-sky-600">
              카드할인
            </span>
          ) : null}
        </div>

        {pct != null && pct > 0 ? (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-xs font-black text-white shadow-md">
            {pct}%↓
          </span>
        ) : null}

        {pct != null && pct > 0 ? (
          <div
            className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10"
            aria-hidden
          >
            <div
              className={`h-full ${discountBarColor} transition-all`}
              style={{ width: `${Math.min(pct * 2.5, 100)}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3.5 pt-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span aria-hidden>{emoji}</span>
          <span className="font-medium text-zinc-600 dark:text-zinc-300">
            {BADGE[product.category]}
          </span>
        </div>

        <div className="mt-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          {price != null ? (
            <>
              <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                {hasDiscount ? (
                  <span className="mb-0.5 text-xs font-medium text-zinc-400 line-through dark:text-zinc-500">
                    {formatWon(product.originalWon!)}
                  </span>
                ) : null}
                <span className="text-[1.65rem] font-black leading-none tracking-tight text-red-600 sm:text-[1.85rem] dark:text-red-400">
                  {formatWon(product.saleWon ?? product.originalWon!)}
                  {ins.cheaperVsHistory ? (
                    <span
                      className="ml-1 align-middle text-lg font-bold text-emerald-600 dark:text-emerald-400"
                      title="기록된 최저 단가보다 더 저렴하게 관측됨"
                      aria-label="기록 대비 가격 하락"
                    >
                      ▼
                    </span>
                  ) : null}
                </span>
                {hasUnitLabel ? (
                  <span className="mb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    100g {formatWon(unit)}
                  </span>
                ) : null}
              </div>
              {savedWon != null && savedWon > 0 ? (
                <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatWon(savedWon)} 절약
                </p>
              ) : null}
            </>
          ) : (
            <span className="text-base font-black text-amber-700 dark:text-amber-400">
              가격은 전단·매장에서 확인
            </span>
          )}
        </div>

        <h2 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-zinc-800 dark:text-zinc-200 sm:text-[0.9375rem]">
          {product.name}
        </h2>
        <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
          행사 {product.periodLabel}
        </p>

        {hasUnitLabel && price != null ? (
          <p className="mt-1 text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
            중량·가격은 전단 문구 기준 추정입니다. 장바구니 전 매장에서
            확인하세요.
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ProductShareButton
            productId={product.id}
            productName={product.name}
            martLabel={MART_BADGE[mart]}
          />
          <a
            href={coupangHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-orange-200/90 bg-orange-50/90 px-2.5 py-1 text-[11px] font-semibold text-orange-900 transition-colors hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-100 dark:hover:bg-orange-950/70"
          >
            쿠팡 최저가
          </a>
        </div>

        {promos.length > 0 ? (
          <ul className="mt-2 list-none space-y-1 rounded-lg border border-amber-200/80 bg-amber-50/90 px-2.5 py-2 dark:border-amber-900/40 dark:bg-amber-950/30">
            {promos.slice(0, 2).map((line, i) => (
              <li
                key={`${product.id}-promo-${i}`}
                className="line-clamp-2 text-xs font-medium leading-snug text-amber-950 dark:text-amber-100"
              >
                {line}
              </li>
            ))}
            {promos.length > 2 ? (
              <li className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                +{promos.length - 2}개 행사 조건
              </li>
            ) : null}
          </ul>
        ) : null}

        {showHomeplusDetails ? (
          <ProductDetailsDisclosure productId={product.id}>
            <ul className="list-none space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              {detailLines.map((line, i) => (
                <li key={`${product.id}-dl-${i}`}>{line}</li>
              ))}
            </ul>
          </ProductDetailsDisclosure>
        ) : null}
        {showEmartDetails ? (
          <ProductDetailsDisclosure productId={product.id} tone="muted">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {product.detailTail}
            </p>
          </ProductDetailsDisclosure>
        ) : null}
      </div>
    </article>
  );
}
