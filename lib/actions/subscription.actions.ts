"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { LocationSubscriptionsRepository } from "@/lib/db/repositories";

export async function getPaidLocationIds(): Promise<string[]> {
  try {
    const { userId } = await getAuthenticatedUserId();
    const repo = new LocationSubscriptionsRepository();
    return repo.getPaidLocationIds(userId);
  } catch (error) {
    console.error("Error getting paid location IDs:", error);
    return [];
  }
}
