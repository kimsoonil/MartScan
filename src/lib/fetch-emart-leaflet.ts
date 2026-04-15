import * as cheerio from "cheerio";

import {
  EMART_LEAFLET_URL,
  FETCH_HEADERS,
  LEAFLET_FETCH_CACHE_TAG,
} from "@/lib/constants";
import type { LeafletProduct } from "@/types/leaflet";

import { htmlParagraphToLines, mergeLeafletContinuationLines } from "./html-to-lines";
import { parseLeafletLine } from "./parse-leaflet-line";
import {
  fetchEmartFlyerImageMap,
  normalizeProductName,
} from "./fetch-emart-flyer-images";

export async function fetchEmartLeafletProducts(): Promise<LeafletProduct[]> {
  // 접근성 텍스트 파싱 + 이미지 매핑 테이블을 병렬로 fetch
  const [html, imageMap] = await Promise.all([
    fetch(EMART_LEAFLET_URL, {
      headers: { ...FETCH_HEADERS },
      next: { revalidate: 86400, tags: [LEAFLET_FETCH_CACHE_TAG] },
    }).then((res) => {
      if (!res.ok) throw new Error(`Leaflet HTTP ${res.status}`);
      return res.text();
    }),
    fetchEmartFlyerImageMap(),
  ]);

  const $ = cheerio.load(html);
  const products: LeafletProduct[] = [];

  $(".img_detail_txt").each((_, el) => {
    const sheetLabel = $(el).find("h2").first().text().trim() || "전단";
    const pHtml = $(el).find("p").first().html() ?? "";
    const lines = mergeLeafletContinuationLines(htmlParagraphToLines(pHtml));

    for (const line of lines) {
      const parsed = parseLeafletLine(line, sheetLabel);
      if (!parsed) continue;

      // 상품명을 정규화하여 이미지 매핑 테이블에서 이미지 URL 조회
      const key = normalizeProductName(parsed.name);
      const imageUrl = imageMap.get(key);

      products.push(imageUrl ? { ...parsed, imageUrl } : parsed);
    }
  });

  return products;
}
