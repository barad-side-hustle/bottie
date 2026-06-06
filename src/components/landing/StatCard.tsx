"use client";

import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  iconBgClass: string;
}

export function StatCard({ icon: Icon, value, decimals = 0, suffix = "", label, iconBgClass }: StatCardProps) {
  const { formattedValue, ref } = useCountUp({ end: value, duration: 2000, decimals });

  return (
    <div
      className={cn(
        "group flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card p-6 text-center shadow-sm sm:p-8",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-2xl",
          "transition-transform duration-200 group-hover:scale-105",
          iconBgClass
        )}
      >
        <Icon className="size-6 text-primary" />
      </div>

      <div ref={ref} className="text-4xl font-bold tracking-tight tabular-nums text-foreground sm:text-5xl">
        {formattedValue}
        {suffix}
      </div>

      <div className="text-sm font-medium text-muted-foreground sm:text-base">{label}</div>
    </div>
  );
}
