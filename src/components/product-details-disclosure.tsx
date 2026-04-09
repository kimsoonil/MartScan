"use client";

import { useId, useState } from "react";

type Props = {
  productId: string;
  summary?: string;
  children: React.ReactNode;
  tone?: "neutral" | "muted";
};

export function ProductDetailsDisclosure({
  productId,
  summary = "상세 안내",
  children,
  tone = "neutral",
}: Props) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const panelId = `pd-${productId}-${uid}`;

  const shell =
    tone === "muted"
      ? "border-zinc-200/70 bg-zinc-50/50 dark:border-zinc-700/60 dark:bg-zinc-900/40"
      : "border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-700/80 dark:bg-zinc-900/50";

  const summaryCls =
    tone === "muted"
      ? "font-medium text-zinc-500 dark:text-zinc-400"
      : "font-semibold text-zinc-500 dark:text-zinc-400";

  return (
    <div className={`mt-2 overflow-hidden rounded-lg border ${shell}`}>
      <button
        type="button"
        id={`${panelId}-btn`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 px-2.5 py-2 text-left text-[11px] ${summaryCls} transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50`}
      >
        <span>
          {summary} <span className="text-zinc-400">{open ? "▴" : "▾"}</span>
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div id={panelId} className="min-h-0 overflow-hidden">
          <div className="border-t border-zinc-200/60 px-2.5 pb-2.5 pt-2 dark:border-zinc-700/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
