"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { useTranslations } from "next-intl";
import type { GatedFeature } from "@/lib/subscriptions/feature-check";
import type { PlanTier } from "@/lib/subscriptions/plans";

interface FeatureLockedStateProps {
  feature: GatedFeature;
  requiredPlan: PlanTier;
}

export function FeatureLockedState({ feature, requiredPlan }: FeatureLockedStateProps) {
  const t = useTranslations("dashboard.featureGate");

  const handleUpgrade = () => {
    window.location.href = "/#pricing";
  };

  return (
    <DashboardCard className="border-dashed hover:translate-y-0 hover:scale-100">
      <DashboardCardHeader className="text-center items-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <DashboardCardTitle className="justify-center">{t(`features.${feature}.title`)}</DashboardCardTitle>
        <DashboardCardDescription className="text-center max-w-md">
          {t(`features.${feature}.description`, { plan: t(`plans.${requiredPlan}`) })}
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="flex justify-center pt-0">
        <Button onClick={handleUpgrade}>{t("upgradeTo", { plan: t(`plans.${requiredPlan}`) })}</Button>
      </DashboardCardContent>
    </DashboardCard>
  );
}
