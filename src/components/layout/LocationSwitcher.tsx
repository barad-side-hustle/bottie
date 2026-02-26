"use client";

import { ChevronsUpDown, MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useSidebarData } from "@/contexts/SidebarDataContext";
import { useActiveLocation } from "@/hooks/use-active-location";
import { useDirection } from "@/contexts/DirectionProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";

export function LocationSwitcher() {
  const t = useTranslations();
  const router = useRouter();
  const { locations } = useSidebarData();
  const locationCtx = useActiveLocation();
  const { isMobile } = useSidebar();
  const { dir } = useDirection();

  const currentLocation = locationCtx ? locations.find((l) => l.locationId === locationCtx.locationId) : null;

  const currentSection = locationCtx?.section || "reviews";

  const handleSelectLocation = (locationId: string) => {
    router.push(`/dashboard/locations/${locationId}/${currentSection}`);
  };

  const handleAddLocation = () => {
    router.push("/onboarding");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {currentLocation?.photoUrl ? (
                  <Image
                    src={currentLocation.photoUrl}
                    alt={currentLocation.locationName}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  <MapPin className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentLocation?.locationName || t("navigation.sidebar.selectLocation")}
                </span>
              </div>
              <ChevronsUpDown className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : dir === "rtl" ? "left" : "right"}
            sideOffset={4}
          >
            {locations.map((loc) => (
              <DropdownMenuItem
                key={loc.locationId}
                onClick={() => handleSelectLocation(loc.locationId)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border border-border/50 overflow-hidden">
                  {loc.photoUrl ? (
                    <Image
                      src={loc.photoUrl}
                      alt={loc.locationName}
                      width={24}
                      height={24}
                      className="size-full object-cover"
                    />
                  ) : (
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <span className="truncate">{loc.locationName}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddLocation} className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border border-border/50 bg-background">
                <Plus className="size-4" />
              </div>
              <span>{t("navigation.sidebar.addLocation")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
