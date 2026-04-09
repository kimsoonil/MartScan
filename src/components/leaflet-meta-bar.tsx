import { EMART_LEAFLET_URL, HOMEPLUS_LEAFLET_URL } from "@/lib/constants";
import type { MartId } from "@/types/leaflet";

import { LeafletEmbedDialog } from "./leaflet-embed-dialog";

type Props = {
  mart: MartId;
  source: "live" | "fallback";
  fetchedAt: string;
  totalParsed: number;
  visibleCount: number;
  error?: string;
};

const MART_LABEL: Record<MartId, string> = {
  emart: "이마트 전단 페이지(실시간 파싱)",
  homeplus: "홈플러스 마이홈플러스 전단(실시간 파싱)",
};

export function LeafletMetaBar({
  mart,
  source,
  fetchedAt,
  totalParsed,
  visibleCount,
  error,
}: Props) {
  const time = new Date(fetchedAt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-3">
      <div className="flex flex-col gap-1 rounded-xl bg-zinc-100/80 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
        <p>
          데이터:{" "}
          <span className="font-medium">
            {source === "live" ? MART_LABEL[mart] : "로컬 백업 JSON"}
          </span>
          {source === "fallback" && error ? (
            <span className="ml-2 text-amber-700 dark:text-amber-400">
              (실시간 조회 실패: {error})
            </span>
          ) : null}
        </p>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          <LeafletEmbedDialog
            src={mart === "emart" ? EMART_LEAFLET_URL : HOMEPLUS_LEAFLET_URL}
            title={mart === "emart" ? "이마트 전단" : "홈플러스 전단"}
            buttonLabel="전단지보기"
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          갱신 시각 {time} · 파싱 {totalParsed}건 · 현재 목록 {visibleCount}건
        </p>
      </div>
    </div>
  );
}
