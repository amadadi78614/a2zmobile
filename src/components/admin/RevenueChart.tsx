"use client";

import { formatZAR } from "@/lib/utils";

export function RevenueChart({ series }: { series: { date: string; revenue: number }[] }) {
  if (series.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-400">
        No revenue data yet.
      </div>
    );
  }

  const max = Math.max(...series.map((s) => s.revenue), 1);
  const barWidth = 100 / series.length;

  return (
    <div className="h-48">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        {series.map((point, i) => {
          const height = (point.revenue / max) * 90;
          return (
            <rect
              key={point.date}
              x={i * barWidth + barWidth * 0.15}
              y={100 - height}
              width={barWidth * 0.7}
              height={height}
              className="fill-ink"
            />
          );
        })}
      </svg>
      <div className="mt-3 flex justify-between text-[10px] text-ink-400">
        <span>{series[0]?.date}</span>
        <span>{formatZAR(max)} peak</span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
    </div>
  );
}
