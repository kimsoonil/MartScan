import Link from "next/link";
import { Suspense } from "react";

import { LeafletMetaBar } from "@/components/leaflet-meta-bar";
import { MartHeader } from "@/components/mart-header";
import { ProductCard } from "@/components/product-card";
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
  parseCatalogSort,
  parseDealFilterParams,
  parseSearchFromParams,
} from "@/lib/filter-products";
import { getLeafletProducts } from "@/lib/get-leaflet-products";
import {
  buildProductInsights,
  loadUnitPriceHistoryMinByKey,
} from "@/lib/product-insights";
import type { MartId, ProductCategory } from "@/types/leaflet";

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
  return raw === "homeplus" ? "homeplus" : "emart";
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
  }>;
}) {
  const sp = await searchParams;
  const mart = parseMart(sp.mart);
  const section = parseCatalogSection(sp.sec);
  const category = parseCategory(sp.cat, section);
  const deal = parseDealFilterParams(sp);
  const search = parseSearchFromParams(sp.q);
  const sort = parseCatalogSort(sp.sort);

  const otherMart: MartId = mart === "emart" ? "homeplus" : "emart";

  const [result, otherResult, historyMins] = await Promise.all([
    getLeafletProducts(mart),
    getLeafletProducts(otherMart),
    loadUnitPriceHistoryMinByKey(),
  ]);

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
    otherResult.products,
    mart,
    historyMins,
  );

  const tryOtherMartHref = catalogPath({
    mart: otherMart,
    section,
    category,
    deal,
    search,
    sort,
  });

  const pathBase = {
    category,
    deal,
    search,
    section,
    sort,
  };

  const emartHref = catalogPath({ ...pathBase, mart: "emart" });
  const homeplusHref = catalogPath({ ...pathBase, mart: "homeplus" });

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
          <LeafletMetaBar
            mart={result.mart}
            source={result.source}
            fetchedAt={result.fetchedAt}
            totalParsed={result.products.length}
            visibleCount={filtered.length}
            error={result.error}
          />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-2 md:pb-16">
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
                  <Link
                    href={tryOtherMartHref}
                    className="font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                  >
                    {otherMart === "emart" ? "이마트" : "홈플러스"} 전단에서 찾아보기
                  </Link>
                </p>
              </div>
            ) : (
              <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <li key={p.id} className="min-w-0">
                    <ProductCard product={p} insights={insights.get(p.id)} />
                  </li>
                ))}
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
              ) : (
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
