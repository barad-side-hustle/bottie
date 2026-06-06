"use client";

import { Star, Clock, CalendarDays, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Bento, StatTile } from "@/components/ui/bento";
import { cn } from "@/lib/utils";
import type { OverviewData } from "@/lib/actions/overview.actions";

export function OverviewStats({ data }: { data: OverviewData }) {
  const t = useTranslations("dashboard.overview");
  const hasPending = data.pendingCount > 0;

  return (
    <Bento className="grid-cols-2 lg:grid-cols-4">
      <StatTile
        label={t("pendingReviews")}
        icon={Clock}
        iconClassName={hasPending ? "bg-warning/15 text-warning-foreground" : undefined}
        value={<span className={cn("tabular-nums", hasPending && "text-warning-foreground")}>{data.pendingCount}</span>}
      />
      <StatTile
        label={t("averageRating")}
        icon={Star}
        iconClassName="bg-star-filled/15 text-star-filled"
        value={data.avgRating ? data.avgRating.toFixed(1) : "-"}
      />
      <StatTile label={t("reviewsThisMonth")} icon={CalendarDays} value={data.reviewsThisMonth} />
      <StatTile label={t("totalLocations")} icon={MapPin} value={data.locationCount} />
    </Bento>
  );
}
