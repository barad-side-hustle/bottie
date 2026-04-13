import { eq, and, gte, inArray, isNotNull, isNull, notInArray, sql } from "drizzle-orm";
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
    await db.insert(leads).values(values).onConflictDoNothing();
  }

  async findSentEmails(): Promise<Set<string>> {
    const sentEmails = await db.select({ email: leads.email }).from(leads).where(eq(leads.status, "sent"));
    return new Set(sentEmails.map((l) => l.email).filter(Boolean) as string[]);
  }

  async findPendingLeads(excludeEmails: string[], limit: number, country?: string): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.status, "pending"),
          isNotNull(leads.email),
          excludeEmails.length > 0 ? notInArray(leads.email, excludeEmails) : undefined,
          country ? eq(leads.country, country) : undefined
        )
      )
      .limit(limit);
  }

  async updateStatus(id: string, status: Lead["status"], extra?: { sentAt?: Date; error?: string }): Promise<void> {
    await db
      .update(leads)
      .set({ status, ...extra })
      .where(eq(leads.id, id));
  }

  async findSkippedWithWebsite(excludeDomains: string[], limit: number): Promise<Lead[]> {
    const domainConditions = excludeDomains.map((domain) => sql`${leads.websiteUrl} NOT ILIKE ${"%" + domain + "%"}`);

    return db
      .select()
      .from(leads)
      .where(and(eq(leads.status, "skipped"), isNotNull(leads.websiteUrl), isNull(leads.email), ...domainConditions))
      .limit(limit);
  }

  async updateEmail(id: string, email: string): Promise<void> {
    await db
      .update(leads)
      .set({ email, status: "pending" as const })
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
}
