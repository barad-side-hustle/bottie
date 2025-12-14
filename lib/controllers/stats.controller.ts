import { StatsRepository } from "@/lib/db/repositories";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import { getPlanLimits, type PlanLimits, type PlanTier } from "@/lib/subscriptions/plans";
import type { Subscription } from "@/lib/db/schema";

export interface UserStats {
  locations: number;
  reviews: number;
  locationsPercent: number;
  reviewsPercent: number;
  limits: PlanLimits;
  subscription: Subscription | null;
}

export class StatsController {
  async getUserStats(userId: string): Promise<UserStats> {
    const statsRepo = new StatsRepository();
    const subRepo = new SubscriptionsRepository();

    const [locations, reviews, subscription] = await Promise.all([
      statsRepo.countUserLocations(userId),
      statsRepo.countUserReviewsThisMonth(userId),
      subRepo.getActiveSubscriptionForUser(userId),
    ]);

    const limits = getPlanLimits((subscription?.planTier as PlanTier) || "free");
    const locationsPercent = Math.min(100, Math.round((locations * 100) / limits.businesses));
    const reviewsPercent = Math.min(100, Math.round((reviews * 100) / limits.reviewsPerMonth));

    return {
      locations,
      reviews,
      locationsPercent,
      reviewsPercent,
      limits,
      subscription,
    };
  }
}
