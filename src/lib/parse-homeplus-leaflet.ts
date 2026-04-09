import { createHash } from "crypto";

import * as cheerio from "cheerio";

import type { LeafletProduct } from "@/types/leaflet";

import { categorizeProductName } from "./categorize-product";
import { extractHomeplusPromoPhrases } from "./extract-homeplus-promos";
import { formatHomeplusProductBlock } from "./format-homeplus-text";
import { extractGrams, wonPer100g } from "./unit-price";

/** `첫번째 상품입니다.` ~ `열한번째 상품입니다.` 등 앞에서 쪼갬 */
const PRODUCT_HEAD = /(?=[가-힣]+번째 상품입니다\.)/;

function stripPseudoXml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stableId(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

/** 아라비아 숫자 + 원 (홈플러스 텍스트에 섞여 있으면 추출) */
function extractArabicWon(block: string): {
  originalWon?: number;
  saleWon?: number;
} {
  const arrow = block.match(
    /(\d{1,3}(?:,\d{3})*|\d+)\s*원\s*(?:->|→|에서)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/,
  );
  if (arrow) {
    return {
      originalWon: Number(arrow[1].replace(/,/g, "")),
      saleWon: Number(arrow[2].replace(/,/g, "")),
    };
  }
  const single = block.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*원/);
  if (single) {
    return { saleWon: Number(single[1].replace(/,/g, "")) };
  }
  return {};
}

export function parseHomeplusLeafletHtml(html: string): LeafletProduct[] {
  const $ = cheerio.load(html);
  const period =
    $("#leafletDateText").attr("value")?.trim() ||
    $('li.cont-txt--caption01 span').first().text().trim() ||
    "매장 전단 참고";

  const products: LeafletProduct[] = [];

  $(".flyer__swiper.flyer-offline .swiper-wrapper > .swiper-slide").each(
    (_, slide) => {
      const $slide = $(slide);
      const img = $slide.find("img").first();
      const sheetLabel = (img.attr("alt")?.trim() || "전단 면").replace(
        /\s+/g,
        " ",
      );

      const altHtml = $slide.find(".altText").first().html() ?? "";
      const blob = stripPseudoXml(altHtml);
      if (!blob) return;

      const chunks = blob.split(PRODUCT_HEAD).map((c) => c.trim());

      for (const chunk of chunks) {
        if (!/번째 상품입니다\./.test(chunk)) continue;

        const rawChunk = chunk.replace(/\s+/g, " ").trim();
        if (rawChunk.length < 12) continue;

        const formatted = formatHomeplusProductBlock(rawChunk);
        const promoHighlights = extractHomeplusPromoPhrases(formatted.normalizedFull);
        const category = categorizeProductName(formatted.normalizedFull);
        const { originalWon, saleWon } = extractArabicWon(formatted.normalizedFull);
        const grams = extractGrams(formatted.normalizedFull);
        const basePrice = saleWon ?? originalWon;
        const per100 =
          basePrice !== undefined && grams !== undefined && grams > 0
            ? wonPer100g(basePrice, grams)
            : undefined;

        const detailTail =
          formatted.detailLines.length > 0
            ? formatted.detailLines.join(" ")
            : formatted.title;

        products.push({
          id: stableId(["homeplus", sheetLabel, formatted.normalizedFull.slice(0, 160)]),
          mart: "homeplus",
          sheetLabel,
          name: formatted.title,
          periodLabel: period,
          originalWon,
          saleWon,
          detailTail,
          detailLines: formatted.detailLines,
          promoHighlights,
          category,
          grams,
          wonPer100g: per100,
        });
      }
    },
  );

  return products;
}
