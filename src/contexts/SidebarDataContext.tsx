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
}

const SidebarDataContext = React.createContext<SidebarDataContextValue | undefined>(undefined);

export function SidebarDataProvider({
  locations,
  children,
}: {
  locations: SidebarLocation[];
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locations }), [locations]);
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
