"use client";

import { useCurrentLocation } from "./use-current-location";
import { useSidebarDataOptional } from "@/contexts/SidebarDataContext";

export function useActiveLocation() {
  const urlLocation = useCurrentLocation();
  const sidebarData = useSidebarDataOptional();

  if (urlLocation) return urlLocation;

  const locations = sidebarData?.locations;
  if (locations && locations.length > 0) {
    return {
      accountId: locations[0].accountId,
      locationId: locations[0].locationId,
    };
  }

  return null;
}
