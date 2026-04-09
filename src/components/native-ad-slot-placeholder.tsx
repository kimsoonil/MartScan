type Props = {
  /** 1-based index in list (for 레이블) */
  afterIndex: number;
};

/** 애드센스 등 네이티브 광고 삽입을 위한 자리 표시 (10개 단위) */
export function NativeAdSlotPlaceholder({ afterIndex }: Props) {
  return (
    <li className="col-span-full list-none">
      <div
        className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-amber-200/90 bg-amber-50/40 px-4 py-6 text-center dark:border-amber-900/50 dark:bg-amber-950/20"
        aria-hidden
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-200/70">
          Sponsored
        </span>
        <p className="text-xs text-amber-900/70 dark:text-amber-100/60">
          광고 영역 (예: 애드센스 네이티브) — 상품 {afterIndex}개마다 배치
        </p>
      </div>
    </li>
  );
}
