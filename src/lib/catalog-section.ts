import type { ProductCategory } from "@/types/leaflet";

/** 상단 탭: 전체 / 정육 / 신선 / 가공 / 생필품 */
export type CatalogSection = "all" | "meat" | "fresh" | "processed" | "household";

const MEAT: ProductCategory[] = ["meat_fish"];
const FRESH: ProductCategory[] = ["produce", "dairy"];
const PROCESSED: ProductCategory[] = ["quick_meal", "beverage_snack"];
const HOUSEHOLD: ProductCategory[] = ["staple", "other"];

export const CATALOG_SECTION_LABELS: { id: CatalogSection; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "meat", label: "정육" },
  { id: "fresh", label: "신선" },
  { id: "processed", label: "가공" },
  { id: "household", label: "생필품" },
];

export function catalogSectionCategories(
  section: CatalogSection,
): readonly ProductCategory[] | null {
  switch (section) {
    case "all":
      return null;
    case "meat":
      return MEAT;
    case "fresh":
      return FRESH;
    case "processed":
      return PROCESSED;
    case "household":
      return HOUSEHOLD;
    default:
      return null;
  }
}

export function parseCatalogSection(raw: string | undefined): CatalogSection {
  const r = raw?.toLowerCase();
  if (r === "meat" || r === "meat_fish") return "meat";
  if (r === "fresh") return "fresh";
  if (r === "processed") return "processed";
  if (r === "household") return "household";
  return "all";
}

export function filterProductsByCatalogSection<T extends { category: ProductCategory }>(
  products: T[],
  section: CatalogSection,
): T[] {
  const allowed = catalogSectionCategories(section);
  if (allowed == null) return products;
  const set = new Set(allowed);
  return products.filter((p) => set.has(p.category));
}

export function productCategoryAllowedInSection(
  category: ProductCategory,
  section: CatalogSection,
): boolean {
  const allowed = catalogSectionCategories(section);
  if (allowed == null) return true;
  return allowed.includes(category);
}

export function leafCategoryOptionsForSection(
  section: CatalogSection,
): ("all" | ProductCategory)[] {
  if (section === "all") {
    return [
      "all",
      "meat_fish",
      "produce",
      "dairy",
      "quick_meal",
      "staple",
      "beverage_snack",
      "other",
    ];
  }
  const cats = catalogSectionCategories(section);
  if (cats == null) return ["all"];
  return ["all", ...cats];
}
