"use client";

import { Star, Clock, CalendarDays, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { StatCard } from "@/components/dashboard/insights/StatCard";
import type { OverviewData } from "@/lib/actions/overview.actions";

export function OverviewStats({ data }: { data: OverviewData }) {
  const t = useTranslations("dashboard.overview");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label={t("pendingReviews")}
        value={data.pendingCount}
        icon={Clock}
        iconBgColor={data.pendingCount > 0 ? "bg-warning/10" : "bg-primary/10"}
        iconColor={data.pendingCount > 0 ? "text-warning-foreground" : "text-primary"}
        valueColor={data.pendingCount > 0 ? "text-warning-foreground" : undefined}
      />
      <StatCard
        label={t("averageRating")}
        value={data.avgRating ? data.avgRating.toFixed(1) : "—"}
        icon={Star}
        iconBgColor="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        label={t("reviewsThisMonth")}
        value={data.reviewsThisMonth}
        icon={CalendarDays}
        iconBgColor="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        label={t("totalLocations")}
        value={data.locationCount}
        icon={MapPin}
        iconBgColor="bg-primary/10"
        iconColor="text-primary"
      />
    </div>
  );
}
