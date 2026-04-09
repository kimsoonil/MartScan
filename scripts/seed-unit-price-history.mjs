/**
 * public/data/*-fallback.json 과 현재 minByKey를 합쳐 unit-price-history.json 갱신.
 * 주 1회 또는 fallback 갱신 후 실행해 역대 최저 단가 추정치를 쌓을 수 있습니다.
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

function loadExistingMins() {
  if (!fs.existsSync(outPath)) return {};
  try {
    const j = JSON.parse(fs.readFileSync(outPath, "utf8"));
    return j.minByKey && typeof j.minByKey === "object" ? { ...j.minByKey } : {};
  } catch {
    return {};
  }
}

const mins = loadExistingMins();

function merge(products, mart) {
  for (const p of products) {
    const u = unitForProduct(p);
    if (u == null) continue;
    const m = (p.mart ?? mart);
    const k = key(m, p.category, p.name);
    if (mins[k] == null || u < mins[k]) mins[k] = u;
  }
}

merge(loadProducts("leaflet-fallback.json"), "emart");
merge(loadProducts("homeplus-fallback.json"), "homeplus");

const out = {
  updatedAt: new Date().toISOString(),
  note: "minByKey: 마트|카테고리|정규화상품명 → 관측된 최소 100g당 원. seed 스크립트로 갱신.",
  minByKey: mins,
};

fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote ${Object.keys(mins).length} keys → ${outPath}`);
