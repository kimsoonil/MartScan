import { MartChainTabs } from "@/components/mart-chain-tabs";
import { MartHeader } from "@/components/mart-header";
import { LeafletMetaBar } from "@/components/leaflet-meta-bar";
import { LeafletToolbar } from "@/components/leaflet-toolbar";
import { ProductCard } from "@/components/product-card";
import {
  buildCategoryCounts,
  buildDealFilterCounts,
  filterLeafletProducts,
  parseDealFilterParams,
  parseSearchFromParams,
  sortDealsFirst,
} from "@/lib/filter-products";
import { getLeafletProducts } from "@/lib/get-leaflet-products";
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

function parseCategory(raw: string | undefined): "all" | ProductCategory {
  if (!raw || raw === "all") return "all";
  if (CATEGORIES.has(raw as ProductCategory)) return raw as ProductCategory;
  return "all";
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
  }>;
}) {
  const sp = await searchParams;
  const mart = parseMart(sp.mart);
  const category = parseCategory(sp.cat);
  const deal = parseDealFilterParams(sp);
  const search = parseSearchFromParams(sp.q);

  const result = await getLeafletProducts(mart);
  const filtered = sortDealsFirst(
    filterLeafletProducts(result.products, { category, deal, search }),
  );
  const counts = buildCategoryCounts(result.products);
  const dealCounts = buildDealFilterCounts(result.products, category);

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      <MartHeader />
      <MartChainTabs
        active={mart}
        category={category}
        deal={deal}
        search={search}
      />
      <LeafletToolbar
        mart={mart}
        category={category}
        counts={counts}
        deal={deal}
        dealCounts={dealCounts}
        search={search}
      />
      <LeafletMetaBar
        mart={result.mart}
        source={result.source}
        fetchedAt={result.fetchedAt}
        totalParsed={result.products.length}
        visibleCount={filtered.length}
        error={result.error}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-2">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            {search.trim() ? (
              <>
                검색어와 필터 조건에 맞는 상품이 없습니다. 검색어를 줄이거나
                「초기화」로 조건을 바꿔 보세요.
              </>
            ) : (
              <>표시할 상품이 없습니다. 필터를 바꾸거나 잠시 후 다시 시도해 주세요.</>
            )}
          </p>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <li key={p.id} className="min-w-0">
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
        <footer className="mt-12 border-t border-zinc-200 pt-8 text-center text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          {mart === "emart" ? (
            <p>
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
            <p>
              홈플러스 데이터는{" "}
              <a
                href="https://my.homeplus.co.kr/leaflet"
                className="text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                마이홈플러스 종이 전단
              </a>
              페이지의 대체텍스트를 파싱합니다. 매장·지역에 따라 전단 내용이 다를 수 있으며, 가격은
              한글 음성 안내 문구가 많아 숫자 표기가 없을 수 있습니다.
            </p>
          )}
          <p className="mt-2">대량 자동 수집은 각 사이트 정책을 확인한 뒤 진행하세요.</p>
        </footer>
      </main>
    </div>
  );
}
