"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { sileo } from "sileo";
import type { Location, GoogleBusinessProfileLocation } from "@/lib/types";

import type { LocationDetailsFormData } from "@/components/dashboard/locations/forms/LocationDetailsForm";
import type { AIResponseSettingsFormData } from "@/components/dashboard/locations/forms/AIResponseSettingsForm";
import type { StarRatingConfigFormData } from "@/components/dashboard/locations/forms/StarRatingConfigForm";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";
import { connectLocation, updateLocationConfig } from "@/lib/actions/locations.actions";
import { subscribeToGoogleNotifications } from "@/lib/actions/google.actions";
import { updateOnboardingStatus } from "@/lib/actions/onboarding.actions";
import { sendRybbitEvent } from "@/lib/analytics";
import { useOnboardingStore } from "@/lib/store/onboarding-store";

import { OnboardingLayout } from "./OnboardingLayout";
import { SteppedProgressBar } from "./SteppedProgressBar";
import { StepTransition } from "./StepTransition";
import { CompletionCelebration } from "./CompletionCelebration";
import { ConnectStep } from "./steps/ConnectStep";
import { ChooseLocationStep } from "./steps/ChooseLocationStep";
import { ConfigureStep } from "./steps/ConfigureStep";
import { AutoReplyStep } from "./steps/AutoReplyStep";
import { SubscribeStep } from "./steps/SubscribeStep";
import { ImportReviewsStep } from "./steps/ImportReviewsStep";

type WizardStep = "connect" | "choose" | "configure" | "autoReply" | "import" | "subscribe" | "celebration";

const STEP_TO_PROGRESS: Record<WizardStep, number> = {
  connect: 0,
  choose: 0,
  configure: 1,
  autoReply: 2,
  import: 3,
  subscribe: 4,
  celebration: 5,
};

interface OnboardingWizardProps {
  initialAccountId: string | null;
  initialLocationId: string | null;
  availableLocations: GoogleBusinessProfileLocation[] | null;
  location: Location | null;
}

export function OnboardingWizard({
  initialAccountId,
  initialLocationId,
  availableLocations,
  location,
}: OnboardingWizardProps) {
  const t = useTranslations("onboarding");

  const getInitialStep = (): WizardStep => {
    if (initialLocationId && location) return "configure";
    if (initialAccountId && availableLocations) return "choose";
    return "connect";
  };

  const [currentStep, setCurrentStep] = useState<WizardStep>(getInitialStep);
  const [direction, setDirection] = useState<"forward" | "backward" | "initial">("initial");
  const [accountId] = useState<string | null>(initialAccountId);
  const [locationId, setLocationId] = useState<string | null>(initialLocationId);
  const [locationData, setLocationData] = useState<Location | null>(location);

  const storeSetAccountId = useOnboardingStore((s) => s.setAccountId);
  const storeSetLocationId = useOnboardingStore((s) => s.setLocationId);
  const storeLocationDetails = useOnboardingStore((s) => s.locationDetails);
  const storeAISettings = useOnboardingStore((s) => s.aiSettings);
  const storeStarRatings = useOnboardingStore((s) => s.starRatings);
  const storeSetLocationDetails = useOnboardingStore((s) => s.setLocationDetails);
  const storeSetAISettings = useOnboardingStore((s) => s.setAISettings);
  const storeSetStarRatings = useOnboardingStore((s) => s.setStarRatings);
  const storeReset = useOnboardingStore((s) => s.reset);

  const goForward = useCallback((step: WizardStep) => {
    setDirection("forward");
    setCurrentStep(step);
  }, []);

  const goBackward = useCallback((step: WizardStep) => {
    setDirection("backward");
    setCurrentStep(step);
  }, []);

  const stepLabels = useMemo(
    () => [t("steps.connect"), t("steps.configure"), t("steps.autoReply"), t("steps.import"), t("steps.subscribe")],
    [t]
  );

  const defaults = useMemo(() => getDefaultLocationConfig(), []);

  const initialLocationDetailsValue: LocationDetailsFormData = useMemo(
    () =>
      storeLocationDetails || {
        name: locationData?.name || "",
        description: locationData?.description || "",
        phoneNumber: locationData?.phoneNumber || "",
      },
    [storeLocationDetails, locationData]
  );

  const initialAISettingsValue: AIResponseSettingsFormData = useMemo(
    () =>
      storeAISettings || {
        toneOfVoice: defaults.toneOfVoice,
        languageMode: defaults.languageMode,
        allowedEmojis: defaults.allowedEmojis || [],
        maxSentences: defaults.maxSentences || 2,
        signature: defaults.signature || "",
      },
    [storeAISettings, defaults]
  );

  const initialStarRatingsValue: StarRatingConfigFormData = useMemo(
    () => storeStarRatings || defaults.starConfigs,
    [storeStarRatings, defaults]
  );

  const handleConnectLocation = async (selectedLocation: GoogleBusinessProfileLocation) => {
    if (!accountId) return;

    try {
      const result = await connectLocation({
        accountId,
        googleBusinessId: selectedLocation.id,
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
      });

      if ("alreadyOwned" in result && result.alreadyOwned) {
        return;
      }

      const { location: connectedLocation, isNew } = result;

      sendRybbitEvent("location_connected", { location_name: selectedLocation.name });

      setLocationId(connectedLocation.id);
      setLocationData(connectedLocation);
      storeSetAccountId(accountId);
      storeSetLocationId(connectedLocation.id);

      subscribeToGoogleNotifications({ accountId }).catch(console.error);

      if (!isNew) {
        await updateOnboardingStatus(true);
        sendRybbitEvent("onboarding_completed");
        storeReset();
        goForward("celebration");
      } else {
        goForward("configure");
      }
    } catch (err) {
      console.error("Error connecting location:", err);
      const errorMessage = err instanceof Error ? err.message : t("chooseBusiness.errors.failedToConnect");
      sileo.error({ title: errorMessage });
    }
  };

  const handleConfigureNext = async (details: LocationDetailsFormData, aiSettings: AIResponseSettingsFormData) => {
    if (!locationId) return;

    try {
      await Promise.all([
        updateLocationConfig({
          locationId,
          config: {
            name: details.name,
            description: details.description,
            phoneNumber: details.phoneNumber,
          },
        }),
        updateLocationConfig({
          locationId,
          config: {
            toneOfVoice: aiSettings.toneOfVoice,
            languageMode: aiSettings.languageMode,
            allowedEmojis: aiSettings.allowedEmojis,
            maxSentences: aiSettings.maxSentences,
            signature: aiSettings.signature,
          },
        }),
      ]);

      storeSetLocationDetails(details);
      storeSetAISettings(aiSettings);

      sendRybbitEvent("ai_settings_configured", {
        tone: aiSettings.toneOfVoice,
        language_mode: aiSettings.languageMode,
      });

      goForward("autoReply");
    } catch (error) {
      console.error("Error saving config:", error);
      sileo.error({ title: t("configure.errorSaving") });
    }
  };

  const handleFinish = async (starRatings: StarRatingConfigFormData) => {
    if (!locationId) return;

    try {
      storeSetStarRatings(starRatings);

      const combinedConfig = {
        toneOfVoice: storeAISettings?.toneOfVoice ?? defaults.toneOfVoice,
        languageMode: storeAISettings?.languageMode ?? defaults.languageMode,
        allowedEmojis: storeAISettings?.allowedEmojis ?? defaults.allowedEmojis,
        maxSentences: storeAISettings?.maxSentences ?? defaults.maxSentences,
        signature: storeAISettings?.signature ?? defaults.signature,
        starConfigs: starRatings,
      };

      await updateLocationConfig({ locationId, config: combinedConfig });

      goForward("import");
    } catch (error) {
      console.error("Error saving configuration:", error);
      sileo.error({ title: t("starRatings.errorMessage") });
    }
  };

  const handleSubscribeSkip = async () => {
    if (!locationId) return;
    try {
      await updateOnboardingStatus(true);
      sendRybbitEvent("onboarding_completed");
      storeReset();
      goForward("celebration");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      sileo.error({ title: t("subscribe.errorMessage") });
    }
  };

  if (currentStep === "celebration") {
    return <CompletionCelebration />;
  }

  const progressBar = <SteppedProgressBar steps={stepLabels} currentStep={STEP_TO_PROGRESS[currentStep]} />;

  const renderStep = () => {
    switch (currentStep) {
      case "connect":
        return <ConnectStep progressBar={progressBar} />;

      case "choose":
        return (
          <ChooseLocationStep
            availableLocations={availableLocations || []}
            onConnect={handleConnectLocation}
            onBack={() => goBackward("connect")}
            progressBar={progressBar}
          />
        );

      case "configure":
        return (
          <ConfigureStep
            location={locationData!}
            initialLocationDetails={initialLocationDetailsValue}
            initialAISettings={initialAISettingsValue}
            onNext={handleConfigureNext}
            onBack={() => goBackward("choose")}
            progressBar={progressBar}
          />
        );

      case "autoReply":
        return (
          <AutoReplyStep
            initialStarRatings={initialStarRatingsValue}
            onFinish={handleFinish}
            onBack={() => goBackward("configure")}
            progressBar={progressBar}
          />
        );

      case "import":
        return (
          <ImportReviewsStep
            accountId={accountId!}
            locationId={locationId!}
            onComplete={() => goForward("subscribe")}
            progressBar={progressBar}
          />
        );

      case "subscribe":
        return (
          <SubscribeStep
            locationId={locationId!}
            locationName={locationData?.name || ""}
            onSkip={handleSubscribeSkip}
            onBack={() => goBackward("import")}
            progressBar={progressBar}
          />
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      formPanel={
        <StepTransition stepKey={currentStep} direction={direction}>
          {renderStep()}
        </StepTransition>
      }
    />
  );
}
