"use client";

import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { DeltaBadge } from "@/components/ui/bento";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
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
  const tHealth = useTranslations("dashboard.profileHealth.items.responseRate");

  const ratingDelta = percentChange(stats.averageRating, stats.delta.averageRating);
  const reviewsDelta = percentChange(stats.totalReviews, stats.delta.totalReviews);
  const responseRate = Math.round(stats.responseRate);

  return (
    <div className="grid grid-cols-2 divide-y divide-hairline rounded-lg border border-hairline bg-card sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
      <HeroMetric
        label={t("overview.averageRating")}
        accent
        value={
          <span className="inline-flex items-baseline gap-1.5">
            <Star className="size-5 shrink-0 translate-y-px text-star-filled" aria-hidden />
            <span className="text-accent-text">{stats.averageRating.toFixed(1)}</span>
          </span>
        }
        delta={ratingDelta !== null ? <DeltaBadge value={ratingDelta} /> : null}
      />

      <HeroMetric
        label={t("overview.totalReviews")}
        value={stats.totalReviews.toLocaleString()}
        delta={reviewsDelta !== null ? <DeltaBadge value={reviewsDelta} /> : null}
      />

      <HeroMetric label={tHealth("title")} value={`${responseRate}%`} />

      {performance ? (
        <HeroMetric label={t("performance.totalImpressions")} value={performance.totalImpressions.toLocaleString()} />
      ) : (
        <HeroMetric
          label={t("overview.positiveSentiment")}
          value={`${positiveShare(stats)}%`}
          className="hidden lg:flex"
        />
      )}
    </div>
  );
}

function percentChange(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  return Math.abs(change) < 0.05 ? null : change;
}

function positiveShare(stats: ClassificationStats): number {
  const { positive, neutral, negative } = stats.sentimentBreakdown;
  const total = positive + neutral + negative;
  return total > 0 ? Math.round((positive / total) * 100) : 0;
}

function HeroMetric({
  label,
  value,
  delta,
  accent,
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-center gap-1.5 p-5 sm:p-6", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span
          className={cn(
            "text-[1.75rem] font-medium leading-none tracking-tight tabular-nums",
            accent ? "text-accent-text" : "text-foreground"
          )}
        >
          {value}
        </span>
        {delta}
      </div>
    </div>
  );
}
