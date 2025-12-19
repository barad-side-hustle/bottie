import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const REVALIDATE_DURATION = 5 * 60 * 1000;

interface OnboardingStatusState {
  hasConnectedLocations: boolean | null;
  lastCheckedAt: number | null;

  updateStatus: (hasLocations: boolean) => void;
  clearStatus: () => void;
  shouldRecheck: () => boolean;
}

export const useOnboardingStatusStore = create<OnboardingStatusState>()(
  persist(
    (set, get) => ({
      hasConnectedLocations: null,
      lastCheckedAt: null,

      updateStatus: (hasLocations: boolean) => {
        set({
          hasConnectedLocations: hasLocations,
          lastCheckedAt: Date.now(),
        });
      },

      clearStatus: () => {
        set({
          hasConnectedLocations: null,
          lastCheckedAt: null,
        });
      },

      shouldRecheck: () => {
        const { lastCheckedAt } = get();
        if (!lastCheckedAt) return true;

        const now = Date.now();
        return now - lastCheckedAt >= REVALIDATE_DURATION;
      },
    }),
    {
      name: "bottie-onboarding-status",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
