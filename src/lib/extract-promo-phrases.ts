/**
 * 전단 상품 꼬리(tail)에서 조건부 할인·행사 문구만 뽑아 카드에 강조할 때 사용합니다.
 */
export function extractPromoPhrases(tail: string): string[] {
  const cleaned = tail.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const found = new Set<string>();

  const stripNoise = (s: string) =>
    s
      .replace(/※이미지컷입니다\s*$/i, "")
      .replace(/※교차구매 가능\s*$/i, "")
      .trim();

  const push = (s: string) => {
    const t = stripNoise(s);
    if (t.length >= 4) found.add(t);
  };

  for (const m of cleaned.matchAll(/신세계포인트 적립 시[^※]+/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/\d+개 이상 구매 시[^※]+/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/\d+팩 이상 구매 시[^※]+/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/\d+입 이상 구매 시[^※]+/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/행사카드 전액 결제 시[^※]+/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/\d+개\s*골라담기[^※]+/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/(?:\d+개\s*)?골라담기\s*\d{1,3}(?:,\d{3})*\s*원[^※]*/g)) {
    push(m[0]);
  }

  for (const m of cleaned.matchAll(/1\+1(?:\s*※교차구매 가능)?/g)) {
    push(m[0]);
  }

  return [...found];
}
