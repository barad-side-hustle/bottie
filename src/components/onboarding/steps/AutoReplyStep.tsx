"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  StarRatingConfigForm,
  StarRatingConfigFormData,
} from "@/components/dashboard/locations/forms/StarRatingConfigForm";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";

interface AutoReplyStepProps {
  initialStarRatings: StarRatingConfigFormData;
  onFinish: (starRatings: StarRatingConfigFormData) => Promise<void>;
  onBack: () => void;
  progressBar: React.ReactNode;
}

export function AutoReplyStep({ initialStarRatings, onFinish, onBack, progressBar }: AutoReplyStepProps) {
  const t = useTranslations("onboarding.starRatings");
  const tCommon = useTranslations("onboarding.common");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<StarRatingConfigFormData>(initialStarRatings);

  const handleChange = (rating: 1 | 2 | 3 | 4 | 5, config: { autoReply: boolean; customInstructions: string }) => {
    setFormData((prev) => ({ ...prev, [rating]: config }));
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      await onFinish(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingFormPanel
      title={t("title")}
      description={t("description")}
      progressBar={progressBar}
      backButton={{ onClick: onBack, loading: saving, label: tCommon("back") }}
      nextButton={{
        label: tCommon("next"),
        loadingLabel: tCommon("saving"),
        onClick: handleFinish,
        loading: saving,
      }}
    >
      <StarRatingConfigForm values={formData} onChange={handleChange} />
    </OnboardingFormPanel>
  );
}
