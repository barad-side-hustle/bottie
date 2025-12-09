"use client";

import { DashboardCard, DashboardCardContent } from "@/components/ui/dashboard-card";
import { StarRating } from "@/components/ui/StarRating";
import { useTranslations } from "next-intl";
import type { ClassificationStats } from "@/lib/types/classification.types";
import { TrendingUp, TrendingDown, MessageSquare } from "lucide-react";

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
      <DashboardCard className="hover:scale-100 hover:-translate-y-0">
        <DashboardCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("totalReviews")}</p>
              <p className="text-3xl font-bold mt-1">{stats.totalReviews}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard className="hover:scale-100 hover:-translate-y-0">
        <DashboardCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("averageRating")}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                <StarRating rating={Math.round(stats.averageRating)} size={16} />
              </div>
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard className="hover:scale-100 hover:-translate-y-0">
        <DashboardCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("positiveSentiment")}</p>
              <p className="text-3xl font-bold mt-1 text-green-600">{positivePercent}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>

      <DashboardCard className="hover:scale-100 hover:-translate-y-0">
        <DashboardCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("negativeSentiment")}</p>
              <p className="text-3xl font-bold mt-1 text-red-600">{negativePercent}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
