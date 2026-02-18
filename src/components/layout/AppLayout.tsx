"use client";

import { UnifiedNavbar } from "./UnifiedNavbar";
import { BottomNavigation } from "./BottomNavigation";
import { cn } from "@/lib/utils";

export function AppLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="flex flex-col h-screen">
      <UnifiedNavbar />
      <main className={cn("flex-1 overflow-y-auto pb-16 md:pb-0", className)}>{children}</main>
      <BottomNavigation />
    </div>
  );
}
