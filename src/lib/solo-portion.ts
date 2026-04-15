import type { LeafletProduct } from "@/types/leaflet";

export const SOLO_GRAM_THRESHOLD = 500;

const SOLO_KEYWORDS = ["소포장", "1인", "소용량", "미니", "1팩", "1봉", "소분"];

/** 1인 가구에 적합한 소포장/소용량 상품인지 판별 */
export function isSoloPortion(product: LeafletProduct): boolean {
  if (product.grams != null && product.grams <= SOLO_GRAM_THRESHOLD) return true;

  const blob = [
    product.name,
    product.detailTail,
    ...(product.promoHighlights ?? []),
  ].join(" ");

  return SOLO_KEYWORDS.some((kw) => blob.includes(kw));
}
