import { eq, and, inArray, sql, exists } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accounts, userAccounts, type Account, type AccountInsert } from "@/lib/db/schema";
import type { AccountFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";

export class AccountsRepository extends BaseRepository<AccountInsert, Account, Partial<Account>> {
  constructor(private userId: string) {
    super();
  }

  private getAccessCondition(accountIdRef: typeof accounts.id | string) {
    const accountIdValue = typeof accountIdRef === "string" ? sql`${accountIdRef}` : accountIdRef;
    return exists(
      db
        .select()
        .from(userAccounts)
        .where(and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, accountIdValue)))
    );
  }

  async get(accountId: string): Promise<Account | null> {
    const result = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), this.getAccessCondition(accountId)),
    });

    return result ?? null;
  }

  async list(filters: AccountFilters = {}, limit: number = 50): Promise<Account[]> {
    const conditions = [
      sql`${accounts.id} IN (
        SELECT ua.account_id FROM ${userAccounts} ua
        WHERE ua.user_id = ${this.userId}
      )`,
    ];

    if (filters.email) {
      conditions.push(eq(accounts.email, filters.email));
    }

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(accounts.id, filters.ids));
    }

    const result = await db.query.accounts.findMany({
      where: and(...conditions),
      limit,
    });

    return result;
  }

  async create(data: AccountInsert): Promise<Account> {
    return await db.transaction(async (tx) => {
      const [account] = await tx.insert(accounts).values(data).returning();

      await tx.insert(userAccounts).values({
        userId: this.userId,
        accountId: account.id,
        role: "owner",
      });

      return account;
    });
  }

  async update(accountId: string, data: Partial<Account>): Promise<Account> {
    const [updated] = await db
      .update(accounts)
      .set(data)
      .where(and(eq(accounts.id, accountId), this.getAccessCondition(accountId)))
      .returning();

    if (!updated) {
      throw new Error("Account not found or access denied");
    }

    return updated;
  }

  async delete(accountId: string): Promise<void> {
    await db.delete(accounts).where(and(eq(accounts.id, accountId), this.getAccessCondition(accountId)));
  }

  async findByEmail(email: string): Promise<Account | null> {
    const result = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.email, email),
        sql`${accounts.id} IN (
          SELECT ua.account_id FROM ${userAccounts} ua
          WHERE ua.user_id = ${this.userId}
        )`
      ),
    });

    return result ?? null;
  }

  async updateLastSynced(accountId: string): Promise<Account> {
    return this.update(accountId, {
      lastSynced: new Date(),
    });
  }
}
