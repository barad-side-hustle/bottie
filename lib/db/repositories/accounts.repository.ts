import { eq, and, inArray, sql, exists } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { googleAccounts, userAccounts, type GoogleAccount, type GoogleAccountInsert } from "@/lib/db/schema";
import type { AccountFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export class AccountsRepository extends BaseRepository<GoogleAccountInsert, GoogleAccount, Partial<GoogleAccount>> {
  constructor(private userId: string) {
    super();
  }

  private getAccessCondition(accountIdRef: typeof googleAccounts.id | string) {
    const accountIdValue = typeof accountIdRef === "string" ? sql`${accountIdRef}` : accountIdRef;
    return exists(
      db
        .select()
        .from(userAccounts)
        .where(and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, accountIdValue)))
    );
  }

  async get(accountId: string): Promise<GoogleAccount | null> {
    const result = await db.query.googleAccounts.findFirst({
      where: and(eq(googleAccounts.id, accountId), this.getAccessCondition(accountId)),
    });

    return result ?? null;
  }

  async list(filters: AccountFilters = {}, limit: number = 50): Promise<GoogleAccount[]> {
    const conditions = [
      sql`${googleAccounts.id} IN (
        SELECT ua.account_id FROM ${userAccounts} ua
        WHERE ua.user_id = ${this.userId}
      )`,
    ];

    if (filters.email) {
      conditions.push(eq(googleAccounts.email, filters.email));
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(googleAccounts.id, filters.ids));
    }

    const result = await db.query.googleAccounts.findMany({
      where: and(...conditions),
      limit,
    });

    return result;
  }

  async create(data: GoogleAccountInsert): Promise<GoogleAccount> {
    return await db.transaction(async (tx) => {
      const [account] = await tx.insert(googleAccounts).values(data).returning();

      await tx.insert(userAccounts).values({
        userId: this.userId,
        accountId: account.id,
        role: "owner",
      });

      return account;
    });
  }

  async update(accountId: string, data: Partial<GoogleAccount>): Promise<GoogleAccount> {
    const [updated] = await db
      .update(googleAccounts)
      .set(data)
      .where(and(eq(googleAccounts.id, accountId), this.getAccessCondition(accountId)))
      .returning();

    if (!updated) {
      throw new Error("Account not found or access denied");
    }

    return updated;
  }

  async delete(accountId: string): Promise<void> {
    await db.delete(googleAccounts).where(and(eq(googleAccounts.id, accountId), this.getAccessCondition(accountId)));
  }

  async findByEmail(email: string): Promise<GoogleAccount | null> {
    const result = await db.query.googleAccounts.findFirst({
      where: and(
        eq(googleAccounts.email, email),
        sql`${googleAccounts.id} IN (
          SELECT ua.account_id FROM ${userAccounts} ua
          WHERE ua.user_id = ${this.userId}
        )`
      ),
    });

    return result ?? null;
  }

  async updateLastSynced(accountId: string): Promise<GoogleAccount> {
    return this.update(accountId, {
      lastSynced: new Date(),
    });
  }
}
