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
      router.push(`/login?redirect=${encodeURIComponent("/dashboard/settings?tab=billing")}`);
    } else {
      router.push("/dashboard/settings?tab=billing");
    }
    setLoadingPlan(null);
  };

  return (
    <SectionBlock tone="plain" id="pricing" width="md">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 items-start gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-hairline bg-card p-8">
          <div className="mb-8">
            <h3 className="mb-2 text-xl font-medium tracking-tight text-foreground">{t("plans.free.name")}</h3>
            <p className="mb-6 text-sm leading-relaxed text-ink-2">
              {t("plans.free.description", { count: FREE_LOCATION_LIMITS.reviewsPerMonth })}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-normal tracking-tight tabular-nums text-foreground">$0</span>
            </div>
            <p className="mt-3 text-sm text-ink-3">
              {t("freeReplies", { count: FREE_LOCATION_LIMITS.reviewsPerMonth })}
            </p>
          </div>

          <ul className="mb-8 grow space-y-3.5">
            {freeFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-ink-3" />
                <span className="text-sm leading-relaxed text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => handleGetStarted("free")}
            disabled={loadingPlan === "free"}
          >
            {loadingPlan === "free" ? t("loading") : t("freeCta")}
          </Button>
        </div>

        <div className="flex flex-col rounded-lg border border-hairline bg-surface-2 p-8 md:p-10">
          <span className="mb-5 inline-flex w-fit items-center rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.06em] text-ink-2">
            {t("recommendedLabel")}
          </span>
          <div className="mb-8">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">{t("plans.pro.name")}</h3>
            <p className="mb-6 text-sm leading-relaxed text-ink-2">{t("plans.pro.description")}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-normal tracking-tight tabular-nums text-foreground">
                ${PRICE_PER_LOCATION}
              </span>
              <span className="text-ink-2">{t("perLocation")}</span>
            </div>
          </div>

          <ul className="mb-8 grow space-y-3.5">
            {proFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-positive" />
                <span className="text-sm leading-relaxed text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full" onClick={() => handleGetStarted("pro")} disabled={loadingPlan === "pro"}>
            {loadingPlan === "pro" ? t("loading") : t("proCta")}
          </Button>
        </div>
      </div>
    </SectionBlock>
  );
}
