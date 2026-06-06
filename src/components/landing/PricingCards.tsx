"use client";

import { Button } from "@/components/ui/button";
import { SectionBlock, SectionHeading } from "@/components/ui/section-block";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { FREE_LOCATION_LIMITS, PRICE_PER_LOCATION } from "@/lib/subscriptions/plans";

export function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("landing.pricing");

  const freeFeatures = [
    t("features.freeReplies", { count: FREE_LOCATION_LIMITS.reviewsPerMonth }),
    t("features.autoPost"),
    t("features.analytics"),
    t("features.customTone"),
    t("features.emojiCustomization"),
    t("features.emailNotifications"),
  ];

  const proFeatures = [
    t("features.unlimitedReplies"),
    t("features.autoPost"),
    t("features.analytics"),
    t("features.customTone"),
    t("features.emojiCustomization"),
    t("features.emailNotifications"),
  ];

  const handleGetStarted = (plan: string) => {
    setLoadingPlan(plan);
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/dashboard/subscription")}`);
    } else {
      router.push("/dashboard/subscription");
    }
    setLoadingPlan(null);
  };

  return (
    <SectionBlock tone="plain" id="pricing" width="md">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
        <div className="flex flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold text-foreground">{t("plans.free.name")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t("plans.free.description", { count: FREE_LOCATION_LIMITS.reviewsPerMonth })}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight text-foreground">$0</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("freeReplies", { count: FREE_LOCATION_LIMITS.reviewsPerMonth })}
            </p>
          </div>

          <ul className="mb-8 grow space-y-3">
            {freeFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            size="pill"
            variant="outline"
            onClick={() => handleGetStarted("free")}
            disabled={loadingPlan === "free"}
          >
            {loadingPlan === "free" ? t("loading") : t("freeCta")}
          </Button>
        </div>

        <div className="flex flex-col rounded-3xl bg-secondary/40 p-8 shadow-lg ring-2 ring-primary">
          <div className="mb-6">
            <h3 className="mb-2 text-2xl font-bold text-foreground">{t("plans.pro.name")}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("plans.pro.description")}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight text-foreground">${PRICE_PER_LOCATION}</span>
              <span className="text-muted-foreground">{t("perLocation")}</span>
            </div>
          </div>

          <ul className="mb-8 grow space-y-3">
            {proFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            size="pill"
            onClick={() => handleGetStarted("pro")}
            disabled={loadingPlan === "pro"}
          >
            {loadingPlan === "pro" ? t("loading") : t("proCta")}
          </Button>
        </div>
      </div>
    </SectionBlock>
  );
}
