"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardTopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="h-4 mx-2 bg-border/60" />
      <div className="flex-1" />
    </header>
  );
}
