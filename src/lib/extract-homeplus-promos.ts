/**
 * 홈플러스 전단 대체텍스트에서 행사·조건 문구만 추출합니다.
 */
export function extractHomeplusPromoPhrases(text: string): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];

  const found = new Set<string>();
  const push = (s: string) => {
    const x = s.trim();
    if (x.length >= 4) found.add(x);
  };

  for (const m of t.matchAll(/마이홈플러스 멤버특가[^.]{3,120}/g)) {
    push(`${m[0].trim()}.`);
  }

  for (const m of t.matchAll(/두개이상 구매시[^.]{2,80}/g)) {
    push(`${m[0].trim()}.`);
  }

  for (const m of t.matchAll(/하나사면 하나 더[^.]{0,100}/g)) {
    push(`${m[0].trim()}.`);
  }

  for (const m of t.matchAll(/칠대카드[^.]{5,100}/g)) {
    push(`${m[0].trim()}.`);
  }

  for (const m of t.matchAll(/교차구매 가능/g)) {
    push(m[0]);
  }

  for (const m of t.matchAll(/홈플러스 단독[^.]{3,80}/g)) {
    push(`${m[0].trim()}.`);
  }

  return [...found];
}
