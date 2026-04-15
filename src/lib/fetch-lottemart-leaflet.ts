import { createHash } from "crypto";

import * as cheerio from "cheerio";

import {
  FETCH_HEADERS,
  LEAFLET_FETCH_CACHE_TAG,
  LOTTEMART_LEAFLET_URL,
} from "@/lib/constants";
import type { LeafletProduct } from "@/types/leaflet";

import { categorizeProductName } from "./categorize-product";
import { extractGrams, wonPer100g } from "./unit-price";

function stableId(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

function parseWon(s: string): number | undefined {
  const m = s.match(/([\d,]+)\s*원/);
  if (!m) return undefined;
  const v = Number(m[1].replace(/,/g, ""));
  return Number.isNaN(v) || v <= 0 ? undefined : v;
}

/**
 * 롯데마트 제타 프로모션 페이지의 SSR HTML에서 상품 정보를 파싱합니다.
 * 상품 카드는 `.product-card-container` 또는 제품 링크 (`a[href*="/products/"]`)로 식별합니다.
 */
export function parseLotteMartHtml(html: string): LeafletProduct[] {
  const $ = cheerio.load(html);
  const products: LeafletProduct[] = [];
  const seen = new Set<string>();

  // 현재 주의 행사 기간 라벨 추정 (페이지에서 추출 시도, 없으면 생성)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getMonth() + 1}.${d.getDate()}`;
  const defaultPeriod = `${fmt(monday)} - ${fmt(sunday)}`;

  // 방법 1: 상품 카드 링크에서 파싱
  $("a[href*='/products/']").each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href") ?? "";
    if (!href.includes("/details")) return;

    // 상품 카드 컨테이너를 찾기 위해 상위 요소 탐색
    const $card = $el.closest("[class*='product']").length
      ? $el.closest("[class*='product']")
      : $el.parent();

    // 상품명: 카드 내 title-container 또는 링크 텍스트
    const $title = $card.find("[class*='title']").first();
    const name = ($title.text() || $el.text()).trim();
    if (!name || name.length < 2) return;

    // 중복 방지
    if (seen.has(name)) return;
    seen.add(name);

    // 가격 정보
    const priceText = $card.find("[class*='price']").text();
    const allPrices: number[] = [];
    const priceMatches = priceText.matchAll(/([\d,]+)\s*원/g);
    for (const m of priceMatches) {
      const v = Number(m[1].replace(/,/g, ""));
      if (!Number.isNaN(v) && v > 0) allPrices.push(v);
    }

    let originalWon: number | undefined;
    let saleWon: number | undefined;

    if (allPrices.length >= 2) {
      // 원가 + 판매가 (큰 쪽이 원가)
      originalWon = Math.max(...allPrices);
      saleWon = Math.min(...allPrices);
      if (originalWon === saleWon) originalWon = undefined;
    } else if (allPrices.length === 1) {
      saleWon = allPrices[0];
    }

    // 프로모션 정보
    const promoHighlights: string[] = [];
    $card.find("[class*='promotion']").each((_, promoEl) => {
      const t = $(promoEl).text().trim();
      if (t && t.length > 1) promoHighlights.push(t);
    });

    // 용량/중량 정보 (가격 영역에 "100ml당 217원" 같은 텍스트)
    const detailTail = priceText
      .replace(/([\d,]+)\s*원/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const category = categorizeProductName(name);
    const grams = extractGrams(name + " " + detailTail);
    const priceForUnit = saleWon ?? originalWon;
    const unit =
      priceForUnit != null && grams != null
        ? wonPer100g(priceForUnit, grams)
        : undefined;

    const id = stableId(["lottemart", "프로모션", name, defaultPeriod]);

    products.push({
      id,
      mart: "lottemart",
      sheetLabel: "BIG SALE",
      name,
      periodLabel: defaultPeriod,
      originalWon,
      saleWon,
      detailTail: detailTail || "",
      promoHighlights: promoHighlights.length > 0 ? promoHighlights : undefined,
      category,
      grams,
      wonPer100g: unit,
    });
  });

  return products;
}

export async function fetchLotteMartLeafletProducts(): Promise<LeafletProduct[]> {
  const res = await fetch(LOTTEMART_LEAFLET_URL, {
    headers: { ...FETCH_HEADERS },
    next: { revalidate: 86400, tags: [LEAFLET_FETCH_CACHE_TAG] },
  });

  if (!res.ok) {
    throw new Error(`LotteMart leaflet HTTP ${res.status}`);
  }

  const html = await res.text();
  const products = parseLotteMartHtml(html);
  if (products.length === 0) {
    throw new Error("Empty lottemart leaflet parse result");
  }
  return products;
}
