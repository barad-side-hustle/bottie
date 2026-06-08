"use client";

import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  accent?: boolean;
}

export function StatCard({ value, decimals = 0, suffix = "", label, accent = false }: StatCardProps) {
  const { formattedValue, ref } = useCountUp({ end: value, duration: 2000, decimals });

  return (
    <div className="flex flex-col items-center gap-1.5 px-2 text-center">
      <span
        ref={ref}
        className={cn(
          "text-3xl font-medium tracking-tight tabular-nums sm:text-4xl",
          accent ? "text-primary" : "text-ink"
        )}
      >
        {formattedValue}
        {suffix}
      </span>
      <span className="text-sm text-ink-2">{label}</span>
    </div>
  );
}
