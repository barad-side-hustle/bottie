"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Subscription } from "@/lib/db/schema";
import { getActiveSubscription } from "@/lib/actions/subscription.actions";

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isActive: boolean;
  hasPaidSubscription: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setSubscription(sub ?? null);
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
  const hasPaidSubscription = isActive && !!subscription?.polarSubscriptionId;

  return {
    subscription,
    loading,
    error,
    isActive,
    hasPaidSubscription,
  };
}
