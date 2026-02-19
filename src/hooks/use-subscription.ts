"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanLimits, type PlanTier, type PlanLimits } from "@/lib/subscriptions/plans";
import type { Subscription, FeatureOverrides } from "@/lib/db/schema";
import { getActiveSubscription } from "@/lib/actions/subscription.actions";
import { checkFeatureAccess, type GatedFeature, type FeatureCheckResult } from "@/lib/subscriptions/feature-check";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  planType: PlanTier;
  limits: PlanLimits;
  featureOverrides: FeatureOverrides | null;
  checkFeature: (feature: GatedFeature) => FeatureCheckResult;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanTier>("free");
  const [limits, setLimits] = useState<PlanLimits>(getPlanLimits("free"));
  const [featureOverrides, setFeatureOverrides] = useState<FeatureOverrides | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    async function loadSubscription() {
      try {
        const sub = await getActiveSubscription();

        if (!sub) {
          setSubscription(null);
          setPlanType("free");
          setLimits(getPlanLimits("free"));
          setFeatureOverrides(null);
        } else {
          setSubscription(sub);
          setPlanType(sub.planTier as PlanTier);
          setLimits(getPlanLimits(sub.planTier as PlanTier));
          setFeatureOverrides(sub.featureOverrides ?? null);
        }
        setError(null);
      } catch (err) {
        console.error("Error loading subscription:", err);
        setError("Error loading subscription");
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [user, authLoading]);

  const isActive = subscription?.status === "active";

  const checkFeature = useCallback(
    (feature: GatedFeature): FeatureCheckResult => {
      return checkFeatureAccess(planType, feature, featureOverrides);
    },
    [planType, featureOverrides]
  );

  return {
    subscription,
    loading,
    error,
    isActive,
    planType,
    limits,
    featureOverrides,
    checkFeature,
  };
}
