"use client";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/dashboard/subscription/UpgradeButton";
import { Crown } from "lucide-react";
import { PRICE_PER_LOCATION, FREE_LOCATION_LIMITS } from "@/lib/subscriptions/plans";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { LocationSummaryWithSubscription } from "@/lib/controllers/stats.controller";

interface SubscriptionInfoProps {
  totalLocations: number;
  paidLocations: number;
  unpaidLocations: number;
  monthlyTotal: number;
  locationSummaries: LocationSummaryWithSubscription[];
}

export function SubscriptionInfo({
  totalLocations,
  paidLocations,
  unpaidLocations,
  monthlyTotal,
  locationSummaries,
}: SubscriptionInfoProps) {
  const t = useTranslations("dashboard.subscription.info");

  const metrics = [
    { label: t("totalLocations"), value: String(totalLocations) },
    { label: t("activeLocations"), value: String(paidLocations) },
    { label: t("freeLocations"), value: String(unpaidLocations) },
    { label: t("monthlyTotal"), value: `$${monthlyTotal}`, hero: true },
  ];

  return (
    <div className="space-y-6">
      <DashboardCard>
        <div className="grid grid-cols-2 divide-x divide-hairline rtl:divide-x-reverse sm:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="space-y-2 p-5 [&:nth-child(n+3)]:border-t [&:nth-child(n+3)]:border-hairline sm:[&:nth-child(n+3)]:border-t-0"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">{metric.label}</p>
              <p
                className={cn(
                  "text-2xl font-medium tracking-tight tabular-nums md:text-3xl",
                  metric.hero ? "text-primary" : "text-foreground"
                )}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{t("title")}</DashboardCardTitle>
          <DashboardCardDescription>{t("description")}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {locationSummaries.length === 0 ? (
            <p className="text-sm text-ink-2">{t("noLocations")}</p>
          ) : (
            <div className="-mx-2 divide-y divide-hairline">
              {locationSummaries.map((loc) => (
                <div key={loc.locationId} className="flex items-center justify-between gap-4 px-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{loc.locationName}</p>
                    <p className="text-xs text-ink-2">
                      {loc.isPaid
                        ? t("unlimitedReplies")
                        : t("freeRepliesPerMonth", { count: FREE_LOCATION_LIMITS.reviewsPerMonth })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {loc.isPaid ? (
                      <Badge variant="success" className="gap-1">
                        <Crown className="h-3 w-3" />
                        {t("plans.pro")}
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="muted">{t("plans.free")}</Badge>
                        <UpgradeButton locationId={loc.locationId} size="sm" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {unpaidLocations > 0 && (
            <p className="mt-4 text-xs text-ink-2">{t("upgradeHint", { price: PRICE_PER_LOCATION })}</p>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
