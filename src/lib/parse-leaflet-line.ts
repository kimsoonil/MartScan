import { createHash } from "crypto";

import type { LeafletProduct, ProductCategory } from "@/types/leaflet";

import { categorizeProductName } from "./categorize-product";
import { extractPromoPhrases } from "./extract-promo-phrases";
import { stripHtmlFragmentToPlainText } from "./html-to-lines";
import { normalizeKoreanRetailText } from "./hangul-won";
import { extractGrams, wonPer100g } from "./unit-price";

const PERIOD_RE =
  /행사기간\s*:\s*([\d.]+\([^)]+\))\s*-\s*([\d.]+\([^)]+\))\s*([\s\S]*)$/;

function parseWon(s: string): number {
  return Number(s.replace(/,/g, ""));
}

function extractPrices(tail: string): {
  originalWon?: number;
  saleWon?: number;
} {
  const t = tail.replace(/\s+/g, " ").trim();

  const arrow = t.match(
    /(\d{1,3}(?:,\d{3})*|\d+)\s*원\s*(?:->|→)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/,
  );
  if (arrow) {
    return {
      originalWon: parseWon(arrow[1]),
      saleWon: parseWon(arrow[2]),
    };
  }

  const single = t.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*원/);
  if (single) {
    return { saleWon: parseWon(single[1]) };
  }

  const bundle = t.match(
    /(?:골라담기|담기)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/,
  );
  if (bundle) {
    return { saleWon: parseWon(bundle[1]) };
  }

  return {};
}

function stableId(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

export function parseLeafletLine(
  line: string,
  sheetLabel: string,
): LeafletProduct | null {
  const m = line.match(PERIOD_RE);
  if (!m) return null;

  const name = normalizeKoreanRetailText(
    stripHtmlFragmentToPlainText(line.slice(0, line.indexOf("행사기간"))),
  );
  if (!name) return null;

  const periodLabel = `${m[1]} - ${m[2]}`;
  const tail = normalizeKoreanRetailText(stripHtmlFragmentToPlainText(m[3] ?? ""));
  const { originalWon, saleWon } = extractPrices(tail);
  const promoHighlights = extractPromoPhrases(tail);
  const category: ProductCategory = categorizeProductName(name);
  const grams = extractGrams(name);
  const basePrice = saleWon ?? originalWon;
  const per100 =
    basePrice !== undefined && grams !== undefined && grams > 0
      ? wonPer100g(basePrice, grams)
      : undefined;

  return {
    id: stableId(["emart", sheetLabel, name, periodLabel]),
    mart: "emart" as const,
    sheetLabel,
    name,
    periodLabel,
    originalWon,
    saleWon,
    detailTail: tail.slice(0, 280),
    promoHighlights,
    category,
    grams,
    wonPer100g: per100,
  };
}
