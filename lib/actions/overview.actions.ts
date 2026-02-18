"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { StatsRepository, type LocationSummary } from "@/lib/db/repositories/stats.repository";

export interface OverviewData {
  pendingCount: number;
  avgRating: number | null;
  reviewsThisMonth: number;
  locationCount: number;
  locationSummaries: LocationSummary[];
}

export async function getOverviewData(): Promise<OverviewData> {
  const { userId } = await getAuthenticatedUserId();
  const stats = new StatsRepository();

  const [pendingCount, avgRating, reviewsThisMonth, locationCount, locationSummaries] = await Promise.all([
    stats.countPendingReviews(userId),
    stats.getAverageRatingAcrossLocations(userId),
    stats.countUserReviewsThisMonth(userId),
    stats.countUserLocations(userId),
    stats.getLocationSummaries(userId),
  ]);

  return { pendingCount, avgRating, reviewsThisMonth, locationCount, locationSummaries };
}
