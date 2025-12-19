import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { getLocation, getAccountLocations } from "@/lib/actions/locations.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { LocationSettingsActions } from "./LocationSettingsActions";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const dynamic = "force-dynamic";

export const metadata = generatePrivatePageMetadata("Location Settings");

export default async function LocationSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; accountId: string; locationId: string }>;
}) {
  const { locale, accountId, locationId } = await params;
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.settings" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const [location, accountLocations, limits] = await Promise.all([
    getLocation(userId, locationId),
    getAccountLocations(userId, accountId),
    new SubscriptionsController().getUserPlanLimits(userId),
  ]);

  const accountLocation = accountLocations.find((al) => al.locationId === locationId);

  return (
    <PageContainer>
      <div className="mb-4">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader
        title={location.name}
        description={location.address}
        icon={accountLocation && !accountLocation.connected && <Badge variant="secondary">{t("disconnected")}</Badge>}
      />

      <LocationSettingsActions
        location={location}
        accountId={accountId}
        accountLocationId={accountLocation?.id}
        userId={userId}
        limits={limits}
        translations={{
          disconnectLocation: t("deleteBusiness"),
          disconnectConfirmation: t("deleteConfirmation", { businessName: location.name }),
          disconnectConfirmationLabel: t("deleteConfirmationLabel"),
          disconnectConfirmationPlaceholder: t("deleteConfirmationPlaceholder"),
          disconnectButton: t("deleteButton"),
          cancel: tCommon("cancel"),
          dangerZone: tCommon("dangerZone"),
          irreversibleActions: tCommon("irreversibleActions"),
          textMismatch: tCommon("textMismatch"),
          disconnecting: tCommon("deleting"),
        }}
      />
    </PageContainer>
  );
}
