"use client";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/insights/StatCard";
import { UpgradeButton } from "@/components/dashboard/subscription/UpgradeButton";
import { MapPin, DollarSign, Crown, ShieldCheck } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t("totalLocations")} value={String(totalLocations)} icon={MapPin} />
        <StatCard label={t("activeLocations")} value={String(paidLocations)} icon={Crown} />
        <StatCard label={t("freeLocations")} value={String(unpaidLocations)} icon={ShieldCheck} />
        <StatCard label={t("monthlyTotal")} value={`$${monthlyTotal}`} icon={DollarSign} />
      </div>

      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>{t("title")}</DashboardCardTitle>
          <DashboardCardDescription>{t("description")}</DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent>
          {locationSummaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noLocations")}</p>
          ) : (
            <div className="space-y-2">
              {locationSummaries.map((loc) => (
                <div
                  key={loc.locationId}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-2xl border p-4",
                    loc.isPaid ? "border-primary/40 bg-secondary/40" : "border-border/60 bg-card"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{loc.locationName}</p>
                      <p className="text-xs text-muted-foreground">
                        {loc.isPaid
                          ? t("unlimitedReplies")
                          : t("freeRepliesPerMonth", { count: FREE_LOCATION_LIMITS.reviewsPerMonth })}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {loc.isPaid ? (
                      <Badge variant="brand" className="gap-1">
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
            <p className="mt-4 text-xs text-muted-foreground">{t("upgradeHint", { price: PRICE_PER_LOCATION })}</p>
          )}
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
