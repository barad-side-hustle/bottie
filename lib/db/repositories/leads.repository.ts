import { eq, and, inArray, isNotNull, notInArray } from "drizzle-orm";
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

  async findPendingLeads(excludeEmails: string[], limit: number): Promise<Lead[]> {
    return db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.status, "pending"),
          isNotNull(leads.email),
          excludeEmails.length > 0 ? notInArray(leads.email, excludeEmails) : undefined
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
}
