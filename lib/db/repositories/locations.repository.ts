import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locations, accountLocations, userAccounts, type Location, type LocationInsert } from "@/lib/db/schema";
import type { LocationFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { NotFoundError } from "@/lib/api/errors";

export type { Location, LocationInsert };

export class LocationsRepository extends BaseRepository<LocationInsert, Location, Partial<Location>> {
  constructor(private userId: string) {
    super();
  }

  private async verifyAccessToLocation(locationId: string): Promise<boolean> {
    const accessRecords = await db.query.accountLocations.findMany({
      where: eq(accountLocations.locationId, locationId),
      with: {
        account: {
          with: {
            userAccounts: {
              where: eq(userAccounts.userId, this.userId),
            },
          },
        },
      },
    });

    return accessRecords.some((record) => record.account.userAccounts && record.account.userAccounts.length > 0);
  }

  async get(locationId: string): Promise<Location | null> {
    if (!(await this.verifyAccessToLocation(locationId))) return null;

    const result = await db.query.locations.findFirst({
      where: eq(locations.id, locationId),
    });

    return result || null;
  }

  async list(filters: LocationFilters = {}): Promise<Location[]> {
    const userAccountRecords = await db.query.userAccounts.findMany({
      where: eq(userAccounts.userId, this.userId),
    });

    const accountIds = userAccountRecords.map((ua) => ua.accountId);
    if (accountIds.length === 0) return [];

    const accountLocationRecords = await db.query.accountLocations.findMany({
      where: and(
        inArray(accountLocations.accountId, accountIds),
        filters.connected !== undefined ? eq(accountLocations.connected, filters.connected) : undefined
      ),
    });

    const locationIds = [...new Set(accountLocationRecords.map((al) => al.locationId))];
    if (locationIds.length === 0) return [];

    const conditions = [inArray(locations.id, locationIds)];

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(locations.id, filters.ids));
    }

    const results = await db.query.locations.findMany({
      where: and(...conditions),
    });

    return results;
  }

  async create(data: LocationInsert): Promise<Location> {
    const existing = await this.findByGoogleLocationId(data.googleLocationId);
    if (existing) {
      return existing;
    }

    const [location] = await db.insert(locations).values(data).returning();
    return location;
  }

  async findOrCreate(data: LocationInsert): Promise<Location> {
    const existing = await this.findByGoogleLocationId(data.googleLocationId);
    if (existing) {
      return existing;
    }
    return await this.create(data);
  }

  async update(locationId: string, data: Partial<Location>): Promise<Location> {
    if (!(await this.verifyAccessToLocation(locationId))) {
      throw new NotFoundError("Access denied");
    }

    const [updated] = await db
      .update(locations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(locations.id, locationId))
      .returning();

    if (!updated) {
      throw new NotFoundError("Location not found or access denied");
    }

    return updated;
  }

  async delete(locationId: string): Promise<void> {
    if (!(await this.verifyAccessToLocation(locationId))) {
      throw new NotFoundError("Access denied");
    }

    const connections = await db.query.accountLocations.findMany({
      where: eq(accountLocations.locationId, locationId),
    });

    if (connections.length > 0) {
      throw new Error("Cannot delete location with active connections. Disconnect all accounts first.");
    }

    const [deleted] = await db.delete(locations).where(eq(locations.id, locationId)).returning();

    if (!deleted) {
      throw new NotFoundError("Location not found or access denied");
    }
  }

  async findByGoogleLocationId(googleLocationId: string): Promise<Location | null> {
    const result = await db.query.locations.findFirst({
      where: eq(locations.googleLocationId, googleLocationId),
    });

    return result || null;
  }

  async getWithConnections(locationId: string): Promise<
    | (Location & {
        accountLocations: Array<{
          id: string;
          accountId: string;
          connected: boolean;
          connectedAt: Date;
          account: {
            id: string;
            email: string;
            accountName: string;
            userAccounts: Array<{
              userId: string;
              role: string;
            }>;
          };
        }>;
      })
    | null
  > {
    if (!(await this.verifyAccessToLocation(locationId))) return null;

    const result = await db.query.locations.findFirst({
      where: eq(locations.id, locationId),
      with: {
        accountLocations: {
          with: {
            account: {
              with: {
                userAccounts: true,
              },
            },
          },
        },
      },
    });

    return result || null;
  }
}
