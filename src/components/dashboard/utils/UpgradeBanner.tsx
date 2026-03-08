"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { useLocationSubscriptions } from "@/hooks/use-subscription";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { Link } from "@/i18n/routing";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useDirection } from "@/contexts/DirectionProvider";

export function UpgradeBanner() {
  const t = useTranslations("dashboard.components.upgradeBanner");
  const { isLocationPaid, loading } = useLocationSubscriptions();
  const currentLocation = useCurrentLocation();
  const locationId = currentLocation?.locationId;
  const { dir } = useDirection();

  const currentLocationPaid = locationId ? isLocationPaid(locationId) : true;

  if (loading || currentLocationPaid || !locationId) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className="bg-primary/10 hover:bg-primary/15 text-primary h-auto py-2"
          tooltip={{ children: t("title"), side: dir === "rtl" ? "left" : "right" }}
        >
          <Link href="/dashboard/subscription">
            <Sparkles className="size-4 shrink-0" />
            <div className="grid text-start text-xs leading-tight">
              <span className="font-semibold truncate">{t("title")}</span>
              <span className="text-muted-foreground truncate">{t("upgradeNow")}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
