"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleBusinessProfileLocation } from "@/lib/types";
import { toast } from "sonner";
import { OnboardingCard } from "@/components/onboarding/OnboardingCard";
import { LocationRadioItem } from "@/components/onboarding/BusinessRadioItem";
import { AlertCircle } from "lucide-react";
import { RadioGroup } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { subscribeToGoogleNotifications } from "@/lib/actions/google.actions";
import { connectLocation } from "@/lib/actions/locations.actions";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";

interface ChooseLocationFormProps {
  accountId: string;
  availableLocations: GoogleBusinessProfileLocation[];
}

export function ChooseLocationForm({ accountId, availableLocations }: ChooseLocationFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("onboarding.chooseBusiness");
  const tCommon = useTranslations("onboarding.common");
  const [selectedLocation, setSelectedLocation] = useState<GoogleBusinessProfileLocation | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleBack = () => {
    router.push("/onboarding/connect-account");
  };

  const handleConnect = async () => {
    if (!user || !accountId || !selectedLocation) return;

    try {
      setConnecting(true);

      const defaults = getDefaultLocationConfig();

      const { location } = await connectLocation(user.id, accountId, {
        googleBusinessId: selectedLocation.id,
        googleLocationId: selectedLocation.locationId,
        name: selectedLocation.name,
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        postalCode: selectedLocation.postalCode,
        country: selectedLocation.country,
        phoneNumber: selectedLocation.phoneNumber,
        websiteUrl: selectedLocation.websiteUrl,
        mapsUrl: selectedLocation.mapsUrl,
        reviewUrl: selectedLocation.reviewUrl,
        description: selectedLocation.description,
        photoUrl: selectedLocation.photoUrl,
        ...defaults,
      });

      try {
        await subscribeToGoogleNotifications(user.id, accountId);
      } catch (err) {
        console.error("Error subscribing to notifications:", err);
      }

      router.push(`/onboarding/location-details?accountId=${accountId}&locationId=${location.id}`);
    } catch (err) {
      console.error("Error connecting location:", err);
      const errorMessage = err instanceof Error ? err.message : t("errors.failedToConnect");
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const hasNoLocations = availableLocations.length === 0;

  return (
    <OnboardingCard
      title={t("title")}
      description={hasNoLocations ? t("description") : t("descriptionWithCount", { count: availableLocations.length })}
      backButton={{ onClick: handleBack, loading: connecting, label: tCommon("back") }}
      nextButton={
        hasNoLocations
          ? { label: tCommon("tryAgain"), onClick: () => router.refresh(), disabled: false }
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
    </OnboardingCard>
  );
}
