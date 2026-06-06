"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { OverviewData } from "@/lib/actions/overview.actions";

export function PendingReviewsBanner({ data }: { data: OverviewData }) {
  const t = useTranslations("dashboard.overview");
  const router = useRouter();

  const topPending = data.locationSummaries.reduce<(typeof data.locationSummaries)[0] | null>((max, loc) => {
    if (!max || loc.pendingCount > max.pendingCount) return loc;
    return max;
  }, null);

  if (!topPending) return null;

  const handleNavigate = () => {
    router.push(`/dashboard/locations/${topPending.locationId}/reviews?replyStatus=pending`);
  };

  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border border-warning/25 bg-warning/10 p-5 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-warning/20 text-warning-foreground">
        <AlertCircle className="size-5" />
      </span>
      <p className="flex-1 text-sm font-medium text-foreground">{t("pendingBanner", { count: data.pendingCount })}</p>
      <Button variant="default" size="sm" className="w-full shrink-0 sm:w-auto" onClick={handleNavigate}>
        {t("reviewNow")}
      </Button>
    </div>
  );
}
