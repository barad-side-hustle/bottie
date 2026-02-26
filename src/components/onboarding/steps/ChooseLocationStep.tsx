"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { GoogleBusinessProfileLocation } from "@/lib/types";
import { LocationRadioItem } from "@/components/onboarding/BusinessRadioItem";
import { OnboardingFormPanel } from "@/components/onboarding/OnboardingFormPanel";
import { RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { checkLocationsOwnership } from "@/lib/actions/locations.actions";

function extractLocationId(googleBusinessId: string): string | null {
  const match = googleBusinessId.match(/\/locations\/(\d+)$/);
  return match ? match[1] : null;
}

interface AlreadyOwnedInfo {
  ownerName: string;
  locationId: string;
  locationName: string;
  requestSent: boolean;
}

interface ChooseLocationStepProps {
  availableLocations: GoogleBusinessProfileLocation[];
  onConnect: (location: GoogleBusinessProfileLocation) => Promise<void>;
  onBack: () => void;
  progressBar: React.ReactNode;
  alreadyOwnedInfo: AlreadyOwnedInfo | null;
  onRequestAccess: (message?: string) => Promise<void>;
  onDismissAlreadyOwned: () => void;
}

export function ChooseLocationStep({
  availableLocations,
  onConnect,
  onBack,
  progressBar,
  alreadyOwnedInfo,
  onRequestAccess,
  onDismissAlreadyOwned,
}: ChooseLocationStepProps) {
  const t = useTranslations("onboarding.chooseBusiness");
  const tCommon = useTranslations("onboarding.common");
  const [selectedLocation, setSelectedLocation] = useState<GoogleBusinessProfileLocation | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [ownershipMap, setOwnershipMap] = useState<Record<string, { owned: boolean; ownerName?: string }>>({});

  useEffect(() => {
    if (availableLocations.length === 1) {
      setSelectedLocation(availableLocations[0]);
    }
  }, [availableLocations]);

  useEffect(() => {
    if (availableLocations.length === 0) return;

    const googleLocationIds = availableLocations
      .map((l) => extractLocationId(l.id))
      .filter((id): id is string => id !== null);

    if (googleLocationIds.length === 0) return;

    checkLocationsOwnership({ googleLocationIds }).then(setOwnershipMap).catch(console.error);
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

  const handleSendRequest = async () => {
    try {
      setSendingRequest(true);
      await onRequestAccess(requestMessage || undefined);
    } finally {
      setSendingRequest(false);
    }
  };

  const getOwnershipForLocation = (location: GoogleBusinessProfileLocation) => {
    const googleLocationId = extractLocationId(location.id);
    if (!googleLocationId) return null;
    const ownership = ownershipMap[googleLocationId];
    if (ownership?.owned) return ownership.ownerName;
    return null;
  };

  const hasNoLocations = availableLocations.length === 0;

  if (alreadyOwnedInfo) {
    return (
      <OnboardingFormPanel
        title={t("title")}
        description={t("descriptionWithCount", { count: availableLocations.length })}
        progressBar={progressBar}
        backButton={{ onClick: onDismissAlreadyOwned, label: tCommon("back") }}
        nextButton={
          alreadyOwnedInfo.requestSent
            ? { label: tCommon("back"), onClick: onDismissAlreadyOwned, disabled: false }
            : {
                label: t("sendRequest"),
                loadingLabel: t("sendingRequest"),
                onClick: handleSendRequest,
                loading: sendingRequest,
                disabled: false,
              }
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  {t("alreadyOwned", { name: alreadyOwnedInfo.ownerName, location: alreadyOwnedInfo.locationName })}
                </p>
                {alreadyOwnedInfo.requestSent ? (
                  <p className="text-sm text-amber-700 dark:text-amber-300">{t("accessRequestSentDescription")}</p>
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-300">{t("requestAccessDescription")}</p>
                )}
              </div>
            </div>
          </div>

          {!alreadyOwnedInfo.requestSent && (
            <Textarea
              placeholder={t("requestMessagePlaceholder")}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              maxLength={500}
              rows={3}
            />
          )}
        </div>
      </OnboardingFormPanel>
    );
  }

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
            <LocationRadioItem
              key={location.id}
              location={location}
              selected={selectedLocation?.id === location.id}
              ownerName={getOwnershipForLocation(location)}
            />
          ))}
        </RadioGroup>
      )}
    </OnboardingFormPanel>
  );
}
