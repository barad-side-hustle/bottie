import { SubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";
import { getUsageLimits, type UsageLimits } from "@/lib/subscriptions/plans";

export class SubscriptionsController {
  async getUserUsageLimits(userId: string): Promise<UsageLimits> {
    const repo = new SubscriptionsRepository();
    const hasPaid = await repo.hasPaidSubscription(userId);
    return getUsageLimits(hasPaid);
  }

  async checkReviewQuota(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    const repo = new SubscriptionsRepository();
    const statsRepo = new StatsRepository();
    const hasPaid = await repo.hasPaidSubscription(userId);
    const limits = getUsageLimits(hasPaid);
    const currentCount = await statsRepo.countUserReviewsThisMonth(userId);

    const allowed = limits.reviewsPerMonth === -1 || currentCount < limits.reviewsPerMonth;

    return {
      allowed,
      currentCount,
      limit: limits.reviewsPerMonth,
    };
  }

  async hasPaidSubscription(userId: string): Promise<boolean> {
    const repo = new SubscriptionsRepository();
    return repo.hasPaidSubscription(userId);
  }
}
