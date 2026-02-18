import { eq, and, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locations, accountLocations, userAccounts, type Location, type LocationInsert } from "@/lib/db/schema";
import type { LocationFilters } from "@/lib/types";
import { BaseRepository } from "./base.repository";
import { NotFoundError } from "@/lib/api/errors";

export type { Location };

export class LocationsRepository extends BaseRepository<LocationInsert, Location, Partial<Location>> {
  constructor(private userId: string) {
    super();
  }

  private getAccessCondition(locationIdRef: typeof locations.id | string) {
    const locationIdValue = typeof locationIdRef === "string" ? sql`${locationIdRef}` : locationIdRef;
    return sql`EXISTS (
      SELECT 1 FROM ${accountLocations} al
      INNER JOIN ${userAccounts} ua ON ua.account_id = al.account_id
      WHERE al.location_id = ${locationIdValue}
      AND ua.user_id = ${this.userId}
    )`;
  }

  async get(locationId: string): Promise<Location | null> {
    const result = await db.query.locations.findFirst({
      where: and(eq(locations.id, locationId), this.getAccessCondition(locationId)),
    });

    return result || null;
  }

  async list(filters: LocationFilters = {}, limit: number = 50): Promise<Location[]> {
    const conditions = [
      sql`${locations.id} IN (
        SELECT al.location_id FROM ${accountLocations} al
        INNER JOIN ${userAccounts} ua ON ua.account_id = al.account_id
        WHERE ua.user_id = ${this.userId}
        ${filters.connected !== undefined ? sql`AND al.connected = ${filters.connected}` : sql``}
      )`,
    ];

    if (filters.ids && filters.ids.length > 0) {
      conditions.push(inArray(locations.id, filters.ids));
    }

    const results = await db.query.locations.findMany({
      where: and(...conditions),
      limit,
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
    const [updated] = await db
      .update(locations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(locations.id, locationId), this.getAccessCondition(locationId)))
      .returning();

    if (!updated) {
      throw new NotFoundError("Location not found or access denied");
    }

    return updated;
  }

  async delete(locationId: string): Promise<void> {
    const connections = await db.query.accountLocations.findMany({
      where: eq(accountLocations.locationId, locationId),
    });

    if (connections.length > 0) {
      throw new Error("Cannot delete location with active connections. Disconnect all accounts first.");
    }

    const [deleted] = await db
      .delete(locations)
      .where(and(eq(locations.id, locationId), this.getAccessCondition(locationId)))
      .returning();

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
    const result = await db.query.locations.findFirst({
      where: and(eq(locations.id, locationId), this.getAccessCondition(locationId)),
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
