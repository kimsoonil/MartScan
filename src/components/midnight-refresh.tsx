"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

function msUntilNextLocalMidnight(): number {
  const now = new Date();
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(1, next.getTime() - now.getTime());
}

async function bustLeafletCache(): Promise<void> {
  try {
    await fetch("/api/revalidate-leaflet", { method: "POST" });
  } catch {
    /* 네트워크 실패 시에도 router.refresh만으로 UI는 갱신 시도 */
  }
}

/**
 * 헤더 안내 문구 + 브라우저 기준 매일 자정에 전단 캐시 무효화 후 RSC 재요청.
 */
export function MidnightLeafletRefresh() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const schedule = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(async () => {
        await bustLeafletCache();
        router.refresh();
        schedule();
      }, msUntilNextLocalMidnight());
    };

    schedule();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  return (
    <p className="mt-3 text-xs font-medium text-emerald-200/90 sm:text-sm">
      <span className="rounded-md bg-emerald-950/40 px-2 py-0.5 text-emerald-100/95 ring-1 ring-emerald-700/30">
        매일 0시에 전단 광고를 다시 조회합니다
      </span>
    </p>
  );
}
