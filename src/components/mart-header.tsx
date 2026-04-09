import { MidnightLeafletRefresh } from "./midnight-refresh";

export function MartHeader() {
  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-[0_4px_24px_-4px_rgba(6,78,59,0.45)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_100%_-20%,rgba(52,211,153,0.18),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23fff'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg shadow-inner ring-1 ring-white/20 backdrop-blur-sm sm:h-10 sm:w-10 sm:text-xl"
                aria-hidden
              >
                🛒
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/95 sm:text-[11px]">
                  MartScan
                </p>
                <h1 className="mt-0.5 text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl">
                  오늘의 마트정보
                </h1>
              </div>
            </div>
            <p className="mt-2 max-w-xl text-pretty text-xs leading-relaxed text-emerald-100/88 sm:mt-2.5 sm:text-sm">
              이마트·홈플러스 전단을 모아 할인·단위당 가격을 빠르게 비교하세요.
            </p>
          </div>
          <div className="shrink-0">
            <MidnightLeafletRefresh />
          </div>
        </div>
      </div>
    </header>
  );
}
