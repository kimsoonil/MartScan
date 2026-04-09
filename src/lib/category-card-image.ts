import type { ProductCategory } from "@/types/leaflet";

/**
 * 상품 카드 상단 히어로 이미지 (`public` 기준 경로).
 * 값이 null이면 그라데이션·이모지 폴백.
 */
export const CATEGORY_CARD_IMAGE: Record<ProductCategory, string | null> = {
  meat_fish: "/images/categories/meat-fish.png",
  produce: "/images/categories/produce.png",
  dairy: "/images/categories/dairy.png",
  quick_meal: "/images/categories/quick-meal.png",
  staple: "/images/categories/staple.png",
  beverage_snack: "/images/categories/beverage-snack.png",
  other: "/images/categories/other.png",
};
