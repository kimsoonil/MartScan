import type { ProductCardInsights } from "@/lib/product-insights";
import {
  productLooksLikeBogo,
  productLooksLikeTwoPlusOne,
} from "@/lib/filter-products";
import type { LeafletProduct } from "@/types/leaflet";

function discountPercent(original: number, sale: number): number | null {
  if (original <= 0 || sale >= original) return null;
  return Math.round(((original - sale) / original) * 100);
}

type StatPill = {
  label: string;
  value: string;
  colorClass: string;
  bgClass: string;
};

export function DealStatsBar({
  products,
  insights,
}: {
  products: LeafletProduct[];
  insights: Map<string, ProductCardInsights>;
}) {
  if (products.length === 0) return null;

  const discounted = products.filter(
    (p) =>
      p.originalWon != null &&
      p.saleWon != null &&
      p.originalWon > p.saleWon,
  );

  const pcts = discounted
    .map((p) => discountPercent(p.originalWon!, p.saleWon!))
    .filter((d): d is number => d != null);

  const bestPct = pcts.length > 0 ? Math.max(...pcts) : null;
  const avgPct =
    pcts.length > 0
      ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
      : null;

  const bogoCount = products.filter(productLooksLikeBogo).length;
  const twoPlusOneCount = products.filter(productLooksLikeTwoPlusOne).length;
  const megaDealCount = products.filter(
    (p) => insights.get(p.id)?.megaDeal,
  ).length;

  const pills: (StatPill | null)[] = [
    discounted.length > 0
      ? {
          label: "할인상품",
          value: `${discounted.length}개`,
          colorClass: "text-emerald-700 dark:text-emerald-400",
          bgClass: "bg-emerald-50 dark:bg-emerald-950/50",
        }
      : null,
    bestPct != null
      ? {
          label: "최고할인",
          value: `${bestPct}%`,
          colorClass: "text-red-700 dark:text-red-400",
          bgClass: "bg-red-50 dark:bg-red-950/50",
        }
      : null,
    avgPct != null
      ? {
          label: "평균할인",
          value: `${avgPct}%`,
          colorClass: "text-orange-700 dark:text-orange-400",
          bgClass: "bg-orange-50 dark:bg-orange-950/50",
        }
      : null,
    bogoCount > 0
      ? {
          label: "1+1",
          value: `${bogoCount}개`,
          colorClass: "text-violet-700 dark:text-violet-400",
          bgClass: "bg-violet-50 dark:bg-violet-950/50",
        }
      : null,
    twoPlusOneCount > 0
      ? {
          label: "2+1",
          value: `${twoPlusOneCount}개`,
          colorClass: "text-fuchsia-700 dark:text-fuchsia-400",
          bgClass: "bg-fuchsia-50 dark:bg-fuchsia-950/50",
        }
      : null,
    megaDealCount > 0
      ? {
          label: "역대급",
          value: `${megaDealCount}개`,
          colorClass: "text-rose-700 dark:text-rose-400",
          bgClass: "bg-rose-50 dark:bg-rose-950/50",
        }
      : null,
  ];

  const activePills = pills.filter((p): p is StatPill => p !== null);
  if (activePills.length === 0) return null;

  return (
    <div
      className="mb-3 flex flex-wrap gap-1.5"
      aria-label="이번 전단 할인 현황"
    >
      {activePills.map((pill, i) => (
        <div
          key={i}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${pill.bgClass} ${pill.colorClass}`}
        >
          <span className="font-normal opacity-70">{pill.label}</span>
          <span>{pill.value}</span>
        </div>
      ))}
    </div>
  );
}
