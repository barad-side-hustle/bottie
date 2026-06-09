"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { UpgradeButton } from "@/components/dashboard/subscription/UpgradeButton";

export function CompetitorsLockedState({ locationId }: { locationId: string }) {
  const t = useTranslations("dashboard.competitors");

  return (
    <DashboardCard>
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-primary">
          <Crown className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{t("locked.title")}</h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-2">{t("locked.description")}</p>
        </div>
        <div className="mt-2">
          <UpgradeButton locationId={locationId} />
        </div>
      </div>
    </DashboardCard>
  );
}
