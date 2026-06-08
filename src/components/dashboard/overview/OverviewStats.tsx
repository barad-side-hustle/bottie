"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OverviewData } from "@/lib/actions/overview.actions";

interface KpiProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

function Kpi({ label, value, accent }: KpiProps) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-1">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-2">{label}</span>
      <span
        className={cn(
          "text-2xl font-medium leading-none tracking-[-0.01em] tabular-nums",
          accent ? "text-accent-text" : "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function OverviewStats({ data }: { data: OverviewData }) {
  const t = useTranslations("dashboard.overview");

  return (
    <section className="grid grid-cols-2 gap-y-6 divide-hairline sm:grid-cols-4 sm:gap-y-0 sm:divide-x">
      <Kpi
        label={t("averageRating")}
        value={data.avgRating ? data.avgRating.toFixed(1) : "-"}
        accent={Boolean(data.avgRating)}
      />
      <Kpi label={t("pendingReviews")} value={data.pendingCount} />
      <Kpi label={t("reviewsThisMonth")} value={data.reviewsThisMonth} />
      <Kpi label={t("totalLocations")} value={data.locationCount} />
    </section>
  );
}
