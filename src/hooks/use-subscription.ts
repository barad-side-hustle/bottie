"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPaidLocationIds } from "@/lib/actions/subscription.actions";
import { PRICE_PER_LOCATION } from "@/lib/subscriptions/plans";

interface UseLocationSubscriptionsReturn {
  paidLocationIds: string[];
  loading: boolean;
  error: string | null;
  isLocationPaid: (locationId: string) => boolean;
  totalMonthly: number;
}

export function useLocationSubscriptions(): UseLocationSubscriptionsReturn {
  const { user, loading: authLoading } = useAuth();
  const [paidLocationIds, setPaidLocationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    async function loadSubscriptions() {
      try {
        const ids = await getPaidLocationIds();
        setPaidLocationIds(ids);
        setError(null);
      } catch (err) {
        console.error("Error loading location subscriptions:", err);
        setError("Error loading subscriptions");
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptions();
  }, [user, authLoading]);

  const isLocationPaid = useCallback((locationId: string) => paidLocationIds.includes(locationId), [paidLocationIds]);

  return {
    paidLocationIds,
    loading,
    error,
    isLocationPaid,
    totalMonthly: paidLocationIds.length * PRICE_PER_LOCATION,
  };
}
