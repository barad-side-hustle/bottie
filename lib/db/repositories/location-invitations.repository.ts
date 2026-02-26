import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationInvitations, locations, type LocationInvitation } from "@/lib/db/schema";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import type { DbClient } from "./location-members.repository";

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

interface InvitationWithDetails extends LocationInvitation {
  location: { id: string; name: string };
  inviter: { id: string; name: string };
}

export class LocationInvitationsRepository {
  async create(
    locationId: string,
    email: string,
    role: "admin",
    invitedBy: string
  ): Promise<{ invitation: LocationInvitation; rawToken: string }> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const token = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invitation] = await db
      .insert(locationInvitations)
      .values({ locationId, email, role, invitedBy, token, expiresAt })
      .returning();
    return { invitation, rawToken };
  }

  async getById(id: string): Promise<LocationInvitation | null> {
    return (await db.query.locationInvitations.findFirst({ where: eq(locationInvitations.id, id) })) ?? null;
  }

  async getByToken(rawToken: string): Promise<InvitationWithDetails | null> {
    const token = hashToken(rawToken);
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
      where: and(
        eq(locationInvitations.locationId, locationId),
        eq(locationInvitations.status, "pending"),
        gt(locationInvitations.expiresAt, new Date())
      ),
      orderBy: locationInvitations.createdAt,
    });
  }

  async accept(rawToken: string, txClient: DbClient = db): Promise<LocationInvitation | null> {
    const token = hashToken(rawToken);
    const [updated] = await txClient
      .update(locationInvitations)
      .set({ status: "accepted" })
      .where(and(eq(locationInvitations.token, token), eq(locationInvitations.status, "pending")))
      .returning();
    return updated ?? null;
  }

  async findPendingByEmail(locationId: string, email: string): Promise<LocationInvitation | null> {
    return (
      (await db.query.locationInvitations.findFirst({
        where: and(
          eq(locationInvitations.locationId, locationId),
          eq(locationInvitations.email, email.toLowerCase()),
          eq(locationInvitations.status, "pending")
        ),
      })) ?? null
    );
  }

  async cancel(invitationId: string): Promise<void> {
    await db.update(locationInvitations).set({ status: "cancelled" }).where(eq(locationInvitations.id, invitationId));
  }
}
