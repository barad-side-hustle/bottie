import { eq, and, gte, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { zoeLeads, type ZoeLead, type ZoeLeadInsert } from "@/lib/db/schema";

export class ZoeLeadsRepository {
  async findExistingPlaceIds(placeIds: string[]): Promise<Set<string>> {
    if (placeIds.length === 0) return new Set();
    const existing = await db
      .select({ googlePlaceId: zoeLeads.googlePlaceId })
      .from(zoeLeads)
      .where(inArray(zoeLeads.googlePlaceId, placeIds));
    return new Set(existing.map((l) => l.googlePlaceId));
  }

  async insertMany(values: ZoeLeadInsert[]): Promise<void> {
    if (values.length === 0) return;
    const BATCH_SIZE = 100;
    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      const batch = values.slice(i, i + BATCH_SIZE);
      await db.insert(zoeLeads).values(batch).onConflictDoNothing();
    }
  }

  async findPendingLeads(limit: number, country?: string): Promise<ZoeLead[]> {
    return db
      .select()
      .from(zoeLeads)
      .where(
        and(
          eq(zoeLeads.status, "pending"),
          isNotNull(zoeLeads.email),
          sql`${zoeLeads.email} NOT IN (SELECT ${zoeLeads.email} FROM ${zoeLeads} WHERE ${zoeLeads.status} = 'sent')`,
          country ? eq(zoeLeads.country, country) : undefined
        )
      )
      .limit(limit);
  }

  async updateStatus(id: string, status: ZoeLead["status"], extra?: { sentAt?: Date; error?: string }): Promise<void> {
    await db
      .update(zoeLeads)
      .set({ status, updatedAt: new Date(), ...extra })
      .where(eq(zoeLeads.id, id));
  }

  async findLeadsNeedingEmail(excludeDomains: string[], limit: number): Promise<ZoeLead[]> {
    const domainConditions = excludeDomains.map(
      (domain) => sql`${zoeLeads.websiteUrl} NOT ILIKE ${"%" + domain + "%"}`
    );

    return db
      .select()
      .from(zoeLeads)
      .where(
        and(eq(zoeLeads.status, "pending"), isNotNull(zoeLeads.websiteUrl), isNull(zoeLeads.email), ...domainConditions)
      )
      .limit(limit);
  }

  async updateEmail(id: string, email: string): Promise<void> {
    await db
      .update(zoeLeads)
      .set({ email, status: "pending" as const, updatedAt: new Date() })
      .where(eq(zoeLeads.id, id));
  }

  async countSentByCountry(since: Date): Promise<Array<{ country: string; count: number }>> {
    const rows = await db
      .select({ country: zoeLeads.country, count: sql<number>`count(*)::int` })
      .from(zoeLeads)
      .where(and(eq(zoeLeads.status, "sent"), gte(zoeLeads.sentAt, since)))
      .groupBy(zoeLeads.country);
    return rows;
  }

  async countPendingByCountry(): Promise<Array<{ country: string; count: number }>> {
    const rows = await db
      .select({ country: zoeLeads.country, count: sql<number>`count(*)::int` })
      .from(zoeLeads)
      .where(and(eq(zoeLeads.status, "pending"), isNotNull(zoeLeads.email)))
      .groupBy(zoeLeads.country);
    return rows;
  }

  async countFoundSince(since: Date): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(zoeLeads)
      .where(gte(zoeLeads.createdAt, since));
    return rows[0]?.count ?? 0;
  }

  async countEmailsScrapedSince(since: Date): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(zoeLeads)
      .where(and(isNotNull(zoeLeads.email), gte(zoeLeads.updatedAt, since)));
    return rows[0]?.count ?? 0;
  }

  async countSkippedSince(since: Date): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(zoeLeads)
      .where(and(eq(zoeLeads.status, "skipped"), gte(zoeLeads.updatedAt, since)));
    return rows[0]?.count ?? 0;
  }
}
