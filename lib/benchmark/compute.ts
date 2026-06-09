import type { BenchmarkStats, CompetitorEntry } from "@/lib/db/schema";

export interface OwnPlaceForRank {
  placeId?: string;
  rating: number | null;
  userRatingCount: number | null;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round1(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10) / 10;
}

const WILSON_Z = 1.96;

export function wilsonScore(rating: number | null, reviewCount: number | null): number {
  if (rating === null) return -Infinity;
  const n = reviewCount ?? 0;
  if (n <= 0) return -Infinity;

  const p = Math.min(Math.max((rating - 1) / 4, 0), 1);
  const z2 = WILSON_Z * WILSON_Z;
  const center = p + z2 / (2 * n);
  const margin = WILSON_Z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return (center - margin) / (1 + z2 / n);
}

export function rankBusinesses<T extends { rating: number | null; reviewCount: number | null }>(items: T[]): T[] {
  return [...items]
    .map((item) => ({ item, score: wilsonScore(item.rating, item.reviewCount) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.item.reviewCount ?? 0) - (a.item.reviewCount ?? 0) ||
        (b.item.rating ?? -1) - (a.item.rating ?? -1)
    )
    .map((x) => x.item);
}

export function filterCompetitors(competitors: CompetitorEntry[], ownPlaceId?: string): CompetitorEntry[] {
  return competitors.filter(
    (c) => c.placeId !== ownPlaceId && c.businessStatus !== "CLOSED_PERMANENTLY" && typeof c.rating === "number"
  );
}

export function computeBenchmarkStats(own: OwnPlaceForRank, competitors: CompetitorEntry[]): BenchmarkStats {
  const filtered = filterCompetitors(competitors, own.placeId);

  const ratings = filtered.map((c) => c.rating as number);
  const reviewCounts = filtered
    .filter((c) => typeof c.userRatingCount === "number")
    .map((c) => c.userRatingCount as number);

  const avgRating = round1(average(ratings));
  const medianRating = round1(median(ratings));
  const avgReviewCount = average(reviewCounts);
  const medianReviewCount = median(reviewCounts);

  const ranked = rankBusinesses([
    { rating: own.rating, reviewCount: own.userRatingCount, isOwn: true },
    ...filtered.map((c) => ({ rating: c.rating, reviewCount: c.userRatingCount, isOwn: false })),
  ]);

  const totalRanked = ranked.length;
  const ownIndex = ranked.findIndex((r) => r.isOwn);
  const ownRank = ownIndex >= 0 ? ownIndex + 1 : null;

  const ratingPercentile =
    ownRank !== null && totalRanked > 1 ? Math.round(((totalRanked - ownRank) / (totalRanked - 1)) * 100) : null;

  const reviewCountGap = medianReviewCount === null ? null : Math.round((own.userRatingCount ?? 0) - medianReviewCount);

  return {
    competitorCount: filtered.length,
    avgRating,
    medianRating,
    avgReviewCount: avgReviewCount === null ? null : Math.round(avgReviewCount),
    medianReviewCount: medianReviewCount === null ? null : Math.round(medianReviewCount),
    ownRank,
    totalRanked,
    ratingPercentile,
    reviewCountGap,
  };
}
