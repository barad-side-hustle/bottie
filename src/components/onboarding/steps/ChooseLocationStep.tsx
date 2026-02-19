"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { GoogleBusinessProfileLocation } from "@/lib/types";
import { LocationRadioItem } from "@/components/onboarding/BusinessRadioItem";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { RadioGroup } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

interface ChooseLocationStepProps {
  availableLocations: GoogleBusinessProfileLocation[];
  onConnect: (location: GoogleBusinessProfileLocation) => Promise<void>;
  onBack: () => void;
  progressBar: React.ReactNode;
}

export function ChooseLocationStep({ availableLocations, onConnect, onBack, progressBar }: ChooseLocationStepProps) {
  const t = useTranslations("onboarding.chooseBusiness");
  const tCommon = useTranslations("onboarding.common");
  const [selectedLocation, setSelectedLocation] = useState<GoogleBusinessProfileLocation | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (availableLocations.length === 1) {
      setSelectedLocation(availableLocations[0]);
    }
  }, [availableLocations]);

  const handleConnect = async () => {
    if (!selectedLocation) return;
    try {
      setConnecting(true);
      await onConnect(selectedLocation);
    } finally {
      setConnecting(false);
    }
  };

  const hasNoLocations = availableLocations.length === 0;

  return (
    <OnboardingFormPanel
      title={t("title")}
      description={hasNoLocations ? t("description") : t("descriptionWithCount", { count: availableLocations.length })}
      progressBar={progressBar}
      backButton={{ onClick: onBack, loading: connecting, label: tCommon("back") }}
      nextButton={
        hasNoLocations
          ? { label: tCommon("tryAgain"), onClick: () => window.location.reload(), disabled: false }
          : {
              label: t("connectButton"),
              loadingLabel: t("connectingButton"),
              onClick: handleConnect,
              disabled: !selectedLocation,
              loading: connecting,
            }
      }
    >
      {hasNoLocations ? (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("errors.noBusinessesFound")}</p>
        </div>
      ) : (
        <RadioGroup
          value={selectedLocation?.id || ""}
          onValueChange={(value) => {
            const location = availableLocations.find((l) => l.id === value);
            setSelectedLocation(location || null);
          }}
          className="gap-3"
        >
          {availableLocations.map((location) => (
            <LocationRadioItem key={location.id} location={location} selected={selectedLocation?.id === location.id} />
          ))}
        </RadioGroup>
      )}
    </OnboardingFormPanel>
  );
}
