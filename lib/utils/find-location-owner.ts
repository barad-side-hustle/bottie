import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accountLocations, locationMembers, userAccounts } from "@/lib/db/schema";

interface LocationOwner {
  userId: string;
  accountId: string;
  accountLocationId: string;
}

export async function findLocationOwner(locationId: string): Promise<LocationOwner | null> {
  const memberOwner = await db.query.locationMembers.findFirst({
    where: and(eq(locationMembers.locationId, locationId), eq(locationMembers.role, "owner")),
  });

  const connection = await db.query.accountLocations.findFirst({
    where: and(eq(accountLocations.locationId, locationId), eq(accountLocations.connected, true)),
  });

  if (memberOwner && connection) {
    return {
      userId: memberOwner.userId,
      accountId: connection.accountId,
      accountLocationId: connection.id,
    };
  }

  if (connection) {
    const userAccount = await db.query.userAccounts.findFirst({
      where: eq(userAccounts.accountId, connection.accountId),
    });
    if (userAccount) {
      return {
        userId: userAccount.userId,
        accountId: connection.accountId,
        accountLocationId: connection.id,
      };
    }
  }

  return null;
}
