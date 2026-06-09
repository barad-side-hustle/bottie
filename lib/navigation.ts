import {
  Home,
  PiggyBank,
  ShieldQuestionMarkIcon,
  Rocket,
  Play,
  Star,
  BarChart3,
  Settings,
  Settings2,
  QrCode,
  FileText,
  HeartPulse,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const landingNavItems: NavItem[] = [
  { href: "/#hero", label: "navigation.landing.home", icon: Home },
  { href: "/#how-it-works", label: "navigation.landing.howItWorks", icon: Rocket },
  { href: "/#demo", label: "navigation.landing.demo", icon: Play },
  { href: "/#pricing", label: "navigation.landing.pricing", icon: PiggyBank },
  { href: "/#faq", label: "navigation.landing.faq", icon: ShieldQuestionMarkIcon },
];

export interface SidebarNavItem {
  href: string | ((ctx: { locationId: string }) => string);
  label: string;
  icon: LucideIcon;
  scope: "location" | "global";
}

export const sidebarLocationItems: SidebarNavItem[] = [
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/reviews`,
    label: "navigation.sidebar.inbox",
    icon: Star,
    scope: "location",
  },
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/insights`,
    label: "navigation.sidebar.insights",
    icon: BarChart3,
    scope: "location",
  },
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/competitors`,
    label: "navigation.sidebar.competitors",
    icon: Trophy,
    scope: "location",
  },
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/posts`,
    label: "navigation.sidebar.posts",
    icon: FileText,
    scope: "location",
  },
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/profile-health`,
    label: "navigation.sidebar.profileHealth",
    icon: HeartPulse,
    scope: "location",
  },
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/get-reviews`,
    label: "navigation.sidebar.getReviews",
    icon: QrCode,
    scope: "location",
  },
  {
    href: (ctx) => `/dashboard/locations/${ctx.locationId}/settings`,
    label: "navigation.sidebar.locationSettings",
    icon: Settings2,
    scope: "location",
  },
];

export const sidebarWorkspaceItems: SidebarNavItem[] = [
  {
    href: "/dashboard/home",
    label: "navigation.sidebar.overview",
    icon: Home,
    scope: "global",
  },
  {
    href: "/dashboard/settings",
    label: "navigation.sidebar.settings",
    icon: Settings,
    scope: "global",
  },
];

export function resolveHref(item: SidebarNavItem, ctx: { locationId: string } | null): string | null {
  if (typeof item.href === "string") return item.href;
  if (!ctx) return null;
  return item.href(ctx);
}

function isAnchorLink(href: string): boolean {
  return href.startsWith("/#");
}

export function getIsActive(pathname: string, href: string, hash?: string): boolean {
  if (isAnchorLink(href)) {
    const anchorHash = href.substring(1);
    if (anchorHash === "#hero") {
      return pathname === "/" && (!hash || hash === "#hero");
    }
    return pathname === "/" && hash === anchorHash;
  }

  if (href === "/") {
    return pathname === "/" && !hash;
  }

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(href);
}
