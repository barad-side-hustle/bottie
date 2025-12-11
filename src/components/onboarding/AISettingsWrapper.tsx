"use client";

import { useState, useEffect } from "react";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/locations/forms/AIResponseSettingsForm";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";
import { ToneOfVoice, LanguageMode } from "@/lib/types";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateLocationConfig } from "@/lib/actions/locations.actions";
import type { PlanLimits } from "@/lib/subscriptions/plans";

interface AISettingsWrapperProps {
  accountId: string;
  locationId: string;
  limits: PlanLimits;
}

export function AISettingsWrapper({ accountId, locationId, limits }: AISettingsWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding.aiSettings");
  const tCommon = useTranslations("onboarding.common");

  const aiSettings = useOnboardingStore((state) => state.aiSettings);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setLocationId = useOnboardingStore((state) => state.setLocationId);
  const setAISettings = useOnboardingStore((state) => state.setAISettings);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AIResponseSettingsFormData>(() => {
    if (aiSettings) {
      return aiSettings;
    }
    const defaults = getDefaultLocationConfig();
    return {
      toneOfVoice: defaults.toneOfVoice,
      languageMode: defaults.languageMode,
      allowedEmojis: defaults.allowedEmojis || [],
      maxSentences: defaults.maxSentences || 2,
      signature: defaults.signature || "",
    };
  });

  useEffect(() => {
    if (accountId) setAccountId(accountId);
    if (locationId) setLocationId(locationId);
  }, [accountId, locationId, setAccountId, setLocationId]);

  const handleFormChange = (
    field: keyof AIResponseSettingsFormData,
    value: string | string[] | number | ToneOfVoice | LanguageMode
  ) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setAISettings(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/location-details?accountId=${accountId}&locationId=${locationId}`);
  };

  const handleNext = async () => {
    if (!user || !accountId || !locationId) return;

    try {
      setSaving(true);

      await updateLocationConfig(user.id, locationId, {
        toneOfVoice: formData.toneOfVoice,
        languageMode: formData.languageMode,
        allowedEmojis: formData.allowedEmojis,
        maxSentences: formData.maxSentences,
        signature: formData.signature,
      });

      router.push(`/onboarding/star-ratings?accountId=${accountId}&locationId=${locationId}`);
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast.error(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingCard
      title={t("title")}
      description={t("description")}
      backButton={{ onClick: handleBack, loading: saving, label: tCommon("back") }}
      nextButton={{ label: tCommon("next"), loadingLabel: tCommon("saving"), onClick: handleNext, loading: saving }}
    >
      <AIResponseSettingsForm values={formData} onChange={handleFormChange} limits={limits} />
    </OnboardingCard>
  );
}
