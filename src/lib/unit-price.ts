/**
 * 상품명에서 대략적인 중량(g) 추출. 전단 문구가 들쭉날쭉해 100% 정확하지 않을 수 있습니다.
 */
export function extractGrams(name: string): number | undefined {
  const kg = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kg) {
    const v = parseFloat(kg[1]);
    if (!Number.isNaN(v)) return Math.round(v * 1000);
  }

  const gParen = name.match(/\((\d+)\s*g/i);
  if (gParen) return parseInt(gParen[1], 10);

  const gSlash = name.match(/(\d+)\s*g\//);
  if (gSlash) return parseInt(gSlash[1], 10);

  const gEnd = name.match(/(\d+)g\)(?!.*\d+g)/);
  if (gEnd) return parseInt(gEnd[1], 10);

  const gPlain = name.match(/\b(\d{2,4})\s*g\b/i);
  if (gPlain) {
    const v = parseInt(gPlain[1], 10);
    if (v >= 10 && v <= 5000) return v;
  }

  return undefined;
}

export function wonPer100g(totalWon: number, grams: number): number {
  if (grams <= 0) return totalWon;
  return Math.round((totalWon / grams) * 100);
}
