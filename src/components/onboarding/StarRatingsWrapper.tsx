"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import {
  StarRatingConfigForm,
  StarRatingConfigFormData,
} from "@/components/dashboard/locations/forms/StarRatingConfigForm";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";
import { toast } from "sonner";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { updateLocationConfig } from "@/lib/actions/locations.actions";
import { updateOnboardingStatus } from "@/lib/actions/onboarding.actions";
import { ReviewImportProgress } from "@/components/onboarding/ReviewImportProgress";

interface StarRatingsWrapperProps {
  accountId: string;
  locationId: string;
}

export function StarRatingsWrapper({ accountId, locationId }: StarRatingsWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding.starRatings");
  const tCommon = useTranslations("onboarding.common");

  const starRatings = useOnboardingStore((state) => state.starRatings);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setLocationId = useOnboardingStore((state) => state.setLocationId);
  const setStarRatings = useOnboardingStore((state) => state.setStarRatings);
  const getCombinedConfig = useOnboardingStore((state) => state.getCombinedConfig);
  const reset = useOnboardingStore((state) => state.reset);

  const [formData, setFormData] = useState<StarRatingConfigFormData>(() => {
    if (starRatings) {
      return starRatings;
    }
    const defaults = getDefaultLocationConfig();
    return defaults.starConfigs;
  });

  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    setAccountId(accountId);
    setLocationId(locationId);
  }, [accountId, locationId, setAccountId, setLocationId]);

  const handleFormChange = (rating: 1 | 2 | 3 | 4 | 5, config: { autoReply: boolean; customInstructions: string }) => {
    const updatedData = {
      ...formData,
      [rating]: config,
    };
    setFormData(updatedData);
    setStarRatings(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/ai-settings?accountId=${accountId}&locationId=${locationId}`);
  };

  const handleNext = async () => {
    if (!user || !accountId || !locationId) return;

    try {
      setSaving(true);

      const config = getCombinedConfig();

      await updateLocationConfig({ locationId, config });

      await updateOnboardingStatus(true);

      reset();

      setShowImport(true);
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(t("errorMessage"));
    } finally {
      setSaving(false);
    }
  };

  if (showImport) {
    return <ReviewImportProgress accountId={accountId} locationId={locationId} />;
  }

  return (
    <OnboardingCard
      title={t("title")}
      description={t("description")}
      backButton={{ onClick: handleBack, loading: saving, label: tCommon("back") }}
      nextButton={{
        label: tCommon("finish"),
        loadingLabel: tCommon("saving"),
        onClick: handleNext,
        loading: saving,
      }}
    >
      <StarRatingConfigForm values={formData} onChange={handleFormChange} />
    </OnboardingCard>
  );
}
