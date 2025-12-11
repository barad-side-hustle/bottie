import type { AccountFilters, AccountLocationFilters, Account, AccountCreate, AccountWithLocations } from "@/lib/types";

export type { AccountWithLocations };
import { AccountsRepository } from "@/lib/db/repositories";
import { db } from "@/lib/db/client";
import { accountLocations, userAccounts } from "@/lib/db/schema";
import { eq, and, inArray, type SQL } from "drizzle-orm";

export class AccountsController {
  private repository: AccountsRepository;
  private userId: string;

  constructor(userId: string) {
    this.repository = new AccountsRepository(userId);
    this.userId = userId;
  }

  async getAccounts(filters: AccountFilters = {}): Promise<Account[]> {
    return this.repository.list(filters);
  }

  async getAccount(accountId: string): Promise<Account> {
    const account = await this.repository.get(accountId);
    if (!account) throw new Error("Account not found");
    return account;
  }

  async createAccount(data: AccountCreate): Promise<Account> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      return this.repository.update(existing.id, {
        googleRefreshToken: data.googleRefreshToken,
        googleAccountName: data.googleAccountName,
      });
    }
    return this.repository.create(data);
  }

  async updateAccount(accountId: string, data: Partial<Account>): Promise<Account> {
    await this.getAccount(accountId);
    return this.repository.update(accountId, data);
  }

  async deleteAccount(accountId: string): Promise<void> {
    await this.getAccount(accountId);
    return this.repository.delete(accountId);
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.repository.findByEmail(email);
  }

  async updateLastSynced(accountId: string): Promise<Account> {
    return this.repository.updateLastSynced(accountId);
  }

  async updateRefreshToken(accountId: string, refreshToken: string): Promise<Account> {
    return this.updateAccount(accountId, {
      googleRefreshToken: refreshToken,
    });
  }

  async getAccountsWithLocations(
    accountFilters: AccountFilters = {},
    locationFilters: AccountLocationFilters = {}
  ): Promise<AccountWithLocations[]> {
    const accountConditions = [eq(userAccounts.userId, this.userId)];

    if (accountFilters.ids && accountFilters.ids.length > 0) {
      accountConditions.push(inArray(userAccounts.accountId, accountFilters.ids));
    }

    const locationConditions: SQL[] = [];

    if (locationFilters.connected !== undefined) {
      locationConditions.push(eq(accountLocations.connected, locationFilters.connected));
    }

    if (locationFilters.ids && locationFilters.ids.length > 0) {
      locationConditions.push(inArray(accountLocations.id, locationFilters.ids));
    }

    const userAccountsResult = await db.query.userAccounts.findMany({
      where: and(...accountConditions),
      with: {
        account: {
          with: {
            accountLocations:
              locationConditions.length > 0
                ? {
                    where: and(...locationConditions),
                    with: { location: true },
                  }
                : { with: { location: true } },
          },
        },
      },
    });

    return userAccountsResult.map((ua) => ({
      ...ua.account,
      accountLocations: ua.account.accountLocations,
    })) as AccountWithLocations[];
  }
}
