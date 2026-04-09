import {
  FETCH_HEADERS,
  HOMEPLUS_LEAFLET_URL,
  LEAFLET_FETCH_CACHE_TAG,
} from "@/lib/constants";

import { parseHomeplusLeafletHtml } from "./parse-homeplus-leaflet";

export async function fetchHomeplusLeafletProducts() {
  const res = await fetch(HOMEPLUS_LEAFLET_URL, {
    headers: { ...FETCH_HEADERS },
    next: { revalidate: 86400, tags: [LEAFLET_FETCH_CACHE_TAG] },
  });

  if (!res.ok) {
    throw new Error(`Homeplus leaflet HTTP ${res.status}`);
  }

  const html = await res.text();
  const products = parseHomeplusLeafletHtml(html);
  if (products.length === 0) {
    throw new Error("Empty homeplus leaflet parse result");
  }
  return products;
}
