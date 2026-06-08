"use client";

import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  delta?: {
    current: number;
    previous: number | null;
    isPercentage?: boolean;
  };
}

export function StatCard({ label, value, icon: Icon, valueColor, delta }: StatCardProps) {
  const deltaDisplay = getDeltaDisplay(delta);

  return (
    <DashboardCard>
      <DashboardCardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">{label}</p>
          {Icon && <Icon className="size-4 shrink-0 text-ink-3" aria-hidden />}
        </div>
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-[1.75rem] font-medium leading-tight tracking-tight tabular-nums text-foreground",
              valueColor
            )}
          >
            {value}
          </p>
          {deltaDisplay}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}

function getDeltaDisplay(delta?: StatCardProps["delta"]) {
  if (!delta || delta.previous === null) return null;

  let changePercent: number;

  if (delta.isPercentage) {
    changePercent = delta.current - delta.previous;
  } else if (delta.previous === 0) {
    return null;
  } else {
    changePercent = Math.round(((delta.current - delta.previous) / delta.previous) * 100);
  }

  if (changePercent === 0) return null;

  const isPositive = changePercent > 0;
  const DeltaIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive ? "text-success" : "text-destructive"
      )}
    >
      <DeltaIcon className="size-3" />
      {isPositive ? "+" : ""}
      {changePercent}%
    </span>
  );
}
