import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationAccessRequests, locationMembers, locations, type LocationAccessRequest } from "@/lib/db/schema";
import { user as userTable } from "@/lib/db/schema/auth.schema";

export interface AccessRequestWithRequester extends LocationAccessRequest {
  requester: { id: string; name: string; email: string; image: string | null };
  location: { id: string; name: string };
}

export class LocationAccessRequestsRepository {
  async create(requesterId: string, locationId: string, message?: string): Promise<LocationAccessRequest> {
    const [request] = await db
      .insert(locationAccessRequests)
      .values({ requesterId, locationId, message: message ?? null })
      .returning();
    return request;
  }

  async getPendingForLocation(locationId: string): Promise<AccessRequestWithRequester[]> {
    const results = await db
      .select({
        id: locationAccessRequests.id,
        requesterId: locationAccessRequests.requesterId,
        locationId: locationAccessRequests.locationId,
        status: locationAccessRequests.status,
        message: locationAccessRequests.message,
        reviewedBy: locationAccessRequests.reviewedBy,
        reviewedAt: locationAccessRequests.reviewedAt,
        createdAt: locationAccessRequests.createdAt,
        requesterName: userTable.name,
        requesterEmail: userTable.email,
        requesterImage: userTable.image,
        locationName: locations.name,
      })
      .from(locationAccessRequests)
      .innerJoin(userTable, eq(userTable.id, locationAccessRequests.requesterId))
      .innerJoin(locations, eq(locations.id, locationAccessRequests.locationId))
      .where(and(eq(locationAccessRequests.locationId, locationId), eq(locationAccessRequests.status, "pending")))
      .orderBy(locationAccessRequests.createdAt);

    return results.map((r) => ({
      id: r.id,
      requesterId: r.requesterId,
      locationId: r.locationId,
      status: r.status,
      message: r.message,
      reviewedBy: r.reviewedBy,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
      requester: { id: r.requesterId, name: r.requesterName, email: r.requesterEmail, image: r.requesterImage },
      location: { id: r.locationId, name: r.locationName },
    }));
  }

  async getPendingCountForUser(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locationAccessRequests)
      .innerJoin(
        locationMembers,
        and(
          eq(locationMembers.locationId, locationAccessRequests.locationId),
          eq(locationMembers.userId, userId),
          eq(locationMembers.role, "owner")
        )
      )
      .where(eq(locationAccessRequests.status, "pending"));
    return result?.count ?? 0;
  }

  async approve(requestId: string, reviewedBy: string): Promise<LocationAccessRequest> {
    const [updated] = await db
      .update(locationAccessRequests)
      .set({ status: "approved", reviewedBy, reviewedAt: new Date() })
      .where(eq(locationAccessRequests.id, requestId))
      .returning();
    return updated;
  }

  async reject(requestId: string, reviewedBy: string): Promise<LocationAccessRequest> {
    const [updated] = await db
      .update(locationAccessRequests)
      .set({ status: "rejected", reviewedBy, reviewedAt: new Date() })
      .where(eq(locationAccessRequests.id, requestId))
      .returning();
    return updated;
  }

  async getById(requestId: string): Promise<LocationAccessRequest | null> {
    const result = await db.query.locationAccessRequests.findFirst({
      where: eq(locationAccessRequests.id, requestId),
    });
    return result ?? null;
  }

  async hasPendingRequest(requesterId: string, locationId: string): Promise<boolean> {
    const result = await db.query.locationAccessRequests.findFirst({
      where: and(
        eq(locationAccessRequests.requesterId, requesterId),
        eq(locationAccessRequests.locationId, locationId),
        eq(locationAccessRequests.status, "pending")
      ),
    });
    return !!result;
  }
}
