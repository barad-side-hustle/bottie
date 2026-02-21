import "server-only";
import { unstable_cache } from "next/cache";
import { StatsRepository } from "@/lib/db/repositories/stats.repository";

export interface LandingStats {
  totalBusinesses: number;
  totalAiResponses: number;
  averageRating: number;
  hoursSaved: number;
}

const MINUTES_SAVED_PER_RESPONSE = 3;

const FALLBACK_STATS: LandingStats = {
  totalBusinesses: 500,
  totalAiResponses: 10000,
  averageRating: 4.8,
  hoursSaved: 500,
};

const getCachedGlobalStats = unstable_cache(
  async (): Promise<LandingStats> => {
    const raw = await StatsRepository.getGlobalStats();

    const totalBusinesses = raw.totalLocations;
    const totalAiResponses = raw.totalAiResponses;
    const averageRating = raw.averageRating ? Math.round(raw.averageRating * 10) / 10 : 4.8;
    const hoursSaved = Math.round((totalAiResponses * MINUTES_SAVED_PER_RESPONSE) / 60);

    return { totalBusinesses, totalAiResponses, averageRating, hoursSaved };
  },
  ["landing-global-stats"],
  { revalidate: 3600 }
);

export async function getLandingStats(): Promise<LandingStats> {
  try {
    const stats = await getCachedGlobalStats();

    if (stats.totalBusinesses === 0 && stats.totalAiResponses === 0) {
      return FALLBACK_STATS;
    }

    return stats;
  } catch (error) {
    console.error("Failed to fetch landing stats:", error);
    return FALLBACK_STATS;
  }
}
