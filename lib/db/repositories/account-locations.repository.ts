import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  accountLocations,
  userAccounts,
  locations,
  type AccountLocation,
  type AccountLocationInsert,
} from "@/lib/db/schema";
import { NotFoundError } from "@/lib/api/errors";

export type { AccountLocation, AccountLocationInsert };

export class AccountLocationsRepository {
  constructor(
    private userId: string,
    private accountId: string
  ) {}

  private async verifyAccess(): Promise<boolean> {
    const access = await db.query.userAccounts.findFirst({
      where: and(eq(userAccounts.userId, this.userId), eq(userAccounts.accountId, this.accountId)),
    });
    return !!access;
  }

  async get(accountLocationId: string): Promise<AccountLocation | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.accountLocations.findFirst({
      where: and(eq(accountLocations.id, accountLocationId), eq(accountLocations.accountId, this.accountId)),
    });

    return result || null;
  }

  async getByLocationId(locationId: string): Promise<AccountLocation | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.accountLocations.findFirst({
      where: and(eq(accountLocations.locationId, locationId), eq(accountLocations.accountId, this.accountId)),
    });

    return result || null;
  }

  async list(): Promise<AccountLocation[]> {
    if (!(await this.verifyAccess())) return [];

    const results = await db.query.accountLocations.findMany({
      where: eq(accountLocations.accountId, this.accountId),
    });

    return results;
  }

  async listWithLocations(): Promise<
    Array<
      AccountLocation & {
        location: {
          id: string;
          googleLocationId: string;
          name: string;
          address: string;
        };
      }
    >
  > {
    if (!(await this.verifyAccess())) return [];

    const results = await db.query.accountLocations.findMany({
      where: eq(accountLocations.accountId, this.accountId),
      with: {
        location: true,
      },
    });

    return results;
  }

  async create(data: AccountLocationInsert): Promise<AccountLocation> {
    if (!(await this.verifyAccess())) throw new Error("Access denied");

    const existing = await db.query.accountLocations.findFirst({
      where: and(eq(accountLocations.accountId, data.accountId), eq(accountLocations.locationId, data.locationId)),
    });

    if (existing) {
      if (!existing.connected) {
        return this.reconnect(existing.id);
      }
      return existing;
    }

    const [accountLocation] = await db.insert(accountLocations).values(data).returning();
    return accountLocation;
  }

  async update(accountLocationId: string, data: Partial<AccountLocation>): Promise<AccountLocation> {
    if (!(await this.verifyAccess())) {
      throw new NotFoundError("Access denied");
    }

    const [updated] = await db
      .update(accountLocations)
      .set(data)
      .where(and(eq(accountLocations.id, accountLocationId), eq(accountLocations.accountId, this.accountId)))
      .returning();

    if (!updated) {
      throw new NotFoundError("Account location not found or access denied");
    }

    return updated;
  }

  async delete(accountLocationId: string): Promise<void> {
    if (!(await this.verifyAccess())) {
      throw new NotFoundError("Access denied");
    }

    const [deleted] = await db
      .delete(accountLocations)
      .where(and(eq(accountLocations.id, accountLocationId), eq(accountLocations.accountId, this.accountId)))
      .returning();

    if (!deleted) {
      throw new NotFoundError("Account location not found or access denied");
    }
  }

  async disconnect(accountLocationId: string): Promise<AccountLocation> {
    return this.update(accountLocationId, { connected: false });
  }

  async reconnect(accountLocationId: string): Promise<AccountLocation> {
    return this.update(accountLocationId, {
      connected: true,
      connectedAt: new Date(),
    });
  }

  async findByGoogleBusinessId(googleBusinessId: string): Promise<AccountLocation | null> {
    if (!(await this.verifyAccess())) return null;

    const result = await db.query.accountLocations.findFirst({
      where: and(
        eq(accountLocations.googleBusinessId, googleBusinessId),
        eq(accountLocations.accountId, this.accountId)
      ),
    });

    return result || null;
  }

  async checkExists(googleBusinessId: string): Promise<boolean> {
    const existing = await this.findByGoogleBusinessId(googleBusinessId);
    return !!existing;
  }

  async findOrCreate(
    googleBusinessId: string,
    googleLocationId: string,
    locationData: {
      name: string;
      address: string;
      city?: string | null;
      state?: string | null;
      postalCode?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
      websiteUrl?: string | null;
      mapsUrl?: string | null;
      reviewUrl?: string | null;
      description?: string | null;
      photoUrl?: string | null;
      starConfigs: {
        1: { customInstructions: string; autoReply: boolean };
        2: { customInstructions: string; autoReply: boolean };
        3: { customInstructions: string; autoReply: boolean };
        4: { customInstructions: string; autoReply: boolean };
        5: { customInstructions: string; autoReply: boolean };
      };
    }
  ): Promise<{ accountLocation: AccountLocation; location: typeof locations.$inferSelect; isNew: boolean }> {
    if (!(await this.verifyAccess())) throw new Error("Access denied");

    let location = await db.query.locations.findFirst({
      where: eq(locations.googleLocationId, googleLocationId),
    });

    let isNew = false;

    if (!location) {
      const [newLocation] = await db
        .insert(locations)
        .values({
          googleLocationId,
          ...locationData,
        })
        .returning();
      location = newLocation;
      isNew = true;
    }

    let accountLocation = await db.query.accountLocations.findFirst({
      where: and(eq(accountLocations.accountId, this.accountId), eq(accountLocations.locationId, location.id)),
    });

    if (!accountLocation) {
      const [newAccountLocation] = await db
        .insert(accountLocations)
        .values({
          accountId: this.accountId,
          locationId: location.id,
          googleBusinessId,
          connected: true,
        })
        .returning();
      accountLocation = newAccountLocation;
      isNew = true;
    } else if (!accountLocation.connected) {
      const [reconnected] = await db
        .update(accountLocations)
        .set({ connected: true, connectedAt: new Date() })
        .where(eq(accountLocations.id, accountLocation.id))
        .returning();
      accountLocation = reconnected;
    }

    return { accountLocation, location, isNew };
  }
}
