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
import { StatCard } from "@/components/dashboard/insights/StatCard";
import { DollarSign, Receipt, CalendarClock, UserCheck } from "lucide-react";
import { differenceInDays } from "date-fns";
import { PRICE_PER_REPLY, type UsageLimits } from "@/lib/subscriptions/plans";
import { formatDate, getCurrentBillingPeriod } from "@/lib/subscriptions/billing-period";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/lib/locale";
import type { Subscription } from "@/lib/db/schema";

interface SubscriptionInfoProps {
  limits: UsageLimits;
  currentReviews: number;
  reviewsPercent: number;
  hasPaidSubscription: boolean;
  subscription: Subscription | null;
}

export function SubscriptionInfo({
  limits,
  currentReviews,
  reviewsPercent,
  hasPaidSubscription,
  subscription,
}: SubscriptionInfoProps) {
  const t = useTranslations("dashboard.subscription.info");
  const locale = useLocale() as Locale;
  const { resetDate } = getCurrentBillingPeriod();

  const costThisMonth = hasPaidSubscription ? (currentReviews * PRICE_PER_REPLY).toFixed(2) : "0.00";
  const daysLeft = differenceInDays(resetDate, new Date());

  const priceValue = hasPaidSubscription
    ? `$${PRICE_PER_REPLY.toFixed(2)}${t("perReply")}`
    : t("freeRepliesLeft", { remaining: Math.max(0, limits.reviewsPerMonth - currentReviews) });

  const memberSinceDate = subscription?.createdAt ? formatDate(new Date(subscription.createdAt), locale) : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t("costThisMonth")} value={`$${costThisMonth}`} icon={DollarSign} />
        <StatCard label={t("pricePerReply")} value={priceValue} icon={Receipt} />
        <StatCard label={t("daysUntilReset")} value={t("days", { count: daysLeft })} icon={CalendarClock} />
        <StatCard label={t("memberSince")} value={memberSinceDate} icon={UserCheck} />
      </div>

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
