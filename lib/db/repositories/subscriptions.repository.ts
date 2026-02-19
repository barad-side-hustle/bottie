import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { subscriptions, type Subscription, type SubscriptionInsert } from "@/lib/db/schema";

export class SubscriptionsRepository {
  async getActiveSubscriptionForUser(userId: string): Promise<Subscription | null> {
    const [result] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
      .limit(1);

    return result || null;
  }

  async getByUserId(userId: string): Promise<Subscription | null> {
    const [result] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

    return result || null;
  }

  async create(data: SubscriptionInsert): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(data).returning();

    if (!created) throw new Error("Failed to create subscription");
    return created;
  }

  async update(id: string, data: Partial<Omit<Subscription, "id" | "userId" | "createdAt">>): Promise<Subscription> {
    const [updated] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();

    if (!updated) throw new Error("Failed to update subscription");
    return updated;
  }

  async upsert(userId: string, data: Omit<SubscriptionInsert, "userId">): Promise<Subscription> {
    const existing = await this.getByUserId(userId);

    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({
        userId,
        ...data,
      });
    }
  }

  async cancel(userId: string): Promise<Subscription> {
    const existing = await this.getActiveSubscriptionForUser(userId);

    if (!existing) {
      throw new Error("No active subscription found");
    }

    return this.update(existing.id, {
      status: "canceled",
    });
  }

  async hasPaidSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    return !!subscription?.polarSubscriptionId;
  }
}
