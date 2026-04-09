import * as cheerio from "cheerio";

import {
  EMART_LEAFLET_URL,
  FETCH_HEADERS,
  LEAFLET_FETCH_CACHE_TAG,
} from "@/lib/constants";
import type { LeafletProduct } from "@/types/leaflet";

import { htmlParagraphToLines, mergeLeafletContinuationLines } from "./html-to-lines";
import { parseLeafletLine } from "./parse-leaflet-line";

export async function fetchEmartLeafletProducts(): Promise<LeafletProduct[]> {
  const res = await fetch(EMART_LEAFLET_URL, {
    headers: { ...FETCH_HEADERS },
    next: { revalidate: 86400, tags: [LEAFLET_FETCH_CACHE_TAG] },
  });

  if (!res.ok) {
    throw new Error(`Leaflet HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const products: LeafletProduct[] = [];

  $(".img_detail_txt").each((_, el) => {
    const sheetLabel = $(el).find("h2").first().text().trim() || "전단";
    const pHtml = $(el).find("p").first().html() ?? "";
    const lines = mergeLeafletContinuationLines(htmlParagraphToLines(pHtml));

    for (const line of lines) {
      const parsed = parseLeafletLine(line, sheetLabel);
      if (parsed) products.push(parsed);
    }
  });

  return products;
}
