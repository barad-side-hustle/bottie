"use server";

import { cache } from "react";
import { z } from "zod";
import { LocationsController, AccountLocationsController, SubscriptionsController } from "@/lib/controllers";
import type { Location, LocationUpdate, AccountLocation } from "@/lib/types";
import type { Location as DBLocation } from "@/lib/db/schema";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";
import { extractLocationId } from "@/lib/google/business-profile";
import { createSafeAction } from "./safe-action";

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

export const getAccountLocations = createSafeAction(
  z.object({ accountId: z.string() }),
  async ({ accountId }, { userId }): Promise<Array<AccountLocation & { location: DBLocation }>> => {
    const controller = new AccountLocationsController(userId, accountId);
    return controller.getAccountLocationsWithDetails();
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
    const subscriptionsController = new SubscriptionsController();

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

    return await controller.connectLocation(locationData, () => subscriptionsController.checkLocationLimit(userId));
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

export const disconnectLocation = createSafeAction(
  z.object({
    accountId: z.string(),
    accountLocationId: z.string(),
  }),
  async ({ accountId, accountLocationId }, { userId }): Promise<AccountLocation> => {
    const controller = new AccountLocationsController(userId, accountId);
    return controller.disconnectLocation(accountLocationId);
  }
);
