"use client";

import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { StarRating } from "@/components/ui/StarRating";
import { useTranslations } from "next-intl";
import type { ClassificationStats } from "@/lib/types/classification.types";
import { TrendingUp, TrendingDown, MessageSquare, Minus, Reply, ArrowUp, ArrowDown } from "lucide-react";
import { StatCard } from "./StatCard";
import { cn } from "@/lib/utils";

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
  const neutralPercent = sentimentTotal > 0 ? Math.round((stats.sentimentBreakdown.neutral / sentimentTotal) * 100) : 0;

  const ratingDelta = getRatingDeltaDisplay(stats.averageRating, stats.delta.averageRating);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        label={t("totalReviews")}
        value={stats.totalReviews}
        icon={MessageSquare}
        delta={{ current: stats.totalReviews, previous: stats.delta.totalReviews }}
      />

      <DashboardCard className="border-transparent shadow-xs hover:shadow-sm transition-shadow">
        <DashboardCardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("averageRating")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-2xl font-bold tabular-nums">{stats.averageRating.toFixed(1)}</p>
                <StarRating rating={Math.round(stats.averageRating)} size={16} />
                {ratingDelta}
              </div>
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <StatCard label={t("responseRate")} value={`${stats.responseRate}%`} icon={Reply} />

      <StatCard
        label={t("positiveSentiment")}
        value={`${positivePercent}%`}
        icon={TrendingUp}
        iconBgColor="bg-success/10"
        iconColor="text-success"
        valueColor="text-success"
        delta={{ current: positivePercent, previous: stats.delta.positivePercent, isPercentage: true }}
      />

      <StatCard
        label={t("neutralSentiment")}
        value={`${neutralPercent}%`}
        icon={Minus}
        iconBgColor="bg-muted-foreground/10"
        iconColor="text-muted-foreground"
        valueColor="text-muted-foreground"
      />

      <StatCard
        label={t("negativeSentiment")}
        value={`${negativePercent}%`}
        icon={TrendingDown}
        iconBgColor="bg-destructive/10"
        iconColor="text-destructive"
        valueColor="text-destructive"
        delta={{ current: negativePercent, previous: stats.delta.negativePercent, isPercentage: true }}
      />
    </div>
  );
}

function getRatingDeltaDisplay(current: number, previous: number | null) {
  if (previous === null || previous === 0) return null;

  const change = Math.round((current - previous) * 10) / 10;
  if (change === 0) return null;

  const isPositive = change > 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isPositive ? "text-success" : "text-destructive"
      )}
    >
      <Icon className="size-3" />
      {isPositive ? "+" : ""}
      {change.toFixed(1)}
    </span>
  );
}
