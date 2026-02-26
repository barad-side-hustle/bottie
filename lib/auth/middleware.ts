import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { user as userTable } from "@/lib/db/schema/auth.schema";
import { userAccounts } from "@/lib/db/schema/user-accounts.schema";
import { accountLocations } from "@/lib/db/schema/account-locations.schema";
import { locationMembers, locationInvitations } from "@/lib/db/schema";
import { eq, and, inArray, count } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function getSessionFromRequest(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  } catch {
    return null;
  }
}

export async function checkOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const [memberResult] = await db
      .select({ count: count() })
      .from(locationMembers)
      .where(eq(locationMembers.userId, userId));

    if ((memberResult?.count || 0) > 0) return true;

    const dbUser = await db.query.user.findFirst({
      where: eq(userTable.id, userId),
      columns: { email: true },
    });

    if (dbUser?.email) {
      const [invitationResult] = await db
        .select({ count: count() })
        .from(locationInvitations)
        .where(and(eq(locationInvitations.email, dbUser.email), eq(locationInvitations.status, "pending")));

      if ((invitationResult?.count || 0) > 0) return true;
    }

    const userAccountRows = await db
      .select({ accountId: userAccounts.accountId })
      .from(userAccounts)
      .where(eq(userAccounts.userId, userId));

    if (userAccountRows.length === 0) return false;

    const accountIds = userAccountRows.map((r) => r.accountId);

    const [result] = await db
      .select({ count: count() })
      .from(accountLocations)
      .where(inArray(accountLocations.accountId, accountIds));

    return (result?.count || 0) > 0;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
}
