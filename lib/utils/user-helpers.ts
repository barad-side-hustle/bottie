import { db } from "@/lib/db/client";
import { usersConfigs } from "@/lib/db/schema/users-configs.schema";
import { eq } from "drizzle-orm";

export async function isNewUserSignup(userId: string): Promise<boolean> {
  try {
    const [config] = await db
      .select({ id: usersConfigs.id })
      .from(usersConfigs)
      .where(eq(usersConfigs.userId, userId))
      .limit(1);

    const isNew = !config;

    console.log("[auth/callback] New user detection:", {
      userId,
      hasExistingConfig: !!config,
      isNewUser: isNew,
    });

    return isNew;
  } catch (error) {
    console.error("[auth/callback] Error checking user signup status:", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
