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

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  valueColor,
  delta,
}: StatCardProps) {
  const deltaDisplay = getDeltaDisplay(delta);

  return (
    <DashboardCard className="border-transparent shadow-xs hover:shadow-sm transition-shadow">
      <DashboardCardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className={cn("text-2xl font-bold tabular-nums", valueColor)}>{value}</p>
              {deltaDisplay}
            </div>
          </div>
          {Icon && (
            <div className={cn("size-10 rounded-lg shrink-0 flex items-center justify-center", iconBgColor)}>
              <Icon className={cn("size-[18px]", iconColor)} />
            </div>
          )}
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
