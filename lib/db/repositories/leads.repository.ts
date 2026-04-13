import { eq, and, gte, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads, type Lead, type LeadInsert } from "@/lib/db/schema";

export class LeadsRepository {
  async findExistingPlaceIds(placeIds: string[]): Promise<Set<string>> {
    if (placeIds.length === 0) return new Set();
    const existing = await db
      .select({ googlePlaceId: leads.googlePlaceId })
      .from(leads)
      .where(inArray(leads.googlePlaceId, placeIds));
    return new Set(existing.map((l) => l.googlePlaceId));
  }

  async insertMany(values: LeadInsert[]): Promise<void> {
    if (values.length === 0) return;
    const BATCH_SIZE = 100;
    for (let i = 0; i < values.length; i += BATCH_SIZE) {
      const batch = values.slice(i, i + BATCH_SIZE);
      await db.insert(leads).values(batch).onConflictDoNothing();
    }
  }

  async findPendingLeads(limit: number, country?: string): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.status, "pending"),
          isNotNull(leads.email),
          sql`${leads.email} NOT IN (SELECT ${leads.email} FROM ${leads} WHERE ${leads.status} = 'sent')`,
          country ? eq(leads.country, country) : undefined
        )
      )
      .limit(limit);
  }

  async updateStatus(id: string, status: Lead["status"], extra?: { sentAt?: Date; error?: string }): Promise<void> {
    await db
      .update(leads)
      .set({ status, updatedAt: new Date(), ...extra })
      .where(eq(leads.id, id));
  }

  async findLeadsNeedingEmail(excludeDomains: string[], limit: number): Promise<Lead[]> {
    const domainConditions = excludeDomains.map((domain) => sql`${leads.websiteUrl} NOT ILIKE ${"%" + domain + "%"}`);

    return db
      .select()
      .from(leads)
      .where(and(eq(leads.status, "pending"), isNotNull(leads.websiteUrl), isNull(leads.email), ...domainConditions))
      .limit(limit);
  }

  async updateEmail(id: string, email: string): Promise<void> {
    await db
      .update(leads)
      .set({ email, status: "pending" as const, updatedAt: new Date() })
      .where(eq(leads.id, id));
  }

  async countSentByCountry(since: Date): Promise<Array<{ country: string; count: number }>> {
    const rows = await db
      .select({ country: leads.country, count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.status, "sent"), gte(leads.sentAt, since)))
      .groupBy(leads.country);
    return rows;
  }

  async countPendingByCountry(): Promise<Array<{ country: string; count: number }>> {
    const rows = await db
      .select({ country: leads.country, count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.status, "pending"), isNotNull(leads.email)))
      .groupBy(leads.country);
    return rows;
  }

  async countFoundSince(since: Date): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(gte(leads.createdAt, since));
    return rows[0]?.count ?? 0;
  }

  async countEmailsScrapedSince(since: Date): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(isNotNull(leads.email), gte(leads.updatedAt, since)));
    return rows[0]?.count ?? 0;
  }

  async countSkippedSince(since: Date): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.status, "skipped"), gte(leads.updatedAt, since)));
    return rows[0]?.count ?? 0;
  }
}
