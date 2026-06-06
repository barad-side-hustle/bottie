"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { authClient } from "@/lib/auth-client";
import { PRICE_PER_LOCATION } from "@/lib/subscriptions/plans";
import { Crown, Sparkles, Zap, BarChart3, MessageSquare } from "lucide-react";

interface SubscribeStepProps {
  locationId: string;
  locationName: string;
  onSkip: () => void;
  onBack: () => void;
  progressBar: React.ReactNode;
}

export function SubscribeStep({ locationId, locationName, onSkip, onBack, progressBar }: SubscribeStepProps) {
  const t = useTranslations("onboarding.subscribe");
  const tCommon = useTranslations("onboarding.common");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      await authClient.checkout({
        slug: "location-plan",
        metadata: { locationId },
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setLoading(false);
    }
  };

  const features = [
    { icon: MessageSquare, label: t("features.unlimitedReplies") },
    { icon: Zap, label: t("features.autoPost") },
    { icon: BarChart3, label: t("features.analytics") },
    { icon: Sparkles, label: t("features.customTone") },
  ];

  return (
    <OnboardingFormPanel
      title={t("title")}
      description={t("description", { locationName })}
      progressBar={progressBar}
      backButton={{ onClick: onBack, loading, label: tCommon("back") }}
      nextButton={{
        label: t("activateButton", { price: PRICE_PER_LOCATION }),
        loadingLabel: t("processing"),
        onClick: handleSubscribe,
        loading,
        icon: <Crown className="h-4 w-4" />,
      }}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary bg-card p-6 ring-2 ring-primary/30 space-y-5">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tabular-nums">${PRICE_PER_LOCATION}</span>
            <span className="text-muted-foreground text-sm">{t("perMonth")}</span>
          </div>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature.label} className="flex items-center gap-3 text-sm text-foreground">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <feature.icon className="h-4 w-4" />
                </span>
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onSkip}
          disabled={loading}
          className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {t("skipFree")}
        </button>
      </div>
    </OnboardingFormPanel>
  );
}
