"use client";

import { useCallback, useRef } from "react";

type Props = {
  src: string;
  title: string;
  buttonLabel?: string;
};

export function LeafletEmbedDialog({
  src,
  title,
  buttonLabel = "전단지보기",
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="text-sm font-semibold text-emerald-800 underline decoration-emerald-600/50 underline-offset-2 hover:text-emerald-900 dark:text-emerald-300 dark:decoration-emerald-400/50 dark:hover:text-emerald-200"
      >
        {buttonLabel}
      </button>

      <dialog
        ref={dialogRef}
        onMouseDown={(e) => {
          if (e.target === dialogRef.current) {
            close();
          }
        }}
        className="leaflet-dialog fixed left-1/2 top-1/2 z-[100] max-h-[min(92vh,900px)] w-[min(96vw,1100px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div
          className="flex max-h-[min(92vh,900px)] flex-col"
          onMouseDown={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <span className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {title}
          </span>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-700/30 hover:bg-emerald-50 dark:text-emerald-200 dark:ring-emerald-600/40 dark:hover:bg-emerald-950/50"
            >
              새 탭에서 열기
            </a>
            <button
              type="button"
              onClick={close}
              className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="닫기"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg leading-none text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              ✕
            </button>
          </div>
        </div>
        <p className="border-b border-zinc-100 px-4 py-2 text-[11px] leading-snug text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          일부 브라우저·보안 설정에서는 아래에 전단이 보이지 않을 수 있습니다. 그때는「새 탭에서 열기」를
          이용해 주세요.
        </p>
        <div className="h-[min(78vh,760px)] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <iframe
            title={title}
            src={src}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        </div>
      </dialog>
    </>
  );
}
