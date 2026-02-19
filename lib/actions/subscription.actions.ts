"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionsRepository } from "@/lib/db/repositories";
import type { Subscription } from "@/lib/db/schema";

export async function getActiveSubscription(): Promise<Subscription | null> {
  try {
    const { userId } = await getAuthenticatedUserId();
    const repo = new SubscriptionsRepository();
    return repo.getActiveSubscriptionForUser(userId);
  } catch (error) {
    console.error("Error getting active subscription:", error);
    return null;
  }
}
