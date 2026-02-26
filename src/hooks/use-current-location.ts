"use client";

import { usePathname } from "@/i18n/routing";

interface CurrentLocation {
  locationId: string;
  section?: string;
}

const LOCATION_PATTERN = /\/dashboard\/locations\/([^/]+)(?:\/([^/]+))?/;

export function useCurrentLocation(): CurrentLocation | null {
  const pathname = usePathname();

  const match = pathname.match(LOCATION_PATTERN);
  if (!match) return null;

  return {
    locationId: match[1],
    section: match[2],
  };
}
