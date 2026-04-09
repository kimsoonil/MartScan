import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { FETCH_HEADERS, HOMEPLUS_LEAFLET_URL } from "../src/lib/constants";
import { parseHomeplusLeafletHtml } from "../src/lib/parse-homeplus-leaflet";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function main() {
  const res = await fetch(HOMEPLUS_LEAFLET_URL, {
    headers: { ...FETCH_HEADERS },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const products = parseHomeplusLeafletHtml(html);
  const outDir = path.join(ROOT, "public", "data");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "homeplus-fallback.json");
  await writeFile(
    outPath,
    JSON.stringify(
      { fetchedAt: new Date().toISOString(), products },
      null,
      2,
    ),
    "utf-8",
  );
  console.log(`Wrote ${products.length} homeplus products to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
