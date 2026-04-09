"use client";

import { useCallback, useState } from "react";

type Props = {
  productId: string;
  productName: string;
  martLabel: string;
};

export function ProductShareButton({ productId, productName, martLabel }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "err">("idle");

  const buildShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.searchParams.set("item", productId);
    return u.toString();
  }, [productId]);

  const onShare = useCallback(async () => {
    const url = buildShareUrl();
    const text = `야, 이거 ${martLabel}에서 대박 세일 중이야! ${productName.slice(0, 60)}`;
    try {
      if (navigator.share && url) {
        await navigator.share({
          title: "MartScan",
          text,
          url,
        });
        setStatus("idle");
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("err");
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }, [buildShareUrl, martLabel, productName]);

  return (
    <button
      type="button"
      onClick={onShare}
      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      {status === "copied"
        ? "링크 복사됨"
        : status === "err"
          ? "복사 실패"
          : "공유 · 링크"}
    </button>
  );
}
