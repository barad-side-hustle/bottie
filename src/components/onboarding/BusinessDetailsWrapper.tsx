"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import type { Location } from "@/lib/types";
import {
  LocationDetailsForm,
  LocationDetailsFormData,
} from "@/components/dashboard/locations/forms/LocationDetailsForm";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateLocationConfig } from "@/lib/actions/locations.actions";

interface LocationDetailsWrapperProps {
  accountId: string;
  locationId: string;
  location: Location;
}

export function LocationDetailsWrapper({ accountId, locationId, location }: LocationDetailsWrapperProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding.businessDetails");
  const tCommon = useTranslations("onboarding.common");

  const locationDetails = useOnboardingStore((state) => state.locationDetails);
  const setAccountId = useOnboardingStore((state) => state.setAccountId);
  const setLocationId = useOnboardingStore((state) => state.setLocationId);
  const setLocationDetails = useOnboardingStore((state) => state.setLocationDetails);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<LocationDetailsFormData>(() => {
    if (locationDetails) {
      return locationDetails;
    }
    return {
      name: location.name || "",
      description: location.description || "",
      phoneNumber: location.phoneNumber || "",
    };
  });

  setAccountId(accountId);
  setLocationId(locationId);

  const handleFormChange = (field: keyof LocationDetailsFormData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setLocationDetails(updatedData);
  };

  const handleBack = () => {
    router.push(`/onboarding/choose-location?accountId=${accountId}`);
  };

  const handleNext = async () => {
    if (!user || !accountId || !locationId) return;

    try {
      setSaving(true);

      await updateLocationConfig(user.id, locationId, {
        name: formData.name,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
      });

      router.push(`/onboarding/ai-settings?accountId=${accountId}&locationId=${locationId}`);
    } catch (error) {
      console.error("Error saving location details:", error);
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
      <LocationDetailsForm values={formData} onChange={handleFormChange} locationNamePlaceholder={location.name} />
    </OnboardingCard>
  );
}
