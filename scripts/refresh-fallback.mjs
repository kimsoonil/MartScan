/**
 * 로컬에서 이마트 전단을 불러와 public/data/leaflet-fallback.json 을 갱신합니다.
 * 실행: node scripts/refresh-fallback.mjs
 */
import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const URL =
  process.env.LEAFLET_SOURCE_URL ??
  "https://eapp.emart.com/leaflet/leafletView_EL.do?trcknCode=leafletMainBanner";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; MartScan/1.0) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

function htmlParagraphToLines(html) {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "\n");
  const $ = cheerio.load(`<root>${withBreaks}</root>`);
  const text = $("root").text();
  return text
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function stripHtmlFragmentToPlainText(fragment) {
  const s = String(fragment).trim();
  if (!s.includes("<")) return s.replace(/\s+/g, " ").trim();
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function mergeLeafletContinuationLines(lines) {
  const merged = [];
  let buffer = "";
  for (const line of lines) {
    if (line.includes("행사기간")) {
      merged.push(buffer ? `${buffer} ${line}` : line);
      buffer = "";
    } else {
      buffer = buffer ? `${buffer} ${line}` : line;
    }
  }
  return merged.filter((l) => l.includes("행사기간"));
}

const PERIOD_RE =
  /행사기간\s*:\s*([\d.]+\([^)]+\))\s*-\s*([\d.]+\([^)]+\))\s*([\s\S]*)$/;

function parseWon(s) {
  return Number(String(s).replace(/,/g, ""));
}

function extractPrices(tail) {
  const t = tail.replace(/\s+/g, " ").trim();
  const arrow = t.match(
    /(\d{1,3}(?:,\d{3})*|\d+)\s*원\s*(?:->|→)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/,
  );
  if (arrow) {
    return { originalWon: parseWon(arrow[1]), saleWon: parseWon(arrow[2]) };
  }
  const single = t.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*원/);
  if (single) return { saleWon: parseWon(single[1]) };
  const bundle = t.match(/(?:골라담기|담기)\s*(\d{1,3}(?:,\d{3})*|\d+)\s*원/);
  if (bundle) return { saleWon: parseWon(bundle[1]) };
  return {};
}

function extractGrams(name) {
  const kg = name.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (kg) {
    const v = parseFloat(kg[1]);
    if (!Number.isNaN(v)) return Math.round(v * 1000);
  }
  const gParen = name.match(/\((\d+)\s*g/i);
  if (gParen) return parseInt(gParen[1], 10);
  const gSlash = name.match(/(\d+)\s*g\//);
  if (gSlash) return parseInt(gSlash[1], 10);
  const gEnd = name.match(/(\d+)g\)(?!.*\d+g)/);
  if (gEnd) return parseInt(gEnd[1], 10);
  const gPlain = name.match(/\b(\d{2,4})\s*g\b/i);
  if (gPlain) {
    const v = parseInt(gPlain[1], 10);
    if (v >= 10 && v <= 5000) return v;
  }
  return undefined;
}

function wonPer100g(totalWon, grams) {
  if (!grams || grams <= 0) return undefined;
  return Math.round((totalWon / grams) * 100);
}

const RULES = [
  {
    category: "other",
    keywords: [
      "Mac ",
      "맥북",
      "갤럭시북",
      "SSD",
      "이어폰",
      "안마의자",
      "밥솥",
      "선풍기",
      "프라이팬",
      "멀티탭",
      "샴푸",
      "치약",
      "생리대",
      "플레이모빌",
      "다리미",
    ],
  },
  {
    category: "meat_fish",
    keywords: [
      "삼겹",
      "돼지",
      "소고기",
      "와규",
      "불고기",
      "등심",
      "안창",
      "갈비",
      "닭",
      "치킨",
      "닭강정",
      "참치",
      "오징어",
      "새우",
      "꽃게",
      "쭈꾸미",
      "낙지",
      "꼼장어",
      "골뱅이",
      "버거",
      "만두",
      "해동",
      "육",
      "고기",
    ],
  },
  {
    category: "produce",
    keywords: [
      "딸기",
      "바나나",
      "사과",
      "오렌지",
      "포도",
      "만다린",
      "귤",
      "수박",
      "참외",
      "블루베리",
      "토마토",
      "대파",
      "호박",
      "호두",
      "나물",
      "채소",
      "샐러드",
    ],
  },
  { category: "dairy", keywords: ["치즈", "우유", "요거", "요거트", "버터", "크림"] },
  {
    category: "quick_meal",
    keywords: ["볶음밥", "부대찌개", "볶음", "라면", "컵라면", "용기", "피자", "냉동"],
  },
  { category: "staple", keywords: ["간장", "참기름", "식용유", "쌀", "계란", "달걀"] },
  {
    category: "beverage_snack",
    keywords: ["펩시", "콜라", "제로", "커피", "모카", "초콜릿", "과자", "주스"],
  },
];

function categorize(name) {
  const n = name.toLowerCase();
  for (const { category, keywords } of RULES) {
    for (const kw of keywords) {
      if (n.includes(kw.toLowerCase())) return category;
    }
  }
  return "other";
}

function stableId(parts) {
  return createHash("sha256").update(parts.join("|")).digest("hex").slice(0, 16);
}

/** Keep in sync with src/lib/extract-promo-phrases.ts */
function extractPromoPhrases(tail) {
  const cleaned = tail.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const found = new Set();

  const stripNoise = (s) =>
    s
      .replace(/※이미지컷입니다\s*$/i, "")
      .replace(/※교차구매 가능\s*$/i, "")
      .trim();

  const push = (s) => {
    const t = stripNoise(s);
    if (t.length >= 4) found.add(t);
  };

  for (const m of cleaned.matchAll(/신세계포인트 적립 시[^※]+/g)) push(m[0]);
  for (const m of cleaned.matchAll(/\d+개 이상 구매 시[^※]+/g)) push(m[0]);
  for (const m of cleaned.matchAll(/\d+팩 이상 구매 시[^※]+/g)) push(m[0]);
  for (const m of cleaned.matchAll(/\d+입 이상 구매 시[^※]+/g)) push(m[0]);
  for (const m of cleaned.matchAll(/행사카드 전액 결제 시[^※]+/g)) push(m[0]);
  for (const m of cleaned.matchAll(/\d+개\s*골라담기[^※]+/g)) push(m[0]);
  for (const m of cleaned.matchAll(/(?:\d+개\s*)?골라담기\s*\d{1,3}(?:,\d{3})*\s*원[^※]*/g))
    push(m[0]);
  for (const m of cleaned.matchAll(/1\+1(?:\s*※교차구매 가능)?/g)) push(m[0]);

  return [...found];
}

function parseLine(line, sheetLabel) {
  const m = line.match(PERIOD_RE);
  if (!m) return null;
  const name = stripHtmlFragmentToPlainText(
    line.slice(0, line.indexOf("행사기간")),
  );
  if (!name) return null;
  const periodLabel = `${m[1]} - ${m[2]}`;
  const tail = stripHtmlFragmentToPlainText(m[3] ?? "");
  const { originalWon, saleWon } = extractPrices(tail);
  const promoHighlights = extractPromoPhrases(tail);
  const category = categorize(name);
  const grams = extractGrams(name);
  const basePrice = saleWon ?? originalWon;
  const won100 =
    basePrice !== undefined && grams !== undefined && grams > 0
      ? wonPer100g(basePrice, grams)
      : undefined;

  return {
    id: stableId(["emart", sheetLabel, name, periodLabel]),
    mart: "emart",
    sheetLabel,
    name,
    periodLabel,
    originalWon,
    saleWon,
    detailTail: tail.slice(0, 280),
    promoHighlights,
    category,
    grams,
    wonPer100g: won100,
  };
}

async function main() {
  const res = await fetch(URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const products = [];

  $(".img_detail_txt").each((_, el) => {
    const sheetLabel = $(el).find("h2").first().text().trim() || "전단";
    const pHtml = $(el).find("p").first().html() ?? "";
    const lines = mergeLeafletContinuationLines(htmlParagraphToLines(pHtml));
    for (const line of lines) {
      const p = parseLine(line, sheetLabel);
      if (p) products.push(p);
    }
  });

  const outDir = path.join(ROOT, "public", "data");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "leaflet-fallback.json");
  const payload = JSON.stringify(
    { fetchedAt: new Date().toISOString(), products },
    null,
    2,
  );
  await writeFile(outPath, payload, "utf-8");
  console.log(`Wrote ${products.length} products to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
