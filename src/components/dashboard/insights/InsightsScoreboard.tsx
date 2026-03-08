"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Star, Eye, MousePointerClick, Phone } from "lucide-react";
import { StatCard } from "./StatCard";
import type { ClassificationStats } from "@/lib/types/classification.types";

interface PerformanceTotals {
  totalImpressions: number;
  websiteClicks: number;
  phoneCallClicks: number;
  directionRequests: number;
}

interface InsightsScoreboardProps {
  stats: ClassificationStats;
  performance: PerformanceTotals | null;
}

export function InsightsScoreboard({ stats, performance }: InsightsScoreboardProps) {
  const t = useTranslations("dashboard.insights");

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label={t("overview.totalReviews")}
        value={stats.totalReviews}
        icon={MessageSquare}
        delta={{ current: stats.totalReviews, previous: stats.delta.totalReviews }}
      />

      <StatCard label={t("overview.averageRating")} value={stats.averageRating.toFixed(1)} icon={Star} />

      {performance && (
        <StatCard
          label={t("performance.totalImpressions")}
          value={performance.totalImpressions.toLocaleString()}
          icon={Eye}
        />
      )}
      {performance && (
        <StatCard
          label={t("performance.websiteClicks")}
          value={performance.websiteClicks.toLocaleString()}
          icon={MousePointerClick}
        />
      )}
      {performance && (
        <StatCard
          label={t("performance.phoneCalls")}
          value={performance.phoneCallClicks.toLocaleString()}
          icon={Phone}
        />
      )}
    </div>
  );
}
