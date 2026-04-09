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
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl shadow-inner ring-1 ring-white/20 backdrop-blur-sm"
                aria-hidden
              >
                🛒
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">
                  MartScan
                </p>
                <h1 className="mt-0.5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                  오늘의 마트정보
                </h1>
              </div>
            </div>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-emerald-100/88 sm:text-base">
              이마트·홈플러스 전단을 모아 할인·단위당 가격을 빠르게 비교하세요.
            </p>
          </div>
          <div className="shrink-0 sm:pb-0.5">
            <MidnightLeafletRefresh />
          </div>
        </div>
      </div>
    </header>
  );
}
