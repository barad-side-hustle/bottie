"use client";

import { useState, useTransition } from "react";
import { useTranslations, useFormatter, useNow } from "next-intl";
import { RefreshCw, Star, TrendingUp, TrendingDown, Users, Building2, ExternalLink } from "lucide-react";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCompetitorBenchmark, type CompetitorBenchmarkResult } from "@/lib/actions/competitors.actions";

interface Props {
  result: CompetitorBenchmarkResult | null;
  locationId: string;
}

interface LeaderboardRow {
  key: string;
  placeId: string | null;
  name: string;
  rating: number | null;
  reviews: number | null;
  isOwn: boolean;
}

function buildLeaderboard(data: CompetitorBenchmarkResult): LeaderboardRow[] {
  const rows: LeaderboardRow[] = [
    {
      key: "__own__",
      placeId: data.own.placeId,
      name: data.own.displayName,
      rating: data.own.rating,
      reviews: data.own.reviewCount,
      isOwn: true,
    },
    ...data.competitors.map((c, i) => ({
      key: c.placeId || `c-${i}`,
      placeId: c.placeId || null,
      name: c.displayName,
      rating: c.rating,
      reviews: c.userRatingCount,
      isOwn: false,
    })),
  ];
  return rows.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || (b.reviews ?? 0) - (a.reviews ?? 0));
}

/** Google's documented "link to a place" URL — works for any place_id. */
function mapsUrlFor(placeId: string | null): string | null {
  return placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : null;
}

export function CompetitorsView({ result, locationId }: Props) {
  const t = useTranslations("dashboard.competitors");
  const format = useFormatter();
  const now = useNow();
  const [data, setData] = useState(result);
  const [pending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      try {
        const fresh = await getCompetitorBenchmark({ locationId, force: true });
        setData(fresh);
      } catch {}
    });
  };

  if (!data || data.status === "api_error") {
    return (
      <EmptyState
        icon={Building2}
        title={t("empty.apiError.title")}
        description={t("empty.apiError.description")}
        actionLabel={t("tryAgain")}
        onAction={refresh}
      />
    );
  }

  if (data.status === "resolution_failed") {
    return (
      <EmptyState
        icon={Building2}
        title={t("empty.resolutionFailed.title")}
        description={t("empty.resolutionFailed.description")}
        actionLabel={t("tryAgain")}
        onAction={refresh}
      />
    );
  }

  if (data.status === "no_competitors") {
    return (
      <EmptyState
        icon={Users}
        title={t("empty.noCompetitors.title")}
        description={t("empty.noCompetitors.description")}
        actionLabel={t("refresh")}
        onAction={refresh}
      />
    );
  }

  const stats = data.stats;
  const leaderboard = buildLeaderboard(data);

  return (
    <div className="space-y-6">
      <DashboardCard>
        <div className="grid grid-cols-2 divide-x divide-hairline rtl:divide-x-reverse lg:grid-cols-4">
          <StatTile
            label={t("stats.yourRating")}
            value={formatRating(data.own.rating)}
            comparison={
              stats?.avgRating != null && data.own.rating != null ? (
                <Trend
                  positive={data.own.rating >= stats.avgRating}
                  text={t("stats.avgValue", { value: stats.avgRating.toFixed(1) })}
                />
              ) : null
            }
          />
          <StatTile
            label={t("stats.yourReviews")}
            value={formatCount(data.own.reviewCount, format)}
            comparison={
              stats?.medianReviewCount != null && data.own.reviewCount != null ? (
                <Trend
                  positive={data.own.reviewCount >= stats.medianReviewCount}
                  text={t("stats.medianValue", { value: format.number(stats.medianReviewCount) })}
                />
              ) : null
            }
          />
          <StatTile
            label={t("stats.localRank")}
            value={stats?.ownRank != null ? `#${stats.ownRank}` : "—"}
            comparison={
              stats?.totalRanked != null ? (
                <span className="text-ink-2">{t("stats.ofTotal", { total: stats.totalRanked })}</span>
              ) : null
            }
          />
          <StatTile
            label={t("stats.avgRating")}
            value={formatRating(stats?.avgRating ?? null)}
            comparison={
              stats?.competitorCount != null ? (
                <span className="text-ink-2">{t("stats.competitorCount", { count: stats.competitorCount })}</span>
              ) : null
            }
          />
        </div>
      </DashboardCard>

      {stats?.ratingPercentile != null && (
        <p className="text-sm text-ink-2">{t("stats.percentile", { percentile: stats.ratingPercentile })}</p>
      )}

      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{t("leaderboard.title")}</DashboardCardTitle>
          <DashboardCardDescription>
            {t("leaderboard.description", { radius: data.radiusMeters / 1000 })}
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          <ul className="-mx-2 divide-y divide-hairline">
            {leaderboard.map((row, index) => {
              const mapsUrl = mapsUrlFor(row.placeId);
              return (
                <li
                  key={row.key}
                  className={cn("flex items-center gap-3 rounded-md px-2 py-3", row.isOwn && "bg-surface-2")}
                >
                  <span className="w-6 shrink-0 text-sm font-medium tabular-nums text-ink-3">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-w-0 items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                        >
                          <span className="truncate">{row.name}</span>
                          <ExternalLink className="size-3 shrink-0 text-ink-3" aria-hidden />
                        </a>
                      ) : (
                        <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                      )}
                      {row.isOwn && (
                        <Badge variant="success" className="shrink-0">
                          {t("leaderboard.you")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-ink-2">
                      {row.reviews != null ? t("leaderboard.reviews", { count: format.number(row.reviews) }) : "—"}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-medium tabular-nums text-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                    {formatRating(row.rating)}
                  </span>
                </li>
              );
            })}
          </ul>
        </DashboardCardContent>
      </DashboardCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-3">{t("note")}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-3">
            {t("updatedAt", { time: format.relativeTime(new Date(data.fetchedAt), now) })}
          </span>
          <Button variant="outline" size="sm" onClick={refresh} disabled={pending}>
            <RefreshCw className={cn("size-3.5", pending && "animate-spin")} aria-hidden />
            {t("refresh")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, comparison }: { label: string; value: string; comparison?: React.ReactNode }) {
  return (
    <div className="space-y-1.5 p-5 [&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-hairline lg:[&:nth-child(n+3)]:border-t-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">{label}</p>
      <p className="text-2xl font-medium tracking-tight tabular-nums text-foreground md:text-3xl">{value}</p>
      {comparison && <div className="text-xs">{comparison}</div>}
    </div>
  );
}

function Trend({ positive, text }: { positive: boolean; text: string }) {
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-1", positive ? "text-success" : "text-destructive")}>
      <Icon className="size-3.5" aria-hidden />
      <span className="text-ink-2">{text}</span>
    </span>
  );
}

function formatRating(rating: number | null): string {
  return rating == null ? "—" : rating.toFixed(1);
}

function formatCount(count: number | null, format: ReturnType<typeof useFormatter>): string {
  return count == null ? "—" : format.number(count);
}
