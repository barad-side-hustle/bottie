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
        "relative p-6 sm:p-8 rounded-2xl",
        "border border-border/40 bg-card shadow-sm",
        "group transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1"
      )}
    >
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative flex flex-col items-center text-center gap-3">
        <div
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-xl",
            "group-hover:scale-110 transition-transform duration-300",
            iconBgClass
          )}
        >
          <Icon className="h-6 w-6 text-primary" />
        </div>

        <div ref={ref} className="text-4xl sm:text-5xl font-bold text-primary tabular-nums">
          {formattedValue}
          {suffix}
        </div>

        <div className="text-sm sm:text-base text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
}
