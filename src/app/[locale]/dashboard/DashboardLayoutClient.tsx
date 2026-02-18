"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarDataProvider, type SidebarLocation } from "@/contexts/SidebarDataContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";

export function DashboardLayoutClient({
  locations,
  children,
}: {
  locations: SidebarLocation[];
  children: React.ReactNode;
}) {
  return (
    <SidebarDataProvider locations={locations}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SidebarDataProvider>
  );
}
