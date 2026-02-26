import crypto from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationInvitations, locations, type LocationInvitation } from "@/lib/db/schema";
import { user as userTable } from "@/lib/db/schema/auth.schema";

interface InvitationWithDetails extends LocationInvitation {
  location: { id: string; name: string };
  inviter: { id: string; name: string };
}

export class LocationInvitationsRepository {
  async create(locationId: string, email: string, role: "admin", invitedBy: string): Promise<LocationInvitation> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await db
      .insert(locationInvitations)
      .values({ locationId, email, role, invitedBy, token, expiresAt })
      .returning();
    return invitation;
  }

  async getByToken(token: string): Promise<InvitationWithDetails | null> {
    const results = await db
      .select({
        id: locationInvitations.id,
        locationId: locationInvitations.locationId,
        email: locationInvitations.email,
        role: locationInvitations.role,
        invitedBy: locationInvitations.invitedBy,
        token: locationInvitations.token,
        status: locationInvitations.status,
        expiresAt: locationInvitations.expiresAt,
        createdAt: locationInvitations.createdAt,
        locationName: locations.name,
        inviterName: userTable.name,
      })
      .from(locationInvitations)
      .innerJoin(locations, eq(locations.id, locationInvitations.locationId))
      .innerJoin(userTable, eq(userTable.id, locationInvitations.invitedBy))
      .where(eq(locationInvitations.token, token))
      .limit(1);

    if (results.length === 0) return null;
    const r = results[0];

    return {
      id: r.id,
      locationId: r.locationId,
      email: r.email,
      role: r.role,
      invitedBy: r.invitedBy,
      token: r.token,
      status: r.status,
      expiresAt: r.expiresAt,
      createdAt: r.createdAt,
      location: { id: r.locationId, name: r.locationName },
      inviter: { id: r.invitedBy, name: r.inviterName },
    };
  }

  async getPendingForLocation(locationId: string): Promise<LocationInvitation[]> {
    return db.query.locationInvitations.findMany({
      where: and(eq(locationInvitations.locationId, locationId), eq(locationInvitations.status, "pending")),
      orderBy: locationInvitations.createdAt,
    });
  }

  async accept(token: string): Promise<LocationInvitation> {
    const [updated] = await db
      .update(locationInvitations)
      .set({ status: "accepted" })
      .where(and(eq(locationInvitations.token, token), eq(locationInvitations.status, "pending")))
      .returning();
    return updated;
  }

  async cancel(invitationId: string): Promise<void> {
    await db.delete(locationInvitations).where(eq(locationInvitations.id, invitationId));
  }
}
