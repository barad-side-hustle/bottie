"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DashboardBreadcrumbs } from "@/components/layout/DashboardBreadcrumbs";

export function DashboardTopBar({
  breadcrumbs,
  actions,
}: {
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6 lg:px-8">
      <SidebarTrigger className="size-8" />
      <Separator orientation="vertical" className="me-1 h-5 bg-border" />
      <div className="min-w-0 flex-1">{breadcrumbs ?? <DashboardBreadcrumbs />}</div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
