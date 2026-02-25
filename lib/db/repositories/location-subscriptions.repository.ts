import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationSubscriptions, type LocationSubscription, type LocationSubscriptionInsert } from "@/lib/db/schema";

export class LocationSubscriptionsRepository {
  async isLocationPaid(locationId: string): Promise<boolean> {
    const [result] = await db
      .select({ id: locationSubscriptions.id })
      .from(locationSubscriptions)
      .where(and(eq(locationSubscriptions.locationId, locationId), eq(locationSubscriptions.status, "active")))
      .limit(1);

    return !!result;
  }

  async isLocationPaidByUser(userId: string, locationId: string): Promise<boolean> {
    const [result] = await db
      .select({ id: locationSubscriptions.id })
      .from(locationSubscriptions)
      .where(
        and(
          eq(locationSubscriptions.userId, userId),
          eq(locationSubscriptions.locationId, locationId),
          eq(locationSubscriptions.status, "active")
        )
      )
      .limit(1);

    return !!result;
  }

  async getActiveForUser(userId: string): Promise<LocationSubscription[]> {
    return db
      .select()
      .from(locationSubscriptions)
      .where(and(eq(locationSubscriptions.userId, userId), eq(locationSubscriptions.status, "active")));
  }

  async getPaidLocationIds(userId: string): Promise<string[]> {
    const results = await db
      .select({ locationId: locationSubscriptions.locationId })
      .from(locationSubscriptions)
      .where(and(eq(locationSubscriptions.userId, userId), eq(locationSubscriptions.status, "active")));

    return results.map((r) => r.locationId);
  }

  async getActiveLocationCount(userId: string): Promise<number> {
    const results = await this.getActiveForUser(userId);
    return results.length;
  }

  async create(data: LocationSubscriptionInsert): Promise<LocationSubscription> {
    const [created] = await db.insert(locationSubscriptions).values(data).returning();

    if (!created) throw new Error("Failed to create location subscription");
    return created;
  }

  async cancel(userId: string, locationId: string): Promise<LocationSubscription> {
    const [updated] = await db
      .update(locationSubscriptions)
      .set({ status: "canceled", canceledAt: new Date() })
      .where(
        and(
          eq(locationSubscriptions.userId, userId),
          eq(locationSubscriptions.locationId, locationId),
          eq(locationSubscriptions.status, "active")
        )
      )
      .returning();

    if (!updated) throw new Error("No active location subscription found to cancel");
    return updated;
  }

  async findByPolarSubscriptionId(polarSubscriptionId: string): Promise<LocationSubscription | null> {
    const [result] = await db
      .select()
      .from(locationSubscriptions)
      .where(eq(locationSubscriptions.polarSubscriptionId, polarSubscriptionId))
      .limit(1);

    return result || null;
  }

  async cancelByPolarSubscriptionId(polarSubscriptionId: string): Promise<void> {
    await db
      .update(locationSubscriptions)
      .set({ status: "canceled", canceledAt: new Date() })
      .where(eq(locationSubscriptions.polarSubscriptionId, polarSubscriptionId));
  }

  async updateStatusByPolarSubscriptionId(polarSubscriptionId: string, status: "active" | "canceled"): Promise<void> {
    await db
      .update(locationSubscriptions)
      .set({
        status,
        ...(status === "canceled" ? { canceledAt: new Date() } : {}),
      })
      .where(eq(locationSubscriptions.polarSubscriptionId, polarSubscriptionId));
  }
}
