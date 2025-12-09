"use client";

import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
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
    <DashboardCard className="hover:scale-100 hover:-translate-y-0">
      <DashboardCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${valueColor || ""}`}>{value}</p>
          </div>
          {Icon && (
            <div className={`h-12 w-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
          )}
        </div>
      </DashboardCardContent>
    </DashboardCard>
  );
}
