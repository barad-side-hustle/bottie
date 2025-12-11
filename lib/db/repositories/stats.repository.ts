import { eq, and, gte, countDistinct } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accountLocations, reviews, userAccounts } from "@/lib/db/schema";
import { startOfMonth } from "date-fns";

export class StatsRepository {
  async countUserLocations(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ locationId: accountLocations.locationId })
        .from(accountLocations)
        .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
        .where(and(eq(userAccounts.userId, userId), eq(accountLocations.connected, true)));

      const uniqueLocationIds = new Set(result.map((r) => r.locationId));
      return uniqueLocationIds.size;
    } catch (error) {
      console.error("Error counting user locations:", error);
      return 0;
    }
  }

  async countUserReviewsThisMonth(userId: string): Promise<number> {
    try {
      const startDate = startOfMonth(new Date());

      const result = await db
        .select({ count: countDistinct(reviews.id) })
        .from(reviews)
        .innerJoin(accountLocations, eq(reviews.locationId, accountLocations.locationId))
        .innerJoin(userAccounts, eq(accountLocations.accountId, userAccounts.accountId))
        .where(
          and(eq(userAccounts.userId, userId), gte(reviews.receivedAt, startDate), eq(reviews.consumesQuota, true))
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error counting user reviews this month:", error);
      return 0;
    }
  }
}
