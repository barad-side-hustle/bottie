"use client";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { UsageLimits } from "@/lib/subscriptions/plans";
import { formatDate, getCurrentBillingPeriod } from "@/lib/subscriptions/billing-period";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/locale";

interface SubscriptionInfoProps {
  limits: UsageLimits;
  currentReviews: number;
  reviewsPercent: number;
  hasPaidSubscription: boolean;
}

export function SubscriptionInfo({
  limits,
  currentReviews,
  reviewsPercent,
  hasPaidSubscription,
}: SubscriptionInfoProps) {
  const t = useTranslations("dashboard.subscription.info");
  const locale = useLocale() as Locale;
  const { resetDate } = getCurrentBillingPeriod();

  return (
    <div className="space-y-6">
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-start justify-between">
            <div>
              <DashboardCardTitle>{t("title")}</DashboardCardTitle>
              <DashboardCardDescription>{t("description")}</DashboardCardDescription>
            </div>
            <Badge variant={hasPaidSubscription ? "default" : "secondary"}>
              {hasPaidSubscription ? t("plans.paid") : t("plans.free")}
            </Badge>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          <DashboardCardField label={t("reviewsLabel")}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {limits.reviewsPerMonth === -1
                    ? t("reviewsUnlimited", { current: currentReviews })
                    : t("reviewsCount", { current: currentReviews, max: limits.reviewsPerMonth })}
                </span>
                {limits.reviewsPerMonth !== -1 && <span className="text-muted-foreground">{reviewsPercent}%</span>}
              </div>
              {limits.reviewsPerMonth !== -1 && <Progress value={reviewsPercent} />}
              <p className="text-xs text-muted-foreground">{t("resetsOn", { date: formatDate(resetDate, locale) })}</p>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
