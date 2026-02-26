import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { accountLocations, locationMembers } from "@/lib/db/schema";

interface LocationOwner {
  userId: string;
  accountId: string;
  accountLocationId: string;
}

export async function findLocationOwner(locationId: string): Promise<LocationOwner | null> {
  const memberOwner = await db.query.locationMembers.findFirst({
    where: and(eq(locationMembers.locationId, locationId), eq(locationMembers.role, "owner")),
  });

  if (memberOwner) {
    const connection = await db.query.accountLocations.findFirst({
      where: and(eq(accountLocations.locationId, locationId), eq(accountLocations.connected, true)),
      with: {
        account: {
          with: {
            userAccounts: true,
          },
        },
      },
    });

    if (connection) {
      return {
        userId: memberOwner.userId,
        accountId: connection.accountId,
        accountLocationId: connection.id,
      };
    }
  }

  const connections = await db.query.accountLocations.findMany({
    where: eq(accountLocations.locationId, locationId),
    with: {
      account: {
        with: {
          userAccounts: true,
        },
      },
    },
  });

  if (!connections || connections.length === 0) {
    return null;
  }

  const connectedAccounts = connections.filter((ac) => ac.connected);
  const accountsToCheck = connectedAccounts.length > 0 ? connectedAccounts : connections;

  for (const accountLocation of accountsToCheck) {
    const ownerUser = accountLocation.account.userAccounts
      .filter((ua) => ua.role === "owner")
      .sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
        const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        return a.userId.localeCompare(b.userId);
      })[0];

    if (ownerUser) {
      return {
        userId: ownerUser.userId,
        accountId: accountLocation.accountId,
        accountLocationId: accountLocation.id,
      };
    }
  }

  return null;
}
