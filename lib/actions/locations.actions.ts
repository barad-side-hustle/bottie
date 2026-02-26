"use server";

import { cache } from "react";
import { z } from "zod";
import { LocationsController, AccountLocationsController } from "@/lib/controllers";
import type { Location, LocationUpdate } from "@/lib/types";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";
import { extractLocationId } from "@/lib/google/business-profile";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "./safe-action";
import { LocationMembersRepository } from "@/lib/db/repositories/location-members.repository";

const getLocationCached = cache(async (userId: string, locationId: string): Promise<Location> => {
  const controller = new LocationsController(userId);
  return controller.getLocation(locationId);
});

export const getLocation = createSafeAction(
  z.object({ locationId: z.string() }),
  async ({ locationId }, { userId }) => {
    return getLocationCached(userId, locationId);
  }
);

export const connectLocation = createSafeAction(
  z.object({
    accountId: z.string(),
    googleBusinessId: z.string(),
    name: z.string(),
    address: z.string(),
    city: z.string().nullish(),
    state: z.string().nullish(),
    postalCode: z.string().nullish(),
    country: z.string().nullish(),
    phoneNumber: z.string().nullish(),
    websiteUrl: z.string().nullish(),
    mapsUrl: z.string().nullish(),
    reviewUrl: z.string().nullish(),
    description: z.string().nullish(),
    photoUrl: z.string().nullish(),
  }),
  async ({ accountId, ...locationFields }, { userId }) => {
    const controller = new AccountLocationsController(userId, accountId);

    const defaultConfig = getDefaultLocationConfig();

    const googleLocationId = extractLocationId(locationFields.googleBusinessId);
    if (!googleLocationId) {
      throw new Error("Invalid Google Business ID: cannot extract location ID");
    }

    const locationData = {
      ...locationFields,
      googleLocationId,
      starConfigs: defaultConfig.starConfigs,
    };

    return await controller.connectLocation(locationData);
  }
);

export const updateLocationConfig = createSafeAction(
  z.object({
    locationId: z.string(),
    config: z.record(z.any()),
  }),
  async ({ locationId, config }, { userId }) => {
    const controller = new LocationsController(userId);
    return controller.updateLocation(locationId, config as Partial<LocationUpdate>);
  }
);

export const checkLocationsOwnership = createSafeAction(
  z.object({
    googleLocationIds: z.array(z.string()),
  }),
  async ({ googleLocationIds }) => {
    const membersRepo = new LocationMembersRepository();
    const results: Record<string, { owned: boolean; ownerName?: string }> = {};

    for (const googleLocationId of googleLocationIds) {
      results[googleLocationId] = await membersRepo.isLocationOwnedByGoogleId(googleLocationId);
    }

    return results;
  }
);

export const disconnectLocation = createSafeAction(
  z.object({
    locationId: z.string(),
  }),
  async ({ locationId }, { userId }): Promise<void> => {
    const { findLocationOwner } = await import("@/lib/utils/find-location-owner");
    const owner = await findLocationOwner(locationId);
    if (!owner) throw new Error("No owner found for location");

    const controller = new AccountLocationsController(userId, owner.accountId);
    await controller.disconnectLocation(owner.accountLocationId);
    revalidatePath("/dashboard", "layout");
  }
);
