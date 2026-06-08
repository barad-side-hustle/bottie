"use client";

import { useTranslations } from "next-intl";
import { ArrowUpCircle } from "lucide-react";
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
          className="h-auto border border-hairline py-2 text-foreground hover:bg-surface-3"
          tooltip={{ children: t("title"), side: dir === "rtl" ? "left" : "right" }}
        >
          <Link href="/dashboard/settings?tab=billing">
            <ArrowUpCircle className="size-4 shrink-0 text-ink-3" />
            <div className="grid text-start text-xs leading-tight">
              <span className="truncate font-medium">{t("title")}</span>
              <span className="truncate text-ink-2">{t("upgradeNow")}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
