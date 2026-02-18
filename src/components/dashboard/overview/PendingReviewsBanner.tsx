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
    router.push(`/dashboard/accounts/${topPending.accountId}/locations/${topPending.locationId}/reviews`);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 p-4">
      <AlertCircle className="size-5 text-warning-foreground shrink-0" />
      <p className="flex-1 text-sm text-foreground">{t("pendingBanner", { count: data.pendingCount })}</p>
      <Button variant="outline" size="sm" onClick={handleNavigate}>
        {t("reviewNow")}
      </Button>
    </div>
  );
}
