import type { WeeklyPriceEntry } from "@/lib/product-insights";

const W = 80;
const H = 28;
const PAD = 3;

/** 순수 SVG 스파크라인 — 서버 컴포넌트, 외부 라이브러리 없음 */
export function PriceTrendSparkline({ data }: { data: WeeklyPriceEntry[] }) {
  if (data.length < 2) return null;

  const prices = data.map((d) => d.wonPer100g);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const xs = data.map((_, i) => PAD + (i / (data.length - 1)) * (W - PAD * 2));
  const ys = prices.map(
    (p) => H - PAD - ((p - min) / range) * (H - PAD * 2),
  );

  const points = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const isDowntrend = prices[prices.length - 1] <= prices[0];
  const color = isDowntrend ? "#10b981" : "#ef4444";

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-label="가격 추이"
      className="inline-block align-middle"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xs[xs.length - 1].toFixed(1)}
        cy={ys[ys.length - 1].toFixed(1)}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}
