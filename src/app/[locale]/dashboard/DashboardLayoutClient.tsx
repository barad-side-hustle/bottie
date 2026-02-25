"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarDataProvider, type SidebarLocation } from "@/contexts/SidebarDataContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";

export function DashboardLayoutClient({
  locations,
  pendingCount,
  children,
}: {
  locations: SidebarLocation[];
  pendingCount: number;
  children: React.ReactNode;
}) {
  return (
    <SidebarDataProvider locations={locations} pendingCount={pendingCount}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardTopBar />
          <UpgradeBanner />
          <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SidebarDataProvider>
  );
}
