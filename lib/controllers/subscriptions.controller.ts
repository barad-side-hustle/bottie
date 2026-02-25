import { LocationSubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";
import { getLocationUsageLimits, type LocationUsageLimits } from "@/lib/subscriptions/plans";

export class SubscriptionsController {
  async getLocationUsageLimits(locationId: string): Promise<LocationUsageLimits> {
    const repo = new LocationSubscriptionsRepository();
    const isPaid = await repo.isLocationPaid(locationId);
    return getLocationUsageLimits(isPaid);
  }

  async checkLocationQuota(
    locationId: string
  ): Promise<{ allowed: boolean; currentCount: number; limit: number; isPaid: boolean }> {
    const locSubRepo = new LocationSubscriptionsRepository();
    const statsRepo = new StatsRepository();

    const isPaid = await locSubRepo.isLocationPaid(locationId);
    const limits = getLocationUsageLimits(isPaid);
    const currentCount = await statsRepo.countLocationReviewsThisMonth(locationId);

    const allowed = limits.reviewsPerMonth === -1 || currentCount < limits.reviewsPerMonth;

    return {
      allowed,
      currentCount,
      limit: limits.reviewsPerMonth,
      isPaid,
    };
  }

  async isLocationPaid(locationId: string): Promise<boolean> {
    const repo = new LocationSubscriptionsRepository();
    return repo.isLocationPaid(locationId);
  }
}
