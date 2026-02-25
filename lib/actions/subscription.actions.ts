"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { LocationSubscriptionsRepository, StatsRepository } from "@/lib/db/repositories";

export async function getPaidLocationIds(): Promise<string[]> {
  try {
    const { userId } = await getAuthenticatedUserId();
    const statsRepo = new StatsRepository();
    const locSubRepo = new LocationSubscriptionsRepository();

    const summaries = await statsRepo.getLocationSummaries(userId);
    const locationIds = summaries.map((s) => s.locationId);
    return locSubRepo.getPaidLocationIdsAmong(locationIds);
  } catch (error) {
    console.error("Error getting paid location IDs:", error);
    return [];
  }
}
