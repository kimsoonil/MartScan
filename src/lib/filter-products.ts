import type { CatalogSection } from "@/lib/catalog-section";
import { filterProductsByCatalogSection } from "@/lib/catalog-section";
import type { LeafletProduct, MartId, ProductCategory } from "@/types/leaflet";

import { effectiveWonPer100g } from "./unit-price-helpers";

export type DealFilterParams = {
  /** 본문 등에 `할인` 글자가 포함된 상품만 */
  discountKeyword: "all" | "only";
  promo: "all" | "bogo";
};

export function parseDealFilterParams(sp: {
  p?: string;
  disc?: string;
}): DealFilterParams {
  const discountKeyword =
    sp.disc === "1" || sp.disc === "true" || sp.disc === "only"
      ? "only"
      : "all";
  const promo = sp.p === "bogo" ? "bogo" : "all";
  return { discountKeyword, promo };
}

const SEARCH_QUERY_MAX_LEN = 200;

/** URL `q` → 필터·링크용 문자열 (앞뒤 공백 제거, 길이 제한) */
export function parseSearchFromParams(q: string | undefined): string {
  if (q == null || q === "") return "";
  return q.trim().slice(0, SEARCH_QUERY_MAX_LEN);
}

export type CatalogSort =
  | "default"
  | "price_asc"
  | "price_desc"
  | "unit_asc"
  | "unit_desc"
  | "discount_desc";

export function parseCatalogSort(raw: string | undefined): CatalogSort {
  const s = raw?.toLowerCase();
  if (s === "price_asc") return "price_asc";
  if (s === "price_desc") return "price_desc";
  if (s === "unit_asc") return "unit_asc";
  if (s === "unit_desc") return "unit_desc";
  if (s === "discount_desc") return "discount_desc";
  return "default";
}

export type CatalogQuery = {
  mart: MartId;
  category: "all" | ProductCategory;
  deal: DealFilterParams;
  /** `parseSearchFromParams`와 동일 규칙의 문자열; 빈 문자열이면 URL·필터에서 제외 */
  search: string;
  section: CatalogSection;
  sort: CatalogSort;
};

export function catalogPath(query: CatalogQuery): string {
  const p = new URLSearchParams();
  if (query.mart !== "emart") p.set("mart", query.mart);
  if (query.section !== "all") p.set("sec", query.section);
  if (query.category !== "all") p.set("cat", query.category);
  if (query.deal.discountKeyword === "only") {
    p.set("disc", "1");
  }
  if (query.deal.promo === "bogo") p.set("p", "bogo");
  const qTrim = query.search.trim().slice(0, SEARCH_QUERY_MAX_LEN);
  if (qTrim) p.set("q", qTrim);
  if (query.sort !== "default") p.set("sort", query.sort);
  const qs = p.toString();
  return qs ? `/?${qs}` : "/";
}

function productTextBlobRaw(p: LeafletProduct): string {
  return [
    p.name,
    p.detailTail,
    ...(p.promoHighlights ?? []),
    ...(p.detailLines ?? []),
  ].join(" ");
}

/** 상품 텍스트에 `할인`이 포함되는지 (키워드 필터용) */
export function productContainsDiscountKeyword(p: LeafletProduct): boolean {
  return productTextBlobRaw(p).includes("할인");
}

function productTextBlob(p: LeafletProduct): string {
  return productTextBlobRaw(p).toLowerCase();
}

/** 1+1 또는 하나사면 하나 더(띄어쓰기 변형 포함) */
export function productLooksLikeBogo(p: LeafletProduct): boolean {
  const t = productTextBlob(p);
  if (/1\s*\+\s*1/.test(t)) return true;
  if (/하나사면\s*하나\s*더/.test(t)) return true;
  return false;
}

const COUNT_KEYS: ("all" | ProductCategory)[] = [
  "all",
  "meat_fish",
  "produce",
  "dairy",
  "quick_meal",
  "staple",
  "beverage_snack",
  "other",
];

export function buildCategoryCounts(
  products: LeafletProduct[],
): Partial<Record<"all" | ProductCategory, number>> {
  const out: Partial<Record<"all" | ProductCategory, number>> = {
    all: products.length,
  };

  for (const c of COUNT_KEYS) {
    if (c === "all") continue;
    out[c] = products.filter((p) => p.category === c).length;
  }

  return out;
}

export type FilterParams = {
  category: "all" | ProductCategory;
  deal: DealFilterParams;
  /** 공백으로 구분된 토큰은 모두(AND) 이름·상세·행사 문구에 부분 일치 */
  search: string;
  section: CatalogSection;
};

function searchTokens(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .slice(0, 10);
}

function productMatchesSearch(p: LeafletProduct, rawSearch: string): boolean {
  const tokens = searchTokens(rawSearch);
  if (tokens.length === 0) return true;
  const blob = productTextBlob(p);
  return tokens.every((t) => blob.includes(t));
}

export function filterLeafletProducts(
  products: LeafletProduct[],
  { category, deal, search, section }: FilterParams,
): LeafletProduct[] {
  let out = filterProductsByCatalogSection(products, section);
  if (category !== "all") {
    out = out.filter((p) => p.category === category);
  }
  if (deal.discountKeyword === "only") {
    out = out.filter(productContainsDiscountKeyword);
  }
  if (deal.promo === "bogo") {
    out = out.filter(productLooksLikeBogo);
  }
  if (search.trim()) {
    out = out.filter((p) => productMatchesSearch(p, search));
  }
  return out;
}

export type DealFilterCounts = {
  discountText: number;
  bogo: number;
};

/** 현재 카테고리 기준(전체 선택 시 전 상품) 할인·BOGO 건수 */
export function buildDealFilterCounts(
  products: LeafletProduct[],
  category: "all" | ProductCategory,
): DealFilterCounts {
  const base =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  return {
    discountText: base.filter(productContainsDiscountKeyword).length,
    bogo: base.filter(productLooksLikeBogo).length,
  };
}

export function sortDealsFirst(products: LeafletProduct[]): LeafletProduct[] {
  return [...products].sort((a, b) => {
    const ra = unitScore(a);
    const rb = unitScore(b);
    if (ra !== rb) return ra - rb;
    return (a.saleWon ?? a.originalWon ?? 0) - (b.saleWon ?? b.originalWon ?? 0);
  });
}

function unitScore(p: LeafletProduct): number {
  const u = effectiveWonPer100g(p);
  if (u != null) return u;
  return (p.saleWon ?? p.originalWon ?? 999999999) * 0.001;
}

function salePriceWon(p: LeafletProduct): number | null {
  return p.saleWon ?? p.originalWon ?? null;
}

function discountRatio(p: LeafletProduct): number | null {
  if (p.originalWon == null || p.saleWon == null || p.originalWon <= 0) return null;
  if (p.originalWon <= p.saleWon) return null;
  return (p.originalWon - p.saleWon) / p.originalWon;
}

/** 필터된 목록에 정렬 적용. `default`는 단가 우선 추천 정렬 */
export function applyCatalogSort(
  products: LeafletProduct[],
  sort: CatalogSort,
): LeafletProduct[] {
  if (sort === "default") return sortDealsFirst(products);
  const arr = [...products];
  switch (sort) {
    case "price_asc":
      return arr.sort(
        (a, b) =>
          (salePriceWon(a) ?? Number.POSITIVE_INFINITY) -
          (salePriceWon(b) ?? Number.POSITIVE_INFINITY),
      );
    case "price_desc":
      return arr.sort(
        (a, b) => (salePriceWon(b) ?? -1) - (salePriceWon(a) ?? -1),
      );
    case "unit_asc":
      return arr.sort((a, b) => {
        const ua = effectiveWonPer100g(a);
        const ub = effectiveWonPer100g(b);
        return (ua ?? 1e12) - (ub ?? 1e12);
      });
    case "unit_desc":
      return arr.sort((a, b) => {
        const ua = effectiveWonPer100g(a);
        const ub = effectiveWonPer100g(b);
        return (ub ?? -1) - (ua ?? -1);
      });
    case "discount_desc":
      return arr.sort((a, b) => {
        const da = discountRatio(a) ?? -1;
        const db = discountRatio(b) ?? -1;
        return db - da;
      });
    default:
      return sortDealsFirst(products);
  }
}
