"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useDirection } from "@/contexts/DirectionProvider";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useSidebarDataOptional } from "@/contexts/SidebarDataContext";
import { buildLocationBreadcrumbs, type BreadcrumbItem } from "@/lib/utils/breadcrumbs";

const SECTION_TO_KEY: Record<string, BreadcrumbSection> = {
  reviews: "reviews",
  insights: "insights",
  competitors: "competitors",
  posts: "posts",
  "profile-health": "profileHealth",
  "get-reviews": "getReviews",
  settings: "settings",
};

type BreadcrumbSection = "reviews" | "insights" | "settings" | "getReviews" | "profileHealth" | "posts" | "competitors";

export function DashboardBreadcrumbs() {
  const { isRTL } = useDirection();
  const t = useTranslations("breadcrumbs");
  const pathname = usePathname();
  const current = useCurrentLocation();
  const sidebarData = useSidebarDataOptional();

  const Separator = isRTL ? ChevronLeft : ChevronRight;

  const items = buildItems({ pathname, current, sidebarData, t });
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm tabular-nums">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const mobileHidden = !isLast;
          return (
            <li key={i} className={`min-w-0 items-center gap-1.5 ${mobileHidden ? "hidden sm:flex" : "flex"}`}>
              {i > 0 && <Separator className="hidden size-3.5 shrink-0 text-ink-3 sm:block" aria-hidden />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate text-ink-2 transition-colors duration-150 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-foreground" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function buildItems({
  pathname,
  current,
  sidebarData,
  t,
}: {
  pathname: string;
  current: { locationId: string; section?: string } | null;
  sidebarData: ReturnType<typeof useSidebarDataOptional>;
  t: (key: string) => string;
}): BreadcrumbItem[] {
  if (current) {
    const section = current.section ? SECTION_TO_KEY[current.section] : undefined;
    if (section) {
      const locationName = sidebarData?.locations.find((l) => l.locationId === current.locationId)?.locationName ?? "";
      return buildLocationBreadcrumbs({
        locationName,
        locationId: current.locationId,
        currentSection: section,
        t,
      });
    }
  }

  if (pathname.startsWith("/dashboard/subscription")) {
    return [{ label: t("overview"), href: "/dashboard/home" }, { label: t("billing") }];
  }
  if (pathname.startsWith("/dashboard/settings")) {
    return [{ label: t("overview"), href: "/dashboard/home" }, { label: t("settings") }];
  }
  if (pathname.startsWith("/dashboard")) {
    return [{ label: t("overview") }];
  }

  return [];
}
