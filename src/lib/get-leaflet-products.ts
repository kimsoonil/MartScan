import { readFile } from "fs/promises";
import path from "path";

import { z } from "zod";

import type { LeafletFetchResult, LeafletProduct, MartId } from "@/types/leaflet";

import { fetchEmartLeafletProducts } from "./fetch-emart-leaflet";
import { fetchHomeplusLeafletProducts } from "./fetch-homeplus-leaflet";
import { stripHtmlFragmentToPlainText } from "./html-to-lines";

function sanitizeLeafletProduct(p: LeafletProduct): LeafletProduct {
  return {
    ...p,
    name: stripHtmlFragmentToPlainText(p.name),
    periodLabel: stripHtmlFragmentToPlainText(p.periodLabel),
    detailTail: stripHtmlFragmentToPlainText(p.detailTail),
    ...(p.promoHighlights?.length && {
      promoHighlights: p.promoHighlights.map(stripHtmlFragmentToPlainText),
    }),
    ...(p.detailLines?.length && {
      detailLines: p.detailLines.map(stripHtmlFragmentToPlainText),
    }),
  };
}

const FallbackSchema = z.object({
  fetchedAt: z.string(),
  products: z.array(z.record(z.string(), z.unknown())),
});

async function loadFallback(mart: MartId): Promise<{
  products: LeafletProduct[];
  fetchedAt: string;
} | null> {
  const name =
    mart === "homeplus" ? "homeplus-fallback.json" : "leaflet-fallback.json";
  const file = path.join(process.cwd(), "public", "data", name);
  try {
    const raw = await readFile(file, "utf-8");
    const parsed = FallbackSchema.parse(JSON.parse(raw));
    const products = (parsed.products as LeafletProduct[]).map((p) =>
      sanitizeLeafletProduct({
        ...p,
        mart: (p.mart ?? mart) as MartId,
      }),
    );
    return {
      fetchedAt: parsed.fetchedAt,
      products,
    };
  } catch {
    return null;
  }
}

export async function getLeafletProducts(mart: MartId): Promise<LeafletFetchResult> {
  try {
    const products =
      mart === "homeplus"
        ? await fetchHomeplusLeafletProducts()
        : await fetchEmartLeafletProducts();

    if (products.length === 0) {
      throw new Error("Empty leaflet parse result");
    }

    return {
      products: products.map(sanitizeLeafletProduct),
      source: "live",
      fetchedAt: new Date().toISOString(),
      mart,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const fb = await loadFallback(mart);
    if (fb) {
      return {
        products: fb.products,
        source: "fallback",
        fetchedAt: fb.fetchedAt,
        error: message,
        mart,
      };
    }
    return {
      products: [],
      source: "fallback",
      fetchedAt: new Date().toISOString(),
      error: message,
      mart,
    };
  }
}
