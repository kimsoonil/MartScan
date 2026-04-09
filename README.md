# MartScan — 오늘의 마트 할인

- **이마트**: 앱 웹 전단([전단 보기](https://eapp.emart.com/leaflet/leafletView_EL.do?trcknCode=leafletMainBanner))의 접근성 텍스트(`.img_detail_txt`)를 파싱합니다.
- **홈플러스**: [마이홈플러스 종이 전단](https://my.homeplus.co.kr/leaflet) HTML의 `.altText`를 `N번째 상품입니다.` 단위로 나눈 뒤, **짧은 제목 + 문장별 상세**로 다시 정리합니다(이마트와 같이 텍스트 중심).

상단 탭으로 마트를 바꿀 수 있는 Next.js 데모입니다.

## 가능한 것

- **상품 리스트화**: 전단 면별 `<p>` 텍스트를 줄 단위로 합치고, `행사기간 : …` 패턴으로 이름·기간·가격을 파싱합니다. (OCR 없이 텍스트만 사용)
- **조건부 할인 강조**: `신세계포인트 적립 시 …`, `N개 이상 구매 시 …`, `1+1` 등 전단 꼬리 문구를 뽑아 카드에서 따로 강조합니다.
- **카테고리 필터**: 정육·수산, 과일·채소 등 키워드로 분류해 탭에서 좁혀 볼 수 있습니다.
- **100g당 가격**: 상품명에 `600g`, `(100g`, `1.4kg` 같은 표기가 있을 때만 대략 환산합니다.
- **백업 데이터**: 이마트는 `public/data/leaflet-fallback.json`, 홈플러스는 `public/data/homeplus-fallback.json`을 사용합니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 전단 백업 JSON 갱신 (주간 등)

로컬 또는 스케줄러에서 이마트 페이지를 한 번 긁어와 백업 파일을 덮어씁니다.

```bash
npm run refresh-fallback
npm run refresh-homeplus-fallback
```

`LEAFLET_SOURCE_URL`, `HOMEPLUS_LEAFLET_URL`로 URL을 바꿀 수 있습니다(동일 HTML 구조 가정). 예시는 `.env.example` 참고.

## 주의 (법적·운영)

- 전단 이미지·문구의 **저작권은 이마트·홈플러스 등 원 권리자**에게 있습니다. 상업 서비스 전 약관·로봇 배제 정책을 확인하세요.
- 자동 수집 시 **요청 간격·트래픽**을 과도하게 두지 마세요.
- 파싱은 휴리스틱이라 **가격·조건은 항상 공식 전단·매장 안내를 우선**해야 합니다.

## 스택

Next.js 16 (App Router), React 19, Tailwind CSS 4, Cheerio, Zod.
