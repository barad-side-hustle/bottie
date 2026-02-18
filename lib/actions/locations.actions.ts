"use server";

import { cache } from "react";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { LocationsController, AccountLocationsController, SubscriptionsController } from "@/lib/controllers";
import type { Location, LocationCreate, LocationUpdate, AccountLocation } from "@/lib/types";
import type { Location as DBLocation } from "@/lib/db/schema";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";
import { extractLocationId } from "@/lib/google/business-profile";

const getLocationCached = cache(async (userId: string, locationId: string): Promise<Location> => {
  const controller = new LocationsController(userId);
  return controller.getLocation(locationId);
});

export async function getLocation(userId: string, locationId: string): Promise<Location> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  return getLocationCached(userId, locationId);
}

export async function getAccountLocations(
  userId: string,
  accountId: string
): Promise<Array<AccountLocation & { location: DBLocation }>> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot access another user's data");
  }

  const controller = new AccountLocationsController(userId, accountId);
  return controller.getAccountLocationsWithDetails();
}

export async function connectLocation(
  userId: string,
  accountId: string,
  data: Omit<LocationCreate, "starConfigs">
): Promise<{ accountLocation: AccountLocation; location: Location; isNew: boolean }> {
  try {
    const { userId: authenticatedUserId } = await getAuthenticatedUserId();

    if (authenticatedUserId !== userId) {
      throw new Error("Forbidden: Cannot create location for another user");
    }

    const controller = new AccountLocationsController(userId, accountId);
    const subscriptionsController = new SubscriptionsController();

    const defaultConfig = getDefaultLocationConfig();

    const googleLocationId = extractLocationId(data.googleBusinessId);
    if (!googleLocationId) {
      throw new Error("Invalid Google Business ID: cannot extract location ID");
    }

    const locationData: LocationCreate = {
      ...data,
      googleLocationId,
      starConfigs: defaultConfig.starConfigs,
    };

    return await controller.connectLocation(locationData, () => subscriptionsController.checkLocationLimit(userId));
  } catch (error) {
    if (error instanceof Error) {
      const serializedError = new Error(error.message);
      serializedError.name = error.name;
      throw serializedError;
    }
    throw error;
  }
}

export async function updateLocationConfig(
  userId: string,
  locationId: string,
  config: Partial<LocationUpdate>
): Promise<Location> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot update another user's location");
  }

  const controller = new LocationsController(userId);
  return controller.updateLocation(locationId, config);
}

export async function disconnectLocation(
  userId: string,
  accountId: string,
  accountLocationId: string
): Promise<AccountLocation> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  if (authenticatedUserId !== userId) {
    throw new Error("Forbidden: Cannot disconnect another user's location");
  }

  const controller = new AccountLocationsController(userId, accountId);
  return controller.disconnectLocation(accountLocationId);
}
