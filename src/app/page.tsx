import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CatalogSortBar } from "@/components/catalog-sort-bar";
import { DealStatsBar } from "@/components/deal-stats-bar";
import { LeafletMetaBar } from "@/components/leaflet-meta-bar";
import { MartHeader } from "@/components/mart-header";
import { NativeAdSlotPlaceholder } from "@/components/native-ad-slot-placeholder";
import { ProductCard } from "@/components/product-card";
import { ScrollToProductOnQuery } from "@/components/scroll-to-product-on-query";
import { ScrollToTopFab } from "@/components/scroll-to-top-fab";
import { SidebarFilterPanels } from "@/components/sidebar-filter-panels";
import { TopBarShell } from "@/components/top-bar-shell";
import type { CatalogSection } from "@/lib/catalog-section";
import {
  filterProductsByCatalogSection,
  parseCatalogSection,
  productCategoryAllowedInSection,
} from "@/lib/catalog-section";
import {
  applyCatalogSort,
  buildCategoryCounts,
  buildDealFilterCounts,
  catalogPath,
  filterLeafletProducts,
  type CatalogQuery,
  parseCatalogSort,
  parseDealFilterParams,
  parseSearchFromParams,
} from "@/lib/filter-products";
import { getLeafletProducts } from "@/lib/get-leaflet-products";
import {
  buildProductInsights,
  loadUnitPriceHistory,
} from "@/lib/product-insights";
import type { MartId, ProductCategory } from "@/types/leaflet";

const ALL_MARTS: MartId[] = ["emart", "homeplus", "lottemart"];

/** 전단은 자정 재조회·태그 무효화와 맞춰 최대 하루 단위 캐시 */
export const revalidate = 86400;

const CATEGORIES = new Set<ProductCategory>([
  "meat_fish",
  "produce",
  "dairy",
  "quick_meal",
  "staple",
  "beverage_snack",
  "other",
]);

function parseCategory(
  raw: string | undefined,
  section: CatalogSection,
): "all" | ProductCategory {
  if (!raw || raw === "all") return "all";
  if (!CATEGORIES.has(raw as ProductCategory)) return "all";
  const c = raw as ProductCategory;
  if (!productCategoryAllowedInSection(c, section)) return "all";
  return c;
}

function parseMart(raw: string | undefined): MartId {
  if (raw === "homeplus") return "homeplus";
  if (raw === "lottemart") return "lottemart";
  return "emart";
}

const MART_NAME: Record<MartId, string> = {
  emart: "이마트",
  homeplus: "홈플러스",
  lottemart: "롯데마트",
};

function koreanWeekLabelOfMonth(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekOfMonth = Math.min(Math.max(1, Math.ceil(day / 7)), 5);
  const words = ["첫", "둘", "셋", "넷", "다섯"];
  return `${month}월 ${words[weekOfMonth - 1]}주차`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ mart?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const mart = parseMart(sp.mart);
  const martName = MART_NAME[mart];
  const wk = koreanWeekLabelOfMonth(new Date());
  const title = `[${wk}] ${martName} 전단 할인 품목 요약 | MartScan`;
  const description = `${wk} ${martName} 전단 기준 할인 상품·100g당 가격 비교. 조건부 할인·1+1·카드행사를 한눈에 정리합니다.`;
  return {
    title,
    description,
    keywords: [
      "마트 전단",
      "할인",
      martName,
      wk,
      "100g당 가격",
      "1+1",
      "MartScan",
    ],
    openGraph: {
      title,
      description,
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: string;
    mart?: string;
    p?: string;
    disc?: string;
    q?: string;
    sec?: string;
    sort?: string;
    solo?: string;
  }>;
}) {
  const sp = await searchParams;
  const mart = parseMart(sp.mart);
  const section = parseCatalogSection(sp.sec);
  const category = parseCategory(sp.cat, section);
  const deal = parseDealFilterParams(sp);
  const search = parseSearchFromParams(sp.q);
  const sort = parseCatalogSort(sp.sort);

  const otherMarts = ALL_MARTS.filter((m) => m !== mart);

  const [result, ...otherResults] = await Promise.all([
    getLeafletProducts(mart),
    ...otherMarts.map(getLeafletProducts),
  ]);
  const history = await loadUnitPriceHistory();
  const allOtherProducts = otherResults.flatMap((r) => r.products);

  const scoped = filterProductsByCatalogSection(result.products, section);
  const counts = buildCategoryCounts(scoped);
  const dealCounts = buildDealFilterCounts(scoped, category);

  const filtered = applyCatalogSort(
    filterLeafletProducts(result.products, {
      category,
      deal,
      search,
      section,
    }),
    sort,
  );

  const insights = buildProductInsights(
    result.products,
    allOtherProducts,
    mart,
    history.minByKey,
    history.weeklyHistory,
  );

  const tryOtherMartHrefs = otherMarts.map((m) => ({
    mart: m,
    href: catalogPath({ mart: m, section, category, deal, search, sort }),
  }));

  const pathBase = {
    category,
    deal,
    search,
    section,
    sort,
  };

  const emartHref = catalogPath({ ...pathBase, mart: "emart" });
  const homeplusHref = catalogPath({ ...pathBase, mart: "homeplus" });
  const lotteMartHref = catalogPath({ ...pathBase, mart: "lottemart" });

  const sidebarProps = {
    mart,
    section,
    category,
    deal,
    search,
    sort,
    counts,
    dealCounts,
  };

  const catalogQuery: CatalogQuery = {
    mart,
    section,
    category,
    deal,
    search,
    sort,
  };

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      <MartHeader />
      <Suspense
        fallback={
          <div
            className="sticky top-0 z-40 flex h-16 items-center border-b border-zinc-200 bg-zinc-100 px-4 dark:border-zinc-800 dark:bg-zinc-900"
            aria-hidden
          />
        }
      >
        <TopBarShell
          emartHref={emartHref}
          homeplusHref={homeplusHref}
          lotteMartHref={lotteMartHref}
          activeMart={mart}
          defaultQuery={search}
        >
          <SidebarFilterPanels {...sidebarProps} />
        </TopBarShell>
      </Suspense>

      <div className="flex min-h-0 flex-1 min-w-0">
        <aside
          className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto overscroll-contain border-r border-zinc-200 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/90 lg:block"
          aria-label="필터"
        >
          <SidebarFilterPanels {...sidebarProps} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-0 md:pb-16">
            <div className="sticky top-14 z-30 -mx-4 mb-4 border-b border-zinc-200/90 bg-zinc-50/95 px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)] sm:top-16">
              <LeafletMetaBar
                mart={result.mart}
                source={result.source}
                fetchedAt={result.fetchedAt}
                totalParsed={result.products.length}
                visibleCount={filtered.length}
                error={result.error}
              />
              {filtered.length > 0 ? (
                <CatalogSortBar query={catalogQuery} variant="strip" />
              ) : null}
            </div>
            <Suspense fallback={null}>
              <ScrollToProductOnQuery />
            </Suspense>
            {filtered.length > 0 ? (
              <DealStatsBar products={filtered} insights={insights} />
            ) : null}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-zinc-600 dark:text-zinc-400">
                  {search.trim() ? (
                    <>
                      검색어와 필터 조건에 맞는 상품이 없습니다. 검색어를 줄이거나
                      「초기화」로 조건을 바꿔 보세요.
                    </>
                  ) : (
                    <>표시할 상품이 없습니다. 필터를 바꾸거나 잠시 후 다시 시도해 주세요.</>
                  )}
                </p>
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
                  찾으시는 상품이 없나요?{" "}
                  {tryOtherMartHrefs.map(({ mart: m, href }, i) => (
                    <span key={m}>
                      {i > 0 ? " · " : ""}
                      <Link
                        href={href}
                        className="font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                      >
                        {MART_NAME[m]} 전단에서 찾아보기
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.flatMap((p, i) => {
                    const cells = [
                      <li key={p.id} className="min-w-0">
                        <ProductCard product={p} insights={insights.get(p.id)} />
                      </li>,
                    ];
                    if ((i + 1) % 10 === 0) {
                      cells.push(
                        <NativeAdSlotPlaceholder
                          key={`ad-slot-${i}`}
                          afterIndex={i + 1}
                        />,
                      );
                    }
                    return cells;
                  })}
                </ul>
            )}
            <footer className="mt-12 border-t border-zinc-200 pt-8 text-center text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              <p>
                100g당 가격은 전단 문구에서 읽은 중량·가격으로 자동 계산한 참고값입니다. 「역대급
                할인」은 로컬에 쌓인 최저 단가 이력·타 마트 전단 비교·이번 전단 내 최저 단가 등을
                조합한 추정이며, 실제 매장 행사와 다를 수 있습니다.
              </p>
              {mart === "emart" ? (
                <p className="mt-3">
                  본 서비스는 이마트 공개 웹 전단의 접근성용 텍스트를 자동 분류한 데모입니다. 실제
                  가격·행사 조건은 매장 및{" "}
                  <a
                    href="https://eapp.emart.com/leaflet/leafletView_EL.do?trcknCode=leafletMainBanner"
                    className="text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    이마트 공식 전단
                  </a>
                  을 기준으로 하세요.
                </p>
              ) : mart === "homeplus" ? (
                <p className="mt-3">
                  홈플러스 데이터는{" "}
                  <a
                    href="https://my.homeplus.co.kr/leaflet"
                    className="text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    마이홈플러스 종이 전단
                  </a>
                  페이지의 대체텍스트를 파싱합니다. 매장·지역에 따라 전단 내용이 다를 수 있으며,
                  가격은 한글 음성 안내 문구가 많아 숫자 표기가 없을 수 있습니다.
                </p>
              ) : (
                <p className="mt-3">
                  롯데마트 데이터는{" "}
                  <a
                    href="https://lottemartzetta.com/promotions"
                    className="text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    롯데마트 제타 BIG SALE
                  </a>
                  페이지의 상품 카드를 파싱합니다. 온라인 전용 행사가 포함될 수 있으며,
                  오프라인 매장 가격과 다를 수 있습니다.
                </p>
              )}
              <p className="mt-2">대량 자동 수집은 각 사이트 정책을 확인한 뒤 진행하세요.</p>
            </footer>
          </main>
        </div>
      </div>
      <ScrollToTopFab />
    </div>
  );
}
