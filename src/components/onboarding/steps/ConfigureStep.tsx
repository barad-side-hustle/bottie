"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Location, ToneOfVoice, LanguageMode } from "@/lib/types";

import {
  LocationDetailsForm,
  LocationDetailsFormData,
} from "@/components/dashboard/locations/forms/LocationDetailsForm";
import {
  AIResponseSettingsForm,
  AIResponseSettingsFormData,
} from "@/components/dashboard/locations/forms/AIResponseSettingsForm";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";

interface ConfigureStepProps {
  location: Location;
  initialLocationDetails: LocationDetailsFormData;
  initialAISettings: AIResponseSettingsFormData;
  onNext: (details: LocationDetailsFormData, aiSettings: AIResponseSettingsFormData) => Promise<void>;
  onBack: () => void;
  progressBar: React.ReactNode;
}

export function ConfigureStep({
  location,
  initialLocationDetails,
  initialAISettings,
  onNext,
  onBack,
  progressBar,
}: ConfigureStepProps) {
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("onboarding.common");

  const [saving, setSaving] = useState(false);
  const [locationDetails, setLocationDetails] = useState<LocationDetailsFormData>(initialLocationDetails);
  const [aiSettings, setAISettings] = useState<AIResponseSettingsFormData>(initialAISettings);

  const handleLocationChange = (field: keyof LocationDetailsFormData, value: string) => {
    setLocationDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleAIChange = (
    field: keyof AIResponseSettingsFormData,
    value: string | string[] | number | ToneOfVoice | LanguageMode
  ) => {
    setAISettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    try {
      setSaving(true);
      await onNext(locationDetails, aiSettings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingFormPanel
      title={t("configure.title")}
      description={t("configure.description")}
      progressBar={progressBar}
      backButton={{ onClick: onBack, loading: saving, label: tCommon("back") }}
      nextButton={{
        label: tCommon("next"),
        loadingLabel: tCommon("saving"),
        onClick: handleNext,
        loading: saving,
      }}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-foreground">{t("businessDetails.title")}</h3>
          <LocationDetailsForm
            values={locationDetails}
            onChange={handleLocationChange}
            locationNamePlaceholder={location.name}
          />
        </div>

        <div className="border-t border-hairline" />

        <div className="space-y-4">
          <h3 className="text-base font-medium text-foreground">{t("aiSettings.title")}</h3>
          <AIResponseSettingsForm values={aiSettings} onChange={handleAIChange} />
        </div>
      </div>
    </OnboardingFormPanel>
  );
}
