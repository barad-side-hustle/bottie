import { eq, and, exists, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userAccounts, accountLocations, locationMembers } from "@/lib/db/schema";

export function createLocationAccessCondition(userId: string, locationId: string) {
  return or(
    exists(
      db
        .select()
        .from(accountLocations)
        .innerJoin(userAccounts, eq(userAccounts.accountId, accountLocations.accountId))
        .where(and(eq(accountLocations.locationId, locationId), eq(userAccounts.userId, userId)))
    ),
    exists(
      db
        .select()
        .from(locationMembers)
        .where(and(eq(locationMembers.locationId, locationId), eq(locationMembers.userId, userId)))
    )
  )!;
}

export async function getUserLocationRole(userId: string, locationId: string): Promise<"owner" | "admin" | null> {
  const member = await db.query.locationMembers.findFirst({
    where: and(eq(locationMembers.userId, userId), eq(locationMembers.locationId, locationId)),
  });
  return member?.role ?? null;
}
