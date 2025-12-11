import type { PlanLimits, PlanTier } from "./plans";
import { getPlanLimits } from "./plans";
import type { FeatureOverrides } from "@/lib/db/schema/subscriptions.schema";

export type GatedFeature = "analytics";

export type FeatureCheckResult =
  | { hasAccess: true; reason: "plan" | "override" }
  | { hasAccess: false; reason: "denied"; requiredPlan: PlanTier };

const FEATURE_REQUIRED_PLAN: Record<GatedFeature, PlanTier> = {
  analytics: "pro",
};

export function checkFeatureAccess(
  planTier: PlanTier,
  feature: GatedFeature,
  featureOverrides?: FeatureOverrides | null
): FeatureCheckResult {
  if (featureOverrides?.[feature] === true) {
    return { hasAccess: true, reason: "override" };
  }

  const limits: PlanLimits = getPlanLimits(planTier);
  const hasAccessViaPlan = limits[feature] === true;

  if (hasAccessViaPlan) {
    return { hasAccess: true, reason: "plan" };
  }

  return {
    hasAccess: false,
    reason: "denied",
    requiredPlan: FEATURE_REQUIRED_PLAN[feature],
  };
}
