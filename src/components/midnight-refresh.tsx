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
    <p className="text-[11px] font-medium leading-snug text-emerald-200/95 sm:text-xs">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/20 px-2.5 py-1.5 text-emerald-50/95 ring-1 ring-white/15 backdrop-blur-sm sm:rounded-xl sm:px-3 sm:py-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          aria-hidden
        />
        매일 0시 전단 자동 갱신
      </span>
    </p>
  );
}
