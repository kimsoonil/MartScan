"use client";

import { useRef, useState } from "react";

import type { WeeklyPriceEntry } from "@/lib/product-insights";

import { PriceTrendSparkline } from "./price-trend-sparkline";

const CHART_W = 240;
const CHART_H = 100;
const PAD_X = 32;
const PAD_Y = 16;

function formatWeek(w: string): string {
  // "2026-W15" → "W15"
  return w.replace(/^\d{4}-/, "");
}

function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

function LargeChart({ data }: { data: WeeklyPriceEntry[] }) {
  const prices = data.map((d) => d.wonPer100g);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const plotW = CHART_W - PAD_X * 2;
  const plotH = CHART_H - PAD_Y * 2;

  const xs = data.map((_, i) => PAD_X + (i / (data.length - 1)) * plotW);
  const ys = prices.map((p) => CHART_H - PAD_Y - ((p - min) / range) * plotH);
  const points = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const isDowntrend = prices[prices.length - 1] <= prices[0];
  const color = isDowntrend ? "#10b981" : "#ef4444";

  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full"
    >
      {/* Y axis labels */}
      <text
        x={PAD_X - 4}
        y={PAD_Y + 4}
        textAnchor="end"
        className="fill-zinc-400 text-[9px]"
      >
        {formatWon(max)}
      </text>
      <text
        x={PAD_X - 4}
        y={CHART_H - PAD_Y + 4}
        textAnchor="end"
        className="fill-zinc-400 text-[9px]"
      >
        {formatWon(min)}
      </text>

      {/* Grid lines */}
      <line
        x1={PAD_X}
        y1={PAD_Y}
        x2={CHART_W - PAD_X}
        y2={PAD_Y}
        stroke="#e4e4e7"
        strokeWidth="0.5"
        strokeDasharray="3,3"
      />
      <line
        x1={PAD_X}
        y1={CHART_H - PAD_Y}
        x2={CHART_W - PAD_X}
        y2={CHART_H - PAD_Y}
        stroke="#e4e4e7"
        strokeWidth="0.5"
        strokeDasharray="3,3"
      />

      {/* Data line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points with tooltips */}
      {data.map((d, i) => (
        <g key={d.week}>
          <circle cx={xs[i]} cy={ys[i]} r="3.5" fill={color} opacity="0.9">
            <title>
              {formatWeek(d.week)}: 100g당 {formatWon(d.wonPer100g)}
            </title>
          </circle>
          {/* X axis labels — show first, last, and middle */}
          {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) ? (
            <text
              x={xs[i]}
              y={CHART_H - 2}
              textAnchor="middle"
              className="fill-zinc-400 text-[8px]"
            >
              {formatWeek(d.week)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

export function PriceTrendModal({
  data,
  productName,
}: {
  data: WeeklyPriceEntry[];
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  function handleOpen() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function handleClose() {
    dialogRef.current?.close();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="mt-1 flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
        title="가격 추이 보기"
      >
        <PriceTrendSparkline data={data} />
        <span>추이</span>
      </button>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className="leaflet-dialog m-auto max-w-sm rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl backdrop:bg-black/40 dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => {
          if (e.target === dialogRef.current) handleClose();
        }}
      >
        {open ? (
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  100g당 가격 추이
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {productName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                닫기
              </button>
            </div>
            <div className="mt-4">
              <LargeChart data={data} />
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-400 dark:text-zinc-500">
              최근 {data.length}주간 100g당 단가 (추정값)
            </p>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
