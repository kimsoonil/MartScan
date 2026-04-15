export type MartId = "emart" | "homeplus" | "lottemart";

export type ProductCategory =
  | "meat_fish"
  | "produce"
  | "dairy"
  | "quick_meal"
  | "staple"
  | "beverage_snack"
  | "other";

export type LeafletProduct = {
  id: string;
  mart: MartId;
  sheetLabel: string;
  name: string;
  periodLabel: string;
  /** 원가(할인 전) — 있을 때만 */
  originalWon?: number;
  /** 판매가·행사가 */
  saleWon?: number;
  detailTail: string;
  /** 홈플러스 등: 문장 단위 본문(카드에 목록으로 표시) */
  detailLines?: string[];
  /** 조건부 할인·행사 문구(신세계포인트, N개 이상 구매 등) */
  promoHighlights?: string[];
  category: ProductCategory;
  /** 이마트 전단 앱에서 파싱한 상품 이미지 URL */
  imageUrl?: string;
  /** 파싱된 중량(g). 없으면 단위가 계산 불가 */
  grams?: number;
  /** 100g당 원가(추정) */
  wonPer100g?: number;
};

export type LeafletFetchResult = {
  products: LeafletProduct[];
  source: "live" | "fallback";
  fetchedAt: string;
  error?: string;
  mart: MartId;
};
