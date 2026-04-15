import { readFile } from "fs/promises";
import path from "path";

import type { LeafletProduct, MartId, ProductCategory } from "@/types/leaflet";

import { effectiveWonPer100g } from "./unit-price-helpers";

export type WeeklyPriceEntry = { week: string; wonPer100g: number };

export type ProductCardInsights = {
  /** 수집 이력·타 마트 대비 등으로 강한 할인으로 표시 */
  megaDeal: boolean;
  /** 같은 카테고리·유사 상품명 기준 타 마트보다 100g당 저렴 */
  crossMartWin: boolean;
  /** 현재 마트 전단에서 해당 카테고리 내 100g당 최저(동률 포함) */
  categoryCheapestUnit: boolean;
  /** 기록된 최저 단가보다 더 싸게 관측됨(신저가 느낌) */
  cheaperVsHistory: boolean;
  /** 대용량이지만 단가가 저렴해 소분 냉동 추천 */
  freezingTip: boolean;
  /** 주간 단가 이력 (스파크라인용, 최근 8주) */
  priceHistory?: WeeklyPriceEntry[];
};

export type UnitPriceHistory = {
  minByKey: Record<string, number>;
  weeklyHistory: Record<string, WeeklyPriceEntry[]>;
};

/** `public/data/unit-price-history.json` 전체 로드 (minByKey + weeklyHistory) */
export async function loadUnitPriceHistory(): Promise<UnitPriceHistory> {
  try {
    const fp = path.join(
      process.cwd(),
      "public",
      "data",
      "unit-price-history.json",
    );
    const raw = await readFile(fp, "utf-8");
    const j = JSON.parse(raw) as {
      minByKey?: Record<string, number>;
      weeklyHistory?: Record<string, WeeklyPriceEntry[]>;
    };
    return {
      minByKey: j.minByKey && typeof j.minByKey === "object" ? j.minByKey : {},
      weeklyHistory:
        j.weeklyHistory && typeof j.weeklyHistory === "object"
          ? j.weeklyHistory
          : {},
    };
  } catch {
    return { minByKey: {}, weeklyHistory: {} };
  }
}

/** 하위 호환용 래퍼 — minByKey만 필요한 곳 */
export async function loadUnitPriceHistoryMinByKey(): Promise<
  Record<string, number>
> {
  const h = await loadUnitPriceHistory();
  return h.minByKey;
}

export function normalizeNameKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^0-9a-z\uAC00-\uD7A3]+/gi, "")
    .slice(0, 28);
}

function historyKey(mart: MartId, category: ProductCategory, name: string): string {
  return `${mart}|${category}|${normalizeNameKey(name)}`;
}

function namesLikelySame(a: string, b: string): boolean {
  const na = normalizeNameKey(a);
  const nb = normalizeNameKey(b);
  if (na.length < 2 || nb.length < 2) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.length >= 4) {
    return na.includes(nb) || nb.includes(na);
  }
  return false;
}

function minUnitInCategory(
  products: LeafletProduct[],
  category: ProductCategory,
): number | null {
  let min: number | null = null;
  for (const p of products) {
    if (p.category !== category) continue;
    const u = effectiveWonPer100g(p);
    if (u == null) continue;
    if (min == null || u < min) min = u;
  }
  return min;
}

/** 소분 냉동 추천 대상인지 판단 (대용량 + 저단가 + 정육/농산) */
const SOLO_GRAM_THRESHOLD = 500;
function shouldShowFreezingTip(
  p: LeafletProduct,
  categoryCheapestUnit: boolean,
  crossMartWin: boolean,
): boolean {
  if (p.grams == null || p.grams <= SOLO_GRAM_THRESHOLD) return false;
  if (p.category !== "meat_fish" && p.category !== "produce") return false;
  return categoryCheapestUnit || crossMartWin;
}

export function buildProductInsights(
  currentMartProducts: LeafletProduct[],
  allOtherProducts: LeafletProduct[],
  currentMartId: MartId,
  historyMinByKey: Record<string, number>,
  weeklyHistory?: Record<string, WeeklyPriceEntry[]>,
): Map<string, ProductCardInsights> {
  const out = new Map<string, ProductCardInsights>();

  const minsByCategory = new Map<ProductCategory, number | null>();
  for (const c of [
    "meat_fish",
    "produce",
    "dairy",
    "quick_meal",
    "staple",
    "beverage_snack",
    "other",
  ] as ProductCategory[]) {
    minsByCategory.set(c, minUnitInCategory(currentMartProducts, c));
  }

  for (const p of currentMartProducts) {
    const unit = effectiveWonPer100g(p);
    const catMin = minsByCategory.get(p.category);

    const categoryCheapestUnit =
      unit != null && catMin != null && unit === catMin;

    let crossMartWin = false;
    if (unit != null) {
      for (const o of allOtherProducts) {
        if (o.category !== p.category) continue;
        if (!namesLikelySame(p.name, o.name)) continue;
        const ou = effectiveWonPer100g(o);
        if (ou == null) continue;
        if (unit < ou) {
          crossMartWin = true;
          break;
        }
      }
    }

    const hk = historyKey(currentMartId, p.category, p.name);
    const histMin = historyMinByKey[hk];
    const historyHit =
      unit != null &&
      histMin != null &&
      Number.isFinite(histMin) &&
      unit <= histMin * 1.02;

    const megaDeal =
      historyHit || (categoryCheapestUnit && crossMartWin && unit != null);

    const cheaperVsHistory =
      unit != null &&
      histMin != null &&
      Number.isFinite(histMin) &&
      unit < histMin;

    const freezingTip = shouldShowFreezingTip(p, categoryCheapestUnit, crossMartWin);

    const priceHistory = weeklyHistory?.[hk]?.slice(-8);

    out.set(p.id, {
      megaDeal,
      crossMartWin,
      categoryCheapestUnit,
      cheaperVsHistory,
      freezingTip,
      priceHistory: priceHistory && priceHistory.length >= 2 ? priceHistory : undefined,
    });
  }

  return out;
}
