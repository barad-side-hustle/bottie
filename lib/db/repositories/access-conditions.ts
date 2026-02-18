import { eq, and, exists } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userAccounts, accountLocations } from "@/lib/db/schema";

export function createLocationAccessCondition(userId: string, locationId: string) {
  return exists(
    db
      .select()
      .from(accountLocations)
      .innerJoin(userAccounts, eq(userAccounts.accountId, accountLocations.accountId))
      .where(and(eq(accountLocations.locationId, locationId), eq(userAccounts.userId, userId)))
  );
}
