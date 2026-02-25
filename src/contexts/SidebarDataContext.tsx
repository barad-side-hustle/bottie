"use client";

import * as React from "react";

export interface SidebarLocation {
  accountId: string;
  accountName: string;
  locationId: string;
  locationName: string;
  photoUrl: string | null;
  connected: boolean;
}

interface SidebarDataContextValue {
  locations: SidebarLocation[];
  pendingCount: number;
}

const SidebarDataContext = React.createContext<SidebarDataContextValue | undefined>(undefined);

export function SidebarDataProvider({
  locations,
  pendingCount,
  children,
}: {
  locations: SidebarLocation[];
  pendingCount: number;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locations, pendingCount }), [locations, pendingCount]);
  return <SidebarDataContext.Provider value={value}>{children}</SidebarDataContext.Provider>;
}

export function useSidebarData() {
  const context = React.useContext(SidebarDataContext);
  if (!context) {
    throw new Error("useSidebarData must be used within SidebarDataProvider");
  }
  return context;
}

export function useSidebarDataOptional() {
  return React.useContext(SidebarDataContext);
}
