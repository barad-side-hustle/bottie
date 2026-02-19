"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import type { Location } from "@/lib/types";
import LocationDetailsCard from "@/components/dashboard/locations/LocationDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { disconnectLocation } from "@/lib/actions/locations.actions";
import { sendRybbitEvent } from "@/lib/analytics";
import type { PlanLimits } from "@/lib/subscriptions/plans";

interface LocationSettingsActionsProps {
  location: Location;
  accountId: string;
  accountLocationId?: string;
  limits: PlanLimits;
  translations: {
    disconnectLocation: string;
    disconnectConfirmation: string;
    disconnectConfirmationLabel: string;
    disconnectConfirmationPlaceholder: string;
    disconnectButton: string;
    cancel: string;
    dangerZone: string;
    irreversibleActions: string;
    textMismatch: string;
    disconnecting: string;
  };
}

export function LocationSettingsActions({
  location,
  accountId,
  accountLocationId,
  limits,
  translations,
}: LocationSettingsActionsProps) {
  const router = useRouter();
  const [loading, _setLoading] = useState(false);

  const handleUpdate = async () => {
    router.refresh();
  };

  const handleDisconnect = async () => {
    if (!accountLocationId) return;
    try {
      await disconnectLocation({ accountId, accountLocationId });
      sendRybbitEvent("location_disconnected");
      router.push("/dashboard/home");
    } catch (error) {
      console.error("Error disconnecting location:", error);
    }
  };

  return (
    <>
      <LocationDetailsCard location={location} limits={limits} loading={loading} onUpdate={handleUpdate} />

      {accountLocationId && (
        <DeleteConfirmation
          title={translations.disconnectLocation}
          description={translations.disconnectConfirmation}
          confirmationText={location.name}
          confirmationLabel={translations.disconnectConfirmationLabel}
          confirmationPlaceholder={translations.disconnectConfirmationPlaceholder}
          onDelete={handleDisconnect}
          deleteButtonText={translations.disconnectButton}
          cancelLabel={translations.cancel}
          dangerZoneLabel={translations.dangerZone}
          irreversibleActionsLabel={translations.irreversibleActions}
          textMismatchMessage={translations.textMismatch}
          deletingLabel={translations.disconnecting}
        />
      )}
    </>
  );
}
