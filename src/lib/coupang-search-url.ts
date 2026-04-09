/**
 * 쿠팡 검색/파트너스 링크. `NEXT_PUBLIC_COUPANG_PARTNER_URL`에 `{q}` 자리를 두면
 * 인코딩된 상품명으로 치환합니다. 없으면 공개 검색 URL을 사용합니다.
 */
export function coupangSearchUrlForProductName(productName: string): string {
  const q = encodeURIComponent(productName.trim().slice(0, 120));
  const template = process.env.NEXT_PUBLIC_COUPANG_PARTNER_URL?.trim();
  if (template && template.includes("{q}")) {
    return template.replaceAll("{q}", q);
  }
  return `https://www.coupang.com/np/search?q=${q}`;
}
