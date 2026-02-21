import { eq, and, gte, countDistinct, count, avg, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accountLocations, locations, reviews, reviewResponses, userAccounts } from "@/lib/db/schema";
import { startOfMonth } from "date-fns";

interface GlobalStats {
  totalLocations: number;
  totalAiResponses: number;
  averageRating: number | null;
}

export interface LocationSummary {
  locationId: string;
  locationName: string;
  photoUrl: string | null;
  accountId: string;
  pendingCount: number;
  avgRating: number | null;
}

export class StatsRepository {
  static async getGlobalStats(): Promise<GlobalStats> {
    const [locationsResult, responsesResult, reviewsResult] = await Promise.all([
      db
        .select({ count: countDistinct(accountLocations.locationId) })
        .from(accountLocations)
        .where(eq(accountLocations.connected, true)),
      db.select({ count: count() }).from(reviewResponses).where(eq(reviewResponses.type, "ai_generated")),
      db.select({ avgRating: avg(reviews.rating) }).from(reviews),
    ]);

    return {
      totalLocations: locationsResult[0]?.count || 0,
      totalAiResponses: Number(responsesResult[0]?.count) || 0,
      averageRating: reviewsResult[0]?.avgRating ? parseFloat(reviewsResult[0].avgRating) : null,
    };
  }

  async countUserLocations(userId: string): Promise<number> {
    const result = await db
      .select({ count: countDistinct(accountLocations.locationId) })
      .from(accountLocations)
      .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
      .where(and(eq(userAccounts.userId, userId), eq(accountLocations.connected, true)));

    return result[0]?.count || 0;
  }

  async countUserReviewsThisMonth(userId: string): Promise<number> {
    const startDate = startOfMonth(new Date());

    const result = await db
      .select({ count: countDistinct(reviews.id) })
      .from(reviews)
      .innerJoin(accountLocations, eq(reviews.locationId, accountLocations.locationId))
      .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
      .where(and(eq(userAccounts.userId, userId), gte(reviews.receivedAt, startDate), eq(reviews.consumesQuota, true)));

    return result[0]?.count || 0;
  }

  async countPendingReviews(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(reviews)
      .innerJoin(accountLocations, eq(reviews.locationId, accountLocations.locationId))
      .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
      .where(and(eq(userAccounts.userId, userId), eq(reviews.replyStatus, "pending")));

    return result[0]?.count || 0;
  }

  async getAverageRatingAcrossLocations(userId: string): Promise<number | null> {
    const result = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .innerJoin(accountLocations, eq(reviews.locationId, accountLocations.locationId))
      .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
      .where(eq(userAccounts.userId, userId));

    const value = result[0]?.avgRating;
    return value ? parseFloat(value) : null;
  }

  async getLocationSummaries(userId: string): Promise<LocationSummary[]> {
    const result = await db
      .select({
        locationId: locations.id,
        locationName: locations.name,
        photoUrl: locations.photoUrl,
        accountId: accountLocations.accountId,
        pendingCount: sql<number>`count(case when ${reviews.replyStatus} = 'pending' then 1 end)::int`,
        avgRating: avg(reviews.rating),
      })
      .from(locations)
      .innerJoin(accountLocations, eq(locations.id, accountLocations.locationId))
      .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
      .leftJoin(reviews, eq(reviews.locationId, locations.id))
      .where(and(eq(userAccounts.userId, userId), eq(accountLocations.connected, true)))
      .groupBy(locations.id, locations.name, locations.photoUrl, accountLocations.accountId);

    return result.map((row) => ({
      locationId: row.locationId,
      locationName: row.locationName,
      photoUrl: row.photoUrl,
      accountId: row.accountId,
      pendingCount: row.pendingCount,
      avgRating: row.avgRating ? parseFloat(row.avgRating) : null,
    }));
  }
}
