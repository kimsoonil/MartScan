import { MidnightLeafletRefresh } from "./midnight-refresh";

export function MartHeader() {
  return (
    <header className="border-b border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 px-4 py-10 text-white shadow-lg">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-medium tracking-wide text-emerald-200/90">
          MartScan
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          오늘의 마트정보
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-emerald-100/85 sm:text-base">
          오늘의 전단광고를 한눈에 보고 필터를 통해 원하는 정보를 확인하세요
        </p>
        <MidnightLeafletRefresh />
      </div>
    </header>
  );
}
