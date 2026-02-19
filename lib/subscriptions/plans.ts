export const FREE_TIER_LIMITS = {
  reviewsPerMonth: 10,
} as const;

export const PRICE_PER_REPLY = 0.2;

export interface UsageLimits {
  reviewsPerMonth: number;
}

export function getUsageLimits(hasPaidSubscription: boolean): UsageLimits {
  if (hasPaidSubscription) {
    return { reviewsPerMonth: -1 };
  }
  return { reviewsPerMonth: FREE_TIER_LIMITS.reviewsPerMonth };
}
