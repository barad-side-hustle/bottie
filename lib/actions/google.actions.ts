"use server";

import { z } from "zod";
import { AccountsController, AccountLocationsController } from "@/lib/controllers";
import {
  listAllBusinesses,
  decryptToken,
  subscribeToNotifications,
  extractAccountName,
} from "@/lib/google/business-profile";
import type { GoogleBusinessProfileLocation } from "@/lib/types";
import { createSafeAction } from "./safe-action";

export const getGoogleBusinesses = createSafeAction(
  z.object({ accountId: z.string() }),
  async ({ accountId }, { userId }): Promise<GoogleBusinessProfileLocation[]> => {
    const accountsController = new AccountsController(userId);
    const account = await accountsController.getAccount(accountId);

    if (!account.googleRefreshToken) {
      throw new Error("No Google refresh token found");
    }

    const refreshToken = await decryptToken(account.googleRefreshToken);
    return listAllBusinesses(refreshToken);
  }
);

export const subscribeToGoogleNotifications = createSafeAction(
  z.object({ accountId: z.string() }),
  async ({ accountId }, { userId }): Promise<{ success: boolean; alreadySubscribed?: boolean }> => {
    const accountsController = new AccountsController(userId);
    const accountLocationsController = new AccountLocationsController(userId, accountId);

    const account = await accountsController.getAccount(accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    if (account.googleAccountName) {
      return { success: true, alreadySubscribed: true };
    }

    if (!account.googleRefreshToken) {
      throw new Error("Missing Google refresh token");
    }

    const accountLocations = await accountLocationsController.getAccountLocationsWithDetails();
    if (accountLocations.length === 0) {
      throw new Error("No locations found");
    }

    const googleBusinessId = accountLocations[0].googleBusinessId;
    const googleAccountName = extractAccountName(googleBusinessId);
    if (!googleAccountName) {
      throw new Error(
        `Invalid Google Business ID format: ${googleBusinessId}. Expected format: accounts/{accountId}/locations/{locationId}`
      );
    }

    const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "review-ai-reply";
    const topicName = process.env.PUBSUB_TOPIC_NAME || "gmb-review-notifications";
    const pubsubTopic = `projects/${projectId}/topics/${topicName}`;

    const refreshToken = await decryptToken(account.googleRefreshToken);

    await subscribeToNotifications(googleAccountName, pubsubTopic, refreshToken);

    await accountsController.updateAccount(accountId, { googleAccountName });

    return { success: true };
  }
);
