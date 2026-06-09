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

  const ranked = [
    { rating: own.rating ?? -1, reviewCount: own.userRatingCount ?? 0, isOwn: true },
    ...filtered.map((c) => ({
      rating: c.rating as number,
      reviewCount: c.userRatingCount ?? 0,
      isOwn: false,
    })),
  ].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

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
