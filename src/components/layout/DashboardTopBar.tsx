"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/auth";
import { useTranslations } from "next-intl";

export function DashboardTopBar() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const t = useTranslations("auth");

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="h-4 mx-2 bg-border/60" />
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <Button variant="ghost" size="icon" onClick={handleSignOut} disabled={isSigningOut} aria-label={t("signOut")}>
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
