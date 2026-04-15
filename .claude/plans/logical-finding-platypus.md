# Feature A + C + E 구현 계획

## Context

MartScan은 이마트/홈플러스 전단지를 데이터화해 비교하는 사이트. 이마트 앱과의 차별점을 강화하기 위해 3가지 기능을 추가한다:
- **A**: 1인 가구 특화 필터 (소포장/소용량 필터 + 소분 냉동 추천)
- **C**: 가격 트렌드 시각화 (주간 단가 스파크라인)
- **E**: 롯데마트 통합 (3번째 마트 추가)

구현 순서: **E → A → C** (E가 타입 시스템 변경을 수반하므로 먼저)

---

## Feature E: 롯데마트 통합

롯데마트는 `lottemartzetta.com/promotions`(BIG SALE)으로 전환됨. React SPA이지만 `__INITIAL_STATE__` JSON과 Schema.org ItemList가 HTML에 포함되어 있어 cheerio로 초기 상태 추출 가능. 상품 카드는 `.title-container`, `.promotion-container`, `.price-pack-size-container` 구조.

### E-1. 타입 확장
- **`src/types/leaflet.ts:1`** — `MartId`에 `"lottemart"` 추가

### E-2. 스크래퍼 생성
- **새 파일 `src/lib/fetch-lottemart-leaflet.ts`**
  - `lottemartzetta.com/promotions` fetch → cheerio 로드
  - `<script>` 태그에서 `__INITIAL_STATE__` JSON 파싱 시도 (가장 풍부한 데이터)
  - 실패 시 Schema.org `ItemList` + `.title-container` / `.price-pack-size-container` DOM 파싱 폴백
  - 기존 `categorizeProductName()`, `extractGrams()`, `wonPer100g()` 재사용
  - `LeafletProduct[]` 반환 (`mart: "lottemart"`)

### E-3. 폴백 파일
- **새 파일 `public/data/lottemart-fallback.json`** — `{ "fetchedAt": "...", "products": [] }` 초기 구조

### E-4. 데이터 로더 업데이트
- **`src/lib/get-leaflet-products.ts:36-62`**
  - `loadFallback()`: `"lottemart"` → `"lottemart-fallback.json"` 매핑 추가
  - `getLeafletProducts()`: `"lottemart"` 분기 추가 → `fetchLotteMartLeafletProducts()`

### E-5. 인사이트 시스템
- **`src/lib/product-insights.ts:75-80`** — `buildProductInsights()` 시그니처 변경: `otherMartProducts` → `allOtherProducts: LeafletProduct[]` (여러 마트의 상품 배열을 flat하게 받음). 내부 로직은 동일 (crossMartWin 루프가 더 큰 풀을 순회)

### E-6. 페이지 업데이트
- **`src/app/page.tsx`**
  - `parseMart()`: `"lottemart"` 인식 추가
  - `searchParams` 타입에 `solo?: string` 도 같이 추가 (Feature A 대비)
  - 데이터 페칭: `otherMart` 단일 → 나머지 모든 마트 fetch로 변경
    ```ts
    const ALL_MARTS: MartId[] = ["emart", "homeplus", "lottemart"];
    const otherMarts = ALL_MARTS.filter(m => m !== mart);
    const [result, ...otherResults] = await Promise.all([
      getLeafletProducts(mart),
      ...otherMarts.map(getLeafletProducts),
    ]);
    const historyMins = await loadUnitPriceHistoryMinByKey();
    const allOtherProducts = otherResults.flatMap(r => r.products);
    ```
  - `buildProductInsights(result.products, allOtherProducts, mart, historyMins)`
  - `lotteMartHref` 추가, `TopBarShell`에 전달
  - `generateMetadata`: `"lottemart"` → `"롯데마트"` 매핑
  - 빈 상태 안내에 `otherMart` 단일 링크 → 다른 마트 2개 링크로 변경
  - footer에 롯데마트 문구 추가

### E-7. TopBarShell 업데이트
- **`src/components/top-bar-shell.tsx`**
  - Props에 `lotteMartHref: string` 추가
  - 비활성 `<span>` → 활성 `<Link>` (이마트/홈플러스와 동일 스타일)

### E-8. 사이드바/카드 라벨
- **`src/components/sidebar-filter-panels.tsx:19-22`** — `MART_LABEL`에 `lottemart: "롯데마트"` 추가
- **`src/components/product-card.tsx:52-55`** — `MART_BADGE`에 `lottemart: "롯데마트"` 추가

### E-9. 필터 경로
- **`src/lib/filter-products.ts:65`** — `catalogPath()`는 이미 `emart`가 아닌 경우만 직렬화하므로 `"lottemart"`도 자동 처리됨. 변경 불필요.

### E-10. 히스토리 시드 스크립트
- **`scripts/seed-unit-price-history.mjs:68-69`** — `merge(loadProducts("lottemart-fallback.json"), "lottemart")` 추가

---

## Feature A: 1인 가구 특화 필터

### A-1. 소포장 감지 모듈
- **새 파일 `src/lib/solo-portion.ts`**
  - `SOLO_GRAM_THRESHOLD = 500`
  - `SOLO_KEYWORDS = ["소포장", "1인", "소용량", "미니", "1팩", "1봉", "소분"]`
  - `isSoloPortion(p: LeafletProduct): boolean` — grams ≤ 500 OR 키워드 매치
  - `shouldShowFreezingTip(p, insights): boolean` — grams > 500 AND (meat_fish | produce) AND (categoryCheapestUnit | crossMartWin)

### A-2. 필터 파라미터 확장
- **`src/lib/filter-products.ts`**
  - `DealFilterParams`에 `solo: boolean` 필드 추가
  - `parseDealFilterParams()`: `sp.solo === "1"` 파싱 추가
  - `catalogPath()`: `deal.solo` → `p.set("solo", "1")` 추가
  - `filterLeafletProducts()`: `deal.solo` → `out.filter(isSoloPortion)` 추가
  - `DealFilterCounts`에 `solo: number` 추가
  - `buildDealFilterCounts()`: `solo` 카운트 계산 추가

### A-3. 인사이트 확장
- **`src/lib/product-insights.ts`**
  - `ProductCardInsights`에 `freezingTip: boolean` 추가
  - `buildProductInsights()` 내부: `shouldShowFreezingTip()` 호출 후 결과 포함

### A-4. 페이지 업데이트
- **`src/app/page.tsx`** — `searchParams`에 `solo?: string` (E-6에서 이미 추가)

### A-5. 사이드바 UI
- **`src/components/sidebar-filter-panels.tsx`**
  - `keywordMode` 계산에 `deal.solo` 분기 추가 (bogo > solo > discount > all 우선순위)
  - 키워드 섹션에 `1인분` 칩 추가 (emerald 톤, 카운트 표시)

### A-6. 상품 카드 뱃지
- **`src/components/product-card.tsx`**
  - `defaultInsights`에 `freezingTip: false` 추가
  - 인사이트 뱃지 영역에 `소분 냉동 추천` 칩 추가 (sky 톤, ins.freezingTip일 때)

---

## Feature C: 가격 트렌드 시각화

### C-1. 히스토리 데이터 포맷 확장
- **`public/data/unit-price-history.json`** — `weeklyHistory` 필드 추가
  ```json
  {
    "updatedAt": "...",
    "minByKey": { ... },
    "weeklyHistory": {
      "emart|meat_fish|삼겹살...": [
        { "week": "2026-W15", "wonPer100g": 4980 }
      ]
    }
  }
  ```

### C-2. 시드 스크립트 확장
- **`scripts/seed-unit-price-history.mjs`**
  - `isoWeek()` 헬퍼 추가 (ISO 주차 계산)
  - 기존 `weeklyHistory` 로드
  - `merge()` 내에서 `appendWeekly(weekly, key, unitPrice)` 호출 (같은 주 데이터 덮어쓰기, 최대 12주 보관)
  - 출력 JSON에 `weeklyHistory` 포함

### C-3. 히스토리 로더 확장
- **`src/lib/product-insights.ts`**
  - `WeeklyPriceEntry` 타입 export: `{ week: string; wonPer100g: number }`
  - `loadUnitPriceHistory()` 함수 추가 (minByKey + weeklyHistory 반환)
  - 기존 `loadUnitPriceHistoryMinByKey()`는 래퍼로 유지
  - `ProductCardInsights`에 `priceHistory?: WeeklyPriceEntry[]` 추가
  - `buildProductInsights()`에 `weeklyHistory` 파라미터 추가, 각 상품에 최근 8주 데이터 첨부

### C-4. 페이지 업데이트
- **`src/app/page.tsx`**
  - `loadUnitPriceHistoryMinByKey()` → `loadUnitPriceHistory()` 로 변경
  - `buildProductInsights()`에 `weeklyHistory` 전달

### C-5. 스파크라인 컴포넌트
- **새 파일 `src/components/price-trend-sparkline.tsx`** (서버 컴포넌트)
  - 순수 인라인 SVG (80x28), 외부 라이브러리 없음
  - `WeeklyPriceEntry[]` props
  - data.length < 2이면 null 반환
  - 가격 하락 = emerald 선, 상승 = red 선
  - 마지막 포인트 강조 원

### C-6. 트렌드 모달 컴포넌트
- **새 파일 `src/components/price-trend-modal.tsx`** (`"use client"`)
  - 스파크라인을 `<button>`으로 감싸 클릭 시 `<dialog>` 열림
  - 더 큰 차트 (200x100), 주차 라벨 표시, 포인트별 `<title>` 툴팁
  - 상품명 + 현재가 표시

### C-7. 상품 카드 연동
- **`src/components/product-card.tsx`**
  - `defaultInsights`에 `priceHistory: undefined` 추가
  - 단가 라벨 아래에 `PriceTrendModal` 렌더링 (priceHistory?.length >= 2일 때)

---

## 검증 계획

1. `pnpm build` — TypeScript 컴파일 + Next.js 빌드 성공 확인
2. 로컬 `pnpm dev` → 각 마트 탭 전환 확인 (이마트/홈플러스/롯데마트)
3. `?solo=1` 파라미터로 1인분 필터 작동 확인
4. 사이드바에 1인분 칩 표시 + 카운트 확인
5. 소분 냉동 추천 뱃지가 대용량 정육 상품에 표시되는지 확인
6. `node scripts/seed-unit-price-history.mjs` 실행 후 weeklyHistory 필드 생성 확인
7. (초기에는 weeklyHistory가 비어있어 스파크라인 미표시 — 정상)
