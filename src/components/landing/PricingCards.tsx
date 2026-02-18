"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllPlans, type Plan, calculateYearlySavingsPercentage } from "@/lib/subscriptions/plans";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "yearly";

export function PricingCards() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("landing.pricing");

  const plans = getAllPlans(t);

  const handleCheckout = async (plan: Plan) => {
    setLoadingPlanId(plan.id);

    try {
      const isFree = plan.id === "free";

      if (isFree) {
        if (!user) {
          router.push(`/login?redirect=${encodeURIComponent("/dashboard/home")}`);
        } else {
          router.push("/dashboard/home");
        }
        return;
      }

      const redirectUrl = `/checkout?plan=${plan.id}&period=${billingPeriod}`;

      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error("Error navigating to checkout:", error);
    } finally {
      setLoadingPlanId(null);
    }
  };

  const getPlanPrice = (plan: Plan) => {
    if (billingPeriod === "yearly") {
      return plan.yearlyPrice / 12;
    }
    return plan.monthlyPrice;
  };

  const formatPrice = (plan: Plan) => {
    const price = Math.round(getPlanPrice(plan));
    return `$${price}`;
  };

  const getSavingsPercentage = (plan: Plan) => {
    return calculateYearlySavingsPercentage(plan.id);
  };

  return (
    <div id="pricing">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{t("subtitle")}</p>

          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-auto">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                billingPeriod === "monthly" && "bg-background text-foreground shadow"
              )}
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                billingPeriod === "yearly" && "bg-background text-foreground shadow"
              )}
            >
              {t("yearly")}
              <span className="ms-1 text-xs text-primary px-1 ">{t("yearlyDiscount")}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr_1fr] gap-8 md:gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isRecommended = plan.id === "basic";
            const showYearlyDiscount = billingPeriod === "yearly" && plan.monthlyPrice > 0;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative p-8 flex flex-col rounded-lg group text-card-foreground touch-manipulation hover:-translate-y-2 transition-all duration-300",
                  isRecommended
                    ? "border-2 border-pastel-lavender shadow-xl bg-linear-to-br from-pastel-lavender/10 via-background to-background scale-[1.02] hover:shadow-2xl"
                    : "border border-border/40 shadow-sm bg-card hover:shadow-lg"
                )}
              >
                <div
                  className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    isRecommended
                      ? "bg-linear-to-br from-primary/15 via-primary/8 to-primary/15"
                      : "bg-linear-to-br from-primary/5 via-transparent to-primary/10"
                  }`}
                />

                <div
                  className={`absolute inset-0 border-2 rounded-lg transition-all duration-500 pointer-events-none ${
                    isRecommended
                      ? "border-primary/0 group-hover:border-primary/40"
                      : "border-primary/0 group-hover:border-primary/20"
                  }`}
                />

                <div className="mb-6 relative">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex flex-col">
                    {showYearlyDiscount && (
                      <span className="text-sm text-muted-foreground line-through mb-1">${plan.monthlyPrice}</span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{formatPrice(plan)}</span>
                      <span className="text-muted-foreground">{t("perMonth")}</span>
                    </div>
                    {showYearlyDiscount && getSavingsPercentage(plan) > 0 && (
                      <span className="text-xs text-primary mt-1">
                        {t("yearlySavings", { percentage: getSavingsPercentage(plan) })}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span className={cn("text-sm", feature.included ? "text-foreground" : "text-muted-foreground")}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div>
                  <Button
                    className="w-full"
                    variant={isRecommended ? "default" : "outline"}
                    onClick={() => handleCheckout(plan)}
                    disabled={loadingPlanId === plan.id}
                  >
                    {loadingPlanId === plan.id ? t("loading") : plan.id === "free" ? t("freeCta") : t("paidCta")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
