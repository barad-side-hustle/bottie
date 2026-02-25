import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocation, getAccountLocations } from "@/lib/actions/locations.actions";
import { LocationSettingsActions } from "./LocationSettingsActions";

export const dynamic = "force-dynamic";

export default async function LocationSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; accountId: string; locationId: string }>;
}) {
  const { locale, accountId, locationId } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.settings" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tBreadcrumbs = await getTranslations({ locale, namespace: "breadcrumbs" });

  let location, accountLocations;
  try {
    [location, accountLocations] = await Promise.all([getLocation({ locationId }), getAccountLocations({ accountId })]);
  } catch {
    redirect(`/${locale}/dashboard/home`);
  }

  const accountLocation = accountLocations.find((al) => al.locationId === locationId);

  return (
    <PageContainer>
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName: location.name,
            accountId,
            locationId,
            currentSection: "settings",
            t: tBreadcrumbs,
          })}
        />
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
