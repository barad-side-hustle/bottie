import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { locationMembers, locations, type LocationMember } from "@/lib/db/schema";
import { user as userTable } from "@/lib/db/schema/auth.schema";

export interface LocationMemberWithUser extends LocationMember {
  user: { id: string; name: string; email: string; image: string | null };
}

export class LocationMembersRepository {
  async getMembers(locationId: string): Promise<LocationMemberWithUser[]> {
    const results = await db
      .select({
        id: locationMembers.id,
        userId: locationMembers.userId,
        locationId: locationMembers.locationId,
        role: locationMembers.role,
        invitedBy: locationMembers.invitedBy,
        joinedAt: locationMembers.joinedAt,
        userName: userTable.name,
        userEmail: userTable.email,
        userImage: userTable.image,
      })
      .from(locationMembers)
      .innerJoin(userTable, eq(userTable.id, locationMembers.userId))
      .where(eq(locationMembers.locationId, locationId))
      .orderBy(locationMembers.joinedAt);

    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      locationId: r.locationId,
      role: r.role,
      invitedBy: r.invitedBy,
      joinedAt: r.joinedAt,
      user: { id: r.userId, name: r.userName, email: r.userEmail, image: r.userImage },
    }));
  }

  async getMember(locationId: string, userId: string): Promise<LocationMember | null> {
    const result = await db.query.locationMembers.findFirst({
      where: and(eq(locationMembers.locationId, locationId), eq(locationMembers.userId, userId)),
    });
    return result ?? null;
  }

  async addMember(
    locationId: string,
    userId: string,
    role: "owner" | "admin",
    invitedBy?: string
  ): Promise<LocationMember> {
    const [member] = await db
      .insert(locationMembers)
      .values({ locationId, userId, role, invitedBy: invitedBy ?? null })
      .onConflictDoNothing()
      .returning();
    return member;
  }

  async updateRole(locationId: string, userId: string, role: "owner" | "admin"): Promise<LocationMember> {
    const [updated] = await db
      .update(locationMembers)
      .set({ role })
      .where(and(eq(locationMembers.locationId, locationId), eq(locationMembers.userId, userId)))
      .returning();
    return updated;
  }

  async removeMember(locationId: string, userId: string): Promise<void> {
    await db
      .delete(locationMembers)
      .where(and(eq(locationMembers.locationId, locationId), eq(locationMembers.userId, userId)));
  }

  async getOwner(locationId: string): Promise<LocationMember | null> {
    const result = await db.query.locationMembers.findFirst({
      where: and(eq(locationMembers.locationId, locationId), eq(locationMembers.role, "owner")),
    });
    return result ?? null;
  }

  async isLocationOwned(locationId: string): Promise<boolean> {
    const result = await db.query.locationMembers.findFirst({
      where: eq(locationMembers.locationId, locationId),
    });
    return !!result;
  }

  async isLocationOwnedByGoogleId(googleLocationId: string): Promise<{ owned: boolean; ownerName?: string }> {
    const result = await db
      .select({
        ownerName: userTable.name,
      })
      .from(locationMembers)
      .innerJoin(locations, eq(locations.id, locationMembers.locationId))
      .innerJoin(userTable, eq(userTable.id, locationMembers.userId))
      .where(and(eq(locations.googleLocationId, googleLocationId), eq(locationMembers.role, "owner")))
      .limit(1);

    if (result.length === 0) return { owned: false };
    return { owned: true, ownerName: result[0].ownerName };
  }

  async countOwners(locationId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locationMembers)
      .where(and(eq(locationMembers.locationId, locationId), eq(locationMembers.role, "owner")));
    return result?.count ?? 0;
  }
}
