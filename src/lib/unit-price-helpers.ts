import type { LeafletProduct } from "@/types/leaflet";

import { wonPer100g } from "./unit-price";

/** 판매가·행사가 우선, 없으면 원가 */
export function priceBasisWon(p: LeafletProduct): number | null {
  if (p.saleWon != null) return p.saleWon;
  if (p.originalWon != null) return p.originalWon;
  return null;
}

/**
 * 100g당 원가. 파서가 넣지 않았어도 가격·중량이 있으면 price/grams*100으로 계산합니다.
 */
export function effectiveWonPer100g(p: LeafletProduct): number | null {
  if (p.wonPer100g != null) return p.wonPer100g;
  const won = priceBasisWon(p);
  const g = p.grams;
  if (won == null || g == null || g <= 0) return null;
  return wonPer100g(won, g);
}
