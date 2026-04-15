/** 이마트 앱 웹 전단(접근성용 숨김 텍스트 포함). 운영 시 이용약관·로봇 배제 정책을 확인하세요. */
export const EMART_LEAFLET_URL =
  process.env.LEAFLET_SOURCE_URL ??
  "https://eapp.emart.com/leaflet/leafletView_EL.do?trcknCode=leafletMainBanner";

/** 마이홈플러스 종이 전단([공개 페이지](https://my.homeplus.co.kr/leaflet)). 매장·쿠키에 따라 HTML이 달라질 수 있습니다. */
export const HOMEPLUS_LEAFLET_URL =
  process.env.HOMEPLUS_LEAFLET_URL ?? "https://my.homeplus.co.kr/leaflet";

/** 롯데마트 제타 BIG SALE(프로모션) 페이지. SSR HTML에서 상품 카드를 파싱합니다. */
export const LOTTEMART_LEAFLET_URL =
  process.env.LOTTEMART_LEAFLET_URL ?? "https://lottemartzetta.com/promotions";

export const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; MartScan/1.0; +https://github.com/) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "ko-KR,ko;q=0.9",
} as const;

/** `fetch` Data Cache 무효화용(자정 재조회 등). */
export const LEAFLET_FETCH_CACHE_TAG = "martscan-leaflet-fetch";
