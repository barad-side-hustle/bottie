"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { UsersController } from "@/lib/controllers/users.controller";
import type { UserConfigUpdate } from "@/lib/types/user.types";

interface UserSettings {
  emailOnNewReview: boolean;
  weeklySummaryEnabled: boolean;
}

export async function getUserSettings(): Promise<UserSettings> {
  const { userId } = await getAuthenticatedUserId();

  const controller = new UsersController();
  const config = await controller.getUserConfig(userId);

  return {
    emailOnNewReview: config.configs.EMAIL_ON_NEW_REVIEW,
    weeklySummaryEnabled: config.configs.WEEKLY_SUMMARY_ENABLED ?? false,
  };
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { userId } = await getAuthenticatedUserId();

  const updates: UserConfigUpdate = {};

  if (settings.emailOnNewReview !== undefined) {
    if (typeof settings.emailOnNewReview !== "boolean") {
      throw new Error("Invalid emailOnNewReview value");
    }
    updates.EMAIL_ON_NEW_REVIEW = settings.emailOnNewReview;
  }

  if (settings.weeklySummaryEnabled !== undefined) {
    if (typeof settings.weeklySummaryEnabled !== "boolean") {
      throw new Error("Invalid weeklySummaryEnabled value");
    }
    updates.WEEKLY_SUMMARY_ENABLED = settings.weeklySummaryEnabled;
  }

  const controller = new UsersController();
  const updatedConfig = await controller.updateUserConfig(userId, updates);

  return {
    emailOnNewReview: updatedConfig.configs.EMAIL_ON_NEW_REVIEW,
    weeklySummaryEnabled: updatedConfig.configs.WEEKLY_SUMMARY_ENABLED ?? false,
  };
}
