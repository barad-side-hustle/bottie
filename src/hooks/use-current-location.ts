"use client";

import { usePathname } from "@/i18n/routing";

interface CurrentLocation {
  accountId: string;
  locationId: string;
  section?: string;
}

const LOCATION_PATTERN = /\/dashboard\/accounts\/([^/]+)\/locations\/([^/]+)(?:\/([^/]+))?/;

export function useCurrentLocation(): CurrentLocation | null {
  const pathname = usePathname();

  const match = pathname.match(LOCATION_PATTERN);
  if (!match) return null;

  return {
    accountId: match[1],
    locationId: match[2],
    section: match[3],
  };
}
