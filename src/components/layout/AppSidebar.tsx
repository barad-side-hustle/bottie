"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useDirection } from "@/contexts/DirectionProvider";
import { useActiveLocation } from "@/hooks/use-active-location";
import { sidebarLocationItems, resolveHref, type SidebarNavItem } from "@/lib/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebarData } from "@/contexts/SidebarDataContext";
import { signOut } from "@/lib/auth/auth";
import { LocationSwitcher } from "./LocationSwitcher";
import { UpgradeBanner } from "@/components/dashboard/utils/UpgradeBanner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronsUpDown, LogOut, Settings, Check, Globe, CreditCard } from "lucide-react";
import { locales, localeConfig, type Locale } from "@/lib/locale";
import { BotIconSvg } from "@/lib/brand/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { dir } = useDirection();
  const t = useTranslations();
  const pathname = usePathname();
  const locationCtx = useActiveLocation();
  const { user } = useAuth();
  const { pendingCount } = useSidebarData();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar side={dir === "rtl" ? "right" : "left"} variant="floating" collapsible="icon" dir={dir}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/home">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <BotIconSvg size={32} />
                </div>
                <span className="font-semibold">Bottie</span>
                {pendingCount > 0 && (
                  <span className="ms-auto flex size-5 items-center justify-center rounded-full bg-destructive/15 text-[10px] font-medium text-destructive">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <LocationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {locationCtx && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("navigation.sidebar.locationLabel")}</SidebarGroupLabel>
            <SidebarMenu>
              {sidebarLocationItems.map((item) => (
                <SidebarNavLink key={item.label} item={item} pathname={pathname} locationCtx={locationCtx} t={t} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
        <UpgradeBanner />
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={{ children: user.name || user.email, side: dir === "rtl" ? "left" : "right" }}
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                        {user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : (user.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronsUpDown className="ms-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : dir === "rtl" ? "left" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                          {user.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)
                            : (user.email?.[0] || "U").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-start text-sm leading-tight">
                        <span className="truncate font-medium">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onSelect={() => {
                        if (isMobile) setOpenMobile(false);
                        router.push("/dashboard/settings");
                      }}
                    >
                      <Settings className="me-2 size-4" />
                      {t("navigation.sidebar.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        if (isMobile) setOpenMobile(false);
                        router.push("/dashboard/subscription");
                      }}
                    >
                      <CreditCard className="me-2 size-4" />
                      {t("navigation.sidebar.billing")}
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Globe className="me-2 size-4" />
                        {t("common.selectLanguage")}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {locales.map((loc) => (
                          <DropdownMenuItem key={loc} onSelect={() => handleLocaleChange(loc)}>
                            <span className="flex items-center justify-between w-full">
                              {localeConfig[loc].label}
                              {locale === loc && <Check className="size-4 ms-2" />}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="me-2 size-4" />
                    {t("auth.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
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
