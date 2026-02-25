"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { StatsRepository, type LocationSummary } from "@/lib/db/repositories/stats.repository";
import { LocationSubscriptionsRepository } from "@/lib/db/repositories/location-subscriptions.repository";

export interface LocationSummaryWithSub extends LocationSummary {
  isPaid: boolean;
}

export interface OverviewData {
  pendingCount: number;
  avgRating: number | null;
  reviewsThisMonth: number;
  locationCount: number;
  locationSummaries: LocationSummaryWithSub[];
}

export async function getOverviewData(): Promise<OverviewData> {
  const { userId } = await getAuthenticatedUserId();
  const stats = new StatsRepository();
  const locSubRepo = new LocationSubscriptionsRepository();

  const [pendingCount, avgRating, reviewsThisMonth, locationCount, locationSummaries, paidLocationIds] =
    await Promise.all([
      stats.countPendingReviews(userId),
      stats.getAverageRatingAcrossLocations(userId),
      stats.countUserReviewsThisMonth(userId),
      stats.countUserLocations(userId),
      stats.getLocationSummaries(userId),
      locSubRepo.getPaidLocationIds(userId),
    ]);

  const paidSet = new Set(paidLocationIds);
  const summariesWithSub: LocationSummaryWithSub[] = locationSummaries.map((ls) => ({
    ...ls,
    isPaid: paidSet.has(ls.locationId),
  }));

  return {
    pendingCount,
    avgRating,
    reviewsThisMonth,
    locationCount,
    locationSummaries: summariesWithSub,
  };
}
