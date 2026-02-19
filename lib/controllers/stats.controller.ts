import { StatsRepository } from "@/lib/db/repositories";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import { getUsageLimits, type UsageLimits } from "@/lib/subscriptions/plans";
import type { Subscription } from "@/lib/db/schema";

export interface UserStats {
  locations: number;
  reviews: number;
  reviewsPercent: number;
  limits: UsageLimits;
  subscription: Subscription | null;
  hasPaidSubscription: boolean;
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

    const hasPaid = !!subscription?.polarSubscriptionId;
    const limits = getUsageLimits(hasPaid);
    const reviewsPercent =
      limits.reviewsPerMonth === -1 ? 0 : Math.min(100, Math.round((reviews * 100) / limits.reviewsPerMonth));

    return {
      locations,
      reviews,
      reviewsPercent,
      limits,
      subscription,
      hasPaidSubscription: hasPaid,
    };
  }
}
