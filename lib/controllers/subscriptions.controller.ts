import { SubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";
import type { PlanLimits, PlanTier } from "@/lib/subscriptions/plans";
import { checkFeatureAccess, type GatedFeature, type FeatureCheckResult } from "@/lib/subscriptions/feature-check";

export class SubscriptionsController {
  async getUserPlanLimits(userId: string): Promise<PlanLimits> {
    const repo = new SubscriptionsRepository();
    return repo.getUserPlanLimits(userId);
  }

  async checkLocationLimit(userId: string): Promise<boolean> {
    const repo = new SubscriptionsRepository();
    const limits = await repo.getUserPlanLimits(userId);

    if (limits.businesses === -1) {
      return true;
    }

    const statsRepo = new StatsRepository();
    const locationCount = await statsRepo.countUserLocations(userId);

    return locationCount < limits.businesses;
  }

  async checkReviewQuota(userId: string): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
    const repo = new SubscriptionsRepository();
    const limits = await repo.getUserPlanLimits(userId);
    const currentCount = await repo.countUserReviewsThisMonth(userId);

    const allowed = limits.reviewsPerMonth === -1 || currentCount < limits.reviewsPerMonth;

    return {
      allowed,
      currentCount,
      limit: limits.reviewsPerMonth,
    };
  }

  async checkFeatureAccess(userId: string, feature: GatedFeature): Promise<FeatureCheckResult> {
    const repo = new SubscriptionsRepository();
    const subscription = await repo.getActiveSubscriptionForUser(userId);

    const planTier = (subscription?.planTier as PlanTier) ?? "free";
    const featureOverrides = subscription?.featureOverrides ?? null;

    return checkFeatureAccess(planTier, feature, featureOverrides);
  }
}
