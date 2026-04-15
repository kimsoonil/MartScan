import * as cheerio from "cheerio";

import { FETCH_HEADERS, LEAFLET_FETCH_CACHE_TAG } from "@/lib/constants";

const EMART_FLYER_URL =
  "https://eapp.emart.com/webapp/product/flyer?trcknCode=main_banner";

/**
 * 이마트 공식 앱 전단 페이지에서 상품명 → 이미지URL 매핑 테이블을 추출합니다.
 * 상품명을 정규화(소문자·공백 제거)한 키로 저장하여 텍스트 파싱 결과와 매칭합니다.
 */
export async function fetchEmartFlyerImageMap(): Promise<Map<string, string>> {
  try {
    const res = await fetch(EMART_FLYER_URL, {
      headers: { ...FETCH_HEADERS },
      next: { revalidate: 86400, tags: [LEAFLET_FETCH_CACHE_TAG] },
    });

    if (!res.ok) return new Map();

    const html = await res.text();
    const $ = cheerio.load(html);
    const map = new Map<string, string>();

    // 이마트 전단 앱의 상품 컨테이너: article.leaflet-product 또는 li/div 하위 img + 상품명
    // 공통 패턴: img[src] + strong.title (또는 .name / .prd-name)
    $("*").each((_, el) => {
      const $el = $(el);

      // img 태그가 있고, 근접한 부모/형제에 상품명 텍스트가 있는 경우 수집
      const imgs = $el.find("img");
      if (imgs.length === 0) return;

      const nameCandidates = [
        $el.find("strong.title, .title, .prd-name, .name, .goods-name").first().text().trim(),
        $el.find("strong, h3, h4").first().text().trim(),
      ].filter(Boolean);

      const name = nameCandidates[0];
      if (!name || name.length < 2) return;

      const imgSrc = imgs.first().attr("src") || imgs.first().attr("data-src") || imgs.first().attr("data-img");
      if (!imgSrc || !imgSrc.startsWith("http")) return;

      // stimg.emart.com 또는 ssgcdn.com 이미지만 사용
      if (!imgSrc.includes("emart.com") && !imgSrc.includes("ssgcdn.com")) return;

      const key = normalizeProductName(name);
      if (!map.has(key)) {
        map.set(key, imgSrc);
      }
    });

    return map;
  } catch {
    return new Map();
  }
}

/**
 * 매핑 키 정규화: 소문자, 괄호·특수문자·공백 제거, 용량 표기 제거
 */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")           // 괄호 및 내용 제거 (예: (1kg/박스))
    .replace(/\d+\s*(g|kg|ml|l|개|팩|봉|박스|병|캔|입)/gi, "") // 용량 제거
    .replace(/[^가-힣a-z0-9]/g, "")   // 특수문자·공백 제거
    .trim();
}
