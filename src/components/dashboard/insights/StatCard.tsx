"use client";

import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  valueColor,
}: StatCardProps) {
  return (
    <DashboardCard className="border-transparent shadow-xs hover:shadow-sm transition-shadow">
      <DashboardCardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={cn("text-2xl font-bold mt-2 tabular-nums", valueColor)}>{value}</p>
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
