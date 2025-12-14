"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout variant="dashboard">
      {children}
      <UpgradeBanner />
    </AppLayout>
  );
}
