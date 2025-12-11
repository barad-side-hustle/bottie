import { StatsRepository } from "@/lib/db/repositories";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import type { PlanLimits } from "@/lib/subscriptions/plans";

export interface UserStats {
  locations: number;
  reviews: number;
  locationsPercent: number;
  reviewsPercent: number;
  limits: PlanLimits;
}

export class StatsController {
  async getUserStats(userId: string): Promise<UserStats> {
    const statsRepo = new StatsRepository();
    const subRepo = new SubscriptionsRepository();

    const [locations, reviews, limits] = await Promise.all([
      statsRepo.countUserLocations(userId),
      statsRepo.countUserReviewsThisMonth(userId),
      subRepo.getUserPlanLimits(userId),
    ]);

    const locationsPercent = Math.min(100, Math.round((locations * 100) / limits.businesses));
    const reviewsPercent = Math.min(100, Math.round((reviews * 100) / limits.reviewsPerMonth));

    return {
      locations,
      reviews,
      locationsPercent,
      reviewsPercent,
      limits,
    };
  }
}
