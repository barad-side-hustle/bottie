import { eq, and, gte, countDistinct, count, avg, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accountLocations, locationMembers, locations, reviews, reviewResponses, userAccounts } from "@/lib/db/schema";
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
  pendingCount: number;
  avgRating: number | null;
}

function userLocationIdsSql(userId: string) {
  return sql`(
    SELECT al.location_id FROM ${accountLocations} al
    INNER JOIN ${userAccounts} ua ON ua.account_id = al.account_id
    WHERE ua.user_id = ${userId} AND al.connected = true
    UNION
    SELECT lm.location_id FROM ${locationMembers} lm
    WHERE lm.user_id = ${userId}
  )`;
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
      .select({ count: sql<number>`count(*)::int` })
      .from(sql`${userLocationIdsSql(userId)} as user_locs(location_id)`);

    return result[0]?.count || 0;
  }

  async countUserReviewsThisMonth(userId: string): Promise<number> {
    const startDate = startOfMonth(new Date());

    const result = await db
      .select({ count: countDistinct(reviews.id) })
      .from(reviews)
      .where(
        and(
          sql`${reviews.locationId} IN ${userLocationIdsSql(userId)}`,
          gte(reviews.receivedAt, startDate),
          eq(reviews.consumesQuota, true)
        )
      );

    return result[0]?.count || 0;
  }

  async countLocationReviewsThisMonth(locationId: string): Promise<number> {
    const startDate = startOfMonth(new Date());

    const result = await db
      .select({ count: countDistinct(reviews.id) })
      .from(reviews)
      .where(and(eq(reviews.locationId, locationId), gte(reviews.receivedAt, startDate)));

    return result[0]?.count || 0;
  }

  async countPendingReviews(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(sql`${reviews.locationId} IN ${userLocationIdsSql(userId)}`, eq(reviews.replyStatus, "pending")));

    return result[0]?.count || 0;
  }

  async getAverageRatingAcrossLocations(userId: string): Promise<number | null> {
    const result = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(sql`${reviews.locationId} IN ${userLocationIdsSql(userId)}`);

    const value = result[0]?.avgRating;
    return value ? parseFloat(value) : null;
  }

  async getLocationSummaries(userId: string): Promise<LocationSummary[]> {
    const result = await db
      .select({
        locationId: locations.id,
        locationName: locations.name,
        photoUrl: locations.photoUrl,
        pendingCount: sql<number>`count(case when ${reviews.replyStatus} = 'pending' then 1 end)::int`,
        avgRating: avg(reviews.rating),
      })
      .from(locations)
      .leftJoin(reviews, eq(reviews.locationId, locations.id))
      .where(sql`${locations.id} IN ${userLocationIdsSql(userId)}`)
      .groupBy(locations.id, locations.name, locations.photoUrl);

    return result.map((row) => ({
      locationId: row.locationId,
      locationName: row.locationName,
      photoUrl: row.photoUrl,
      pendingCount: row.pendingCount,
      avgRating: row.avgRating ? parseFloat(row.avgRating) : null,
    }));
  }
}
