"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { createLocationCheckout } from "@/lib/actions/checkout.actions";
import { PRICE_PER_LOCATION } from "@/lib/subscriptions/plans";
import { Crown, Check } from "lucide-react";

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
      const url = await createLocationCheckout(locationId);
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setLoading(false);
    }
  };

  const features = [
    t("features.unlimitedReplies"),
    t("features.autoPost"),
    t("features.analytics"),
    t("features.customTone"),
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
        <div className="rounded-lg border border-hairline bg-surface-2 p-6 space-y-5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">
              ${PRICE_PER_LOCATION}
            </span>
            <span className="text-ink-2 text-sm">{t("perMonth")}</span>
          </div>

          <ul className="space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground">
                <Check className="h-4 w-4 shrink-0 text-accent-text" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onSkip}
          disabled={loading}
          className="w-full text-center text-sm text-ink-2 hover:text-foreground transition-colors underline-offset-4 hover:underline cursor-pointer disabled:pointer-events-none disabled:opacity-50"
        >
          {t("skipFree")}
        </button>
      </div>
    </OnboardingFormPanel>
  );
}
