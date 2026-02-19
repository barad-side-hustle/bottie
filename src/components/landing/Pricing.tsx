"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionManagementCard } from "./SubscriptionManagementCard";
import { PricingCards } from "./PricingCards";

export function Pricing() {
  const { subscription, hasPaidSubscription } = useSubscription();

  return (
    <>
      {hasPaidSubscription && subscription && <SubscriptionManagementCard />}
      <PricingCards />
    </>
  );
}
