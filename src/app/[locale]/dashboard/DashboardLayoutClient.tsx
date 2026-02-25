"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarDataProvider, type SidebarLocation } from "@/contexts/SidebarDataContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";

export function DashboardLayoutClient({
  locations,
  pendingCount,
  user,
  children,
}: {
  locations: SidebarLocation[];
  pendingCount: number;
  user: { name: string; email: string; image: string | null };
  children: React.ReactNode;
}) {
  return (
    <SidebarDataProvider locations={locations} pendingCount={pendingCount}>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <DashboardTopBar />
          <UpgradeBanner />
          <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SidebarDataProvider>
  );
}
