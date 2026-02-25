export const FREE_LOCATION_LIMITS = {
  reviewsPerMonth: 5,
} as const;

export const PRICE_PER_LOCATION = 39;

export interface LocationUsageLimits {
  reviewsPerMonth: number;
}

export function getLocationUsageLimits(hasActiveSubscription: boolean): LocationUsageLimits {
  if (hasActiveSubscription) {
    return { reviewsPerMonth: -1 };
  }
  return { reviewsPerMonth: FREE_LOCATION_LIMITS.reviewsPerMonth };
}
