"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { FREE_TIER_LIMITS, PRICE_PER_REPLY } from "@/lib/subscriptions/plans";
import { authClient } from "@/lib/auth-client";

export function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("landing.pricing");

  const features = [
    t("features.unlimitedLocations"),
    t("features.autoPost"),
    t("features.analytics"),
    t("features.customTone"),
    t("features.emojiCustomization"),
    t("features.emailNotifications"),
  ];

  const handleFreeStart = () => {
    setLoadingPlan("free");
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/dashboard/home")}`);
    } else {
      router.push("/dashboard/home");
    }
    setLoadingPlan(null);
  };

  const handlePaidCheckout = async () => {
    setLoadingPlan("paid");
    try {
      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
        return;
      }
      await authClient.checkout({ slug: "pay-as-you-go" });
    } catch (error) {
      console.error("Error initiating checkout:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 max-w-4xl mx-auto">

          <div className="relative p-8 flex flex-col rounded-2xl border border-border/60 bg-primary/[0.03] shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t("plans.free.name")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("plans.free.description", { count: FREE_TIER_LIMITS.reviewsPerMonth })}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$0</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t("freeReplies", { count: FREE_TIER_LIMITS.reviewsPerMonth })}
              </p>
            </div>

            <ul className="space-y-3 mb-8 grow">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div>
              <Button className="w-full" variant="outline" onClick={handleFreeStart} disabled={loadingPlan === "free"}>
                {loadingPlan === "free" ? t("loading") : t("freeCta")}
              </Button>
            </div>
          </div>

          <div className="relative p-8 flex flex-col rounded-2xl border-2 border-primary/40 bg-primary/[0.06] shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t("plans.paid.name")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("plans.paid.description")}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">${PRICE_PER_REPLY}</span>
                <span className="text-muted-foreground">{t("perReply")}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 grow">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div>
              <Button className="w-full" onClick={handlePaidCheckout} disabled={loadingPlan === "paid"}>
                {loadingPlan === "paid" ? t("loading") : t("paidCta")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
