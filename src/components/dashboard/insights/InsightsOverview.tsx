"use client";

import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { StarRating } from "@/components/ui/StarRating";
import { useTranslations } from "next-intl";
import type { ClassificationStats } from "@/lib/types/classification.types";
import { TrendingUp, TrendingDown, MessageSquare } from "lucide-react";
import { StatCard } from "./StatCard";

interface InsightsOverviewProps {
  stats: ClassificationStats;
}

export function InsightsOverview({ stats }: InsightsOverviewProps) {
  const t = useTranslations("dashboard.insights.overview");

  const sentimentTotal =
    stats.sentimentBreakdown.positive + stats.sentimentBreakdown.neutral + stats.sentimentBreakdown.negative;
  const positivePercent =
    sentimentTotal > 0 ? Math.round((stats.sentimentBreakdown.positive / sentimentTotal) * 100) : 0;
  const negativePercent =
    sentimentTotal > 0 ? Math.round((stats.sentimentBreakdown.negative / sentimentTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label={t("totalReviews")} value={stats.totalReviews} icon={MessageSquare} />

      <DashboardCard className="border-transparent shadow-xs hover:shadow-sm transition-shadow">
        <DashboardCardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("averageRating")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-bold tabular-nums">{stats.averageRating.toFixed(1)}</p>
                <StarRating rating={Math.round(stats.averageRating)} size={16} />
              </div>
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <StatCard
        label={t("positiveSentiment")}
        value={`${positivePercent}%`}
        icon={TrendingUp}
        iconBgColor="bg-success/10"
        iconColor="text-success"
        valueColor="text-success"
      />

      <StatCard
        label={t("negativeSentiment")}
        value={`${negativePercent}%`}
        icon={TrendingDown}
        iconBgColor="bg-destructive/10"
        iconColor="text-destructive"
        valueColor="text-destructive"
      />
    </div>
  );
}
