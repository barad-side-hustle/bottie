"use client";

import { Location } from "@/lib/types";
import LocationIdentitySection from "@/components/dashboard/locations/LocationIdentitySection";
import AIResponseSettingsSection from "@/components/dashboard/locations/AIResponseSettingsSection";
import StarRatingConfigSection from "@/components/dashboard/locations/StarRatingConfigSection";
import { updateLocationConfig } from "@/lib/actions/locations.actions";
import type { PlanLimits } from "@/lib/subscriptions/plans";

interface LocationDetailsCardProps {
  location: Location;
  userId: string;
  limits: PlanLimits;
  loading?: boolean;
  onUpdate: () => Promise<void>;
}

export default function LocationDetailsCard({
  location,
  userId,
  limits,
  loading = false,
  onUpdate,
}: LocationDetailsCardProps) {
  const handleSaveSection = async (partialData: Partial<Location>) => {
    try {
      await updateLocationConfig(userId, location.id, partialData);
      await onUpdate();
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  };

  const handleSaveStarConfigs = async (starConfigs: Location["starConfigs"]) => {
    await handleSaveSection({ starConfigs });
  };

  return (
    <div className="space-y-6">
      <LocationIdentitySection location={location} loading={loading} onSave={handleSaveSection} />

      <AIResponseSettingsSection location={location} limits={limits} loading={loading} onSave={handleSaveSection} />

      <StarRatingConfigSection starConfigs={location.starConfigs} loading={loading} onSave={handleSaveStarConfigs} />
    </div>
  );
}
