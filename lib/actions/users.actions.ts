"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema/auth.schema";
import { eq } from "drizzle-orm";

interface UserSettings {
  emailOnNewReview: boolean;
}

export async function getUserSettings(): Promise<UserSettings> {
  const { userId } = await getAuthenticatedUserId();

  const [row] = await db
    .select({ emailOnNewReview: user.emailOnNewReview })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return {
    emailOnNewReview: row?.emailOnNewReview ?? true,
  };
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { userId } = await getAuthenticatedUserId();

  if (settings.emailOnNewReview !== undefined) {
    if (typeof settings.emailOnNewReview !== "boolean") {
      throw new Error("Invalid emailOnNewReview value");
    }

    await db
      .update(user)
      .set({ emailOnNewReview: settings.emailOnNewReview, updatedAt: new Date() })
      .where(eq(user.id, userId));
  }

  return getUserSettings();
}
