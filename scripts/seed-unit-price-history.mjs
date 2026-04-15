/**
 * public/data/*-fallback.json 과 현재 minByKey를 합쳐 unit-price-history.json 갱신.
 * 주 1회 또는 fallback 갱신 후 실행해 역대 최저 단가 추정치를 쌓을 수 있습니다.
 * weeklyHistory에 주간 스냅샷도 함께 누적합니다.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "public", "data");
const outPath = path.join(dataDir, "unit-price-history.json");

function norm(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^0-9a-z\uAC00-\uD7A3]+/gi, "")
    .slice(0, 28);
}

function key(mart, cat, name) {
  return `${mart}|${cat}|${norm(name)}`;
}

function wonPer100g(totalWon, grams) {
  if (grams <= 0) return null;
  return Math.round((totalWon / grams) * 100);
}

function unitForProduct(p) {
  if (p.wonPer100g != null) return p.wonPer100g;
  const won = p.saleWon ?? p.originalWon;
  const g = p.grams;
  if (won == null || g == null || g <= 0) return null;
  return wonPer100g(won, g);
}

function loadProducts(filename) {
  const fp = path.join(dataDir, filename);
  if (!fs.existsSync(fp)) return [];
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  return Array.isArray(j.products) ? j.products : [];
}

function loadExisting() {
  if (!fs.existsSync(outPath)) return { mins: {}, weekly: {} };
  try {
    const j = JSON.parse(fs.readFileSync(outPath, "utf8"));
    return {
      mins: j.minByKey && typeof j.minByKey === "object" ? { ...j.minByKey } : {},
      weekly: j.weeklyHistory && typeof j.weeklyHistory === "object" ? { ...j.weeklyHistory } : {},
    };
  } catch {
    return { mins: {}, weekly: {} };
  }
}

/** ISO 주차 문자열: "2026-W15" */
function isoWeek(d = new Date()) {
  const target = new Date(d.valueOf());
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const jan4 = new Date(target.getFullYear(), 0, 4);
  const dayOfYear = Math.round((target - jan4) / 86400000) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

const MAX_WEEKLY_ENTRIES = 12;

const { mins, weekly } = loadExisting();

function appendWeekly(k, unitPrice) {
  if (!weekly[k]) weekly[k] = [];
  const currentWeek = isoWeek();
  const existing = weekly[k].findIndex((e) => e.week === currentWeek);
  if (existing >= 0) {
    weekly[k][existing].wonPer100g = unitPrice;
  } else {
    weekly[k].push({ week: currentWeek, wonPer100g: unitPrice });
  }
  if (weekly[k].length > MAX_WEEKLY_ENTRIES) {
    weekly[k] = weekly[k].slice(-MAX_WEEKLY_ENTRIES);
  }
}

function merge(products, mart) {
  for (const p of products) {
    const u = unitForProduct(p);
    if (u == null) continue;
    const m = p.mart ?? mart;
    const k = key(m, p.category, p.name);
    if (mins[k] == null || u < mins[k]) mins[k] = u;
    appendWeekly(k, u);
  }
}

merge(loadProducts("leaflet-fallback.json"), "emart");
merge(loadProducts("homeplus-fallback.json"), "homeplus");
merge(loadProducts("lottemart-fallback.json"), "lottemart");

const out = {
  updatedAt: new Date().toISOString(),
  note: "minByKey: 마트|카테고리|정규화상품명 → 관측된 최소 100g당 원. weeklyHistory: 주간 단가 스냅샷(최대 12주). seed 스크립트로 갱신.",
  minByKey: mins,
  weeklyHistory: weekly,
};

fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(
  `Wrote ${Object.keys(mins).length} min keys, ${Object.keys(weekly).length} weekly keys → ${outPath}`,
);
