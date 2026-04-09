/**
 * 상세 안내 문구가 실질 설명 없이 가격·표기 보조만 담는지 판별합니다.
 */
export function isPriceOnlyRetailDetail(text: string): boolean {
  let t = text.replace(/\s+/g, " ").trim();
  if (!t) return true;

  t = t.replace(
    /(\d{1,3}(?:,\d{3})*|\d+)\s*[~～]\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/g,
    " ",
  );
  t = t.replace(
    /(\d{1,3}(?:,\d{3})*|\d+)\s*원\s*(->|→)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/g,
    " ",
  );
  t = t.replace(/(\d{1,3}(?:,\d{3})*|\d+)\s*원/g, " ");
  t = t.replace(/\s*(->|→|~|～)\s*/g, " ");

  t = t.replace(/\d+\s*%/g, " ");
  t = t.replace(/(\d{1,3}(?:,\d{3})*|\d+)/g, " ");
  t = t.replace(/%/g, " ");
  t = t.replace(/\s+/g, " ").trim();

  const boiler =
    /※\s*이미지컷입니다|※\s*교차구매\s*가능|※교차구매\s*가능|교차구매\s*가능\.?|이미지컷입니다|에\s*판매합니다\.?|원부터|부터|판매합니다\.?/gi;
  t = t.replace(boiler, " ");
  t = t.replace(/\b각\b/g, " ");
  t = t.replace(/\s+/g, " ").trim();

  return t.length === 0;
}
