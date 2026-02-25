import { StatsRepository, LocationSubscriptionsRepository } from "@/lib/db/repositories";
import { PRICE_PER_LOCATION } from "@/lib/subscriptions/plans";
import type { LocationSummary } from "@/lib/db/repositories/stats.repository";

export interface LocationSummaryWithSubscription extends LocationSummary {
  isPaid: boolean;
}

export interface UserStats {
  totalLocations: number;
  paidLocations: number;
  unpaidLocations: number;
  monthlyTotal: number;
  locationSummaries: LocationSummaryWithSubscription[];
}

export class StatsController {
  async getUserStats(userId: string): Promise<UserStats> {
    const statsRepo = new StatsRepository();
    const locSubRepo = new LocationSubscriptionsRepository();

    const [locationSummaries, paidLocationIds] = await Promise.all([
      statsRepo.getLocationSummaries(userId),
      locSubRepo.getPaidLocationIds(userId),
    ]);

    const paidSet = new Set(paidLocationIds);

    const locationSummariesWithSub: LocationSummaryWithSubscription[] = locationSummaries.map((ls) => ({
      ...ls,
      isPaid: paidSet.has(ls.locationId),
    }));

    const totalLocations = locationSummaries.length;
    const paidLocations = paidLocationIds.length;

    return {
      totalLocations,
      paidLocations,
      unpaidLocations: totalLocations - paidLocations,
      monthlyTotal: paidLocations * PRICE_PER_LOCATION,
      locationSummaries: locationSummariesWithSub,
    };
  }
}
