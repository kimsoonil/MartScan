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
  emart: "이마트 전단(실시간 파싱)",
  homeplus: "홈플러스 전단(실시간 파싱)",
};

/**
 * 메인 열 상단 스트립 — 전체 가로 폭 활용, 한 줄에 가깝게 정보 밀도 정리
 */
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs leading-snug text-zinc-700 dark:text-zinc-300 sm:text-sm">
          <span className="font-semibold text-zinc-500 dark:text-zinc-400">
            데이터
          </span>{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-100">
            {source === "live" ? MART_LABEL[mart] : "로컬 백업 JSON"}
          </span>
          {source === "fallback" && error ? (
            <span className="mt-1 block text-amber-700 dark:text-amber-400">
              실시간 조회 실패: {error}
            </span>
          ) : null}
        </p>
        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-xs">
          갱신 {time} · 파싱 {totalParsed}건 · 현재 목록 {visibleCount}건
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LeafletEmbedDialog
          src={mart === "emart" ? EMART_LEAFLET_URL : HOMEPLUS_LEAFLET_URL}
          title={mart === "emart" ? "이마트 전단" : "홈플러스 전단"}
          buttonLabel="전단지 보기"
        />
      </div>
    </div>
  );
}
