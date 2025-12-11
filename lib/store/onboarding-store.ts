import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LocationDetailsFormData } from "@/components/dashboard/locations/forms/LocationDetailsForm";
import type { AIResponseSettingsFormData } from "@/components/dashboard/locations/forms/AIResponseSettingsForm";
import type { StarRatingConfigFormData } from "@/components/dashboard/locations/forms/StarRatingConfigForm";
import { getDefaultLocationConfig } from "@/lib/utils/location-config";

interface OnboardingState {
  accountId: string | null;
  locationId: string | null;

  locationDetails: LocationDetailsFormData | null;
  aiSettings: AIResponseSettingsFormData | null;
  starRatings: StarRatingConfigFormData | null;

  setAccountId: (accountId: string) => void;
  setLocationId: (locationId: string) => void;
  setLocationDetails: (data: LocationDetailsFormData) => void;
  setAISettings: (data: AIResponseSettingsFormData) => void;
  setStarRatings: (data: StarRatingConfigFormData) => void;

  reset: () => void;
  getCombinedConfig: () => ReturnType<typeof getDefaultLocationConfig>;
}

const getInitialState = () => {
  return {
    accountId: null,
    locationId: null,
    locationDetails: null,
    aiSettings: null,
    starRatings: null,
  };
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setAccountId: (accountId: string) => {
        set({ accountId });
      },

      setLocationId: (locationId: string) => {
        set({ locationId });
      },

      setLocationDetails: (data: LocationDetailsFormData) => {
        set({ locationDetails: data });
      },

      setAISettings: (data: AIResponseSettingsFormData) => {
        set({ aiSettings: data });
      },

      setStarRatings: (data: StarRatingConfigFormData) => {
        set({ starRatings: data });
      },

      reset: () => {
        set(getInitialState());
      },

      getCombinedConfig: () => {
        const state = get();
        const defaults = getDefaultLocationConfig();

        const config = {
          toneOfVoice: state.aiSettings?.toneOfVoice ?? defaults.toneOfVoice,
          languageMode: state.aiSettings?.languageMode ?? defaults.languageMode,
          allowedEmojis: state.aiSettings?.allowedEmojis ?? defaults.allowedEmojis,
          maxSentences: state.aiSettings?.maxSentences ?? defaults.maxSentences,
          signature: state.aiSettings?.signature ?? defaults.signature,
          starConfigs: state.starRatings ?? defaults.starConfigs,
        };

        return config;
      },
    }),
    {
      name: "bottie-onboarding-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
