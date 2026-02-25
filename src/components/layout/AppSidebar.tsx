"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useDirection } from "@/contexts/DirectionProvider";
import { useActiveLocation } from "@/hooks/use-active-location";
import {
  sidebarLocationItems,
  sidebarGlobalItems,
  sidebarAccountItem,
  resolveHref,
  type SidebarNavItem,
} from "@/lib/navigation";
import { LocationSwitcher } from "./LocationSwitcher";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { dir } = useDirection();
  const t = useTranslations();
  const pathname = usePathname();
  const locationCtx = useActiveLocation();

  return (
    <Sidebar side={dir === "rtl" ? "right" : "left"} variant="floating" collapsible="icon" dir={dir}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/home">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <Image src="/images/logo-icon.png" alt="Bottie" width={32} height={32} className="size-8" priority />
                </div>
                <span className="font-semibold">Bottie</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <LocationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {locationCtx && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>{t("navigation.sidebar.locationLabel")}</SidebarGroupLabel>
              <SidebarMenu>
                {sidebarLocationItems.map((item) => (
                  <SidebarNavLink key={item.label} item={item} pathname={pathname} locationCtx={locationCtx} t={t} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.sidebar.generalLabel")}</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarGlobalItems.map((item) => (
              <SidebarNavLink key={item.label} item={item} pathname={pathname} locationCtx={locationCtx} t={t} />
            ))}
            <SidebarNavLink item={sidebarAccountItem} pathname={pathname} locationCtx={locationCtx} t={t} />
          </SidebarMenu>
        </SidebarGroup>
        <UpgradeBanner />
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarNavLink({
  item,
  pathname,
  locationCtx,
  t,
}: {
  item: SidebarNavItem;
  pathname: string;
  locationCtx: { accountId: string; locationId: string } | null;
  t: ReturnType<typeof useTranslations>;
}) {
  const { dir } = useDirection();
  const { isMobile, setOpenMobile } = useSidebar();
  const href = resolveHref(item, locationCtx);
  if (!href) return null;

  const isActive = pathname === href || pathname.startsWith(href + "/");
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={{ children: t(item.label), side: dir === "rtl" ? "left" : "right" }}
      >
        <Link href={href} onClick={() => isMobile && setOpenMobile(false)}>
          <Icon />
          <span>{t(item.label)}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
