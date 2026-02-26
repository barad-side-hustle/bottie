import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getLocationMembers, getPendingRequests, getPendingInvitations } from "@/lib/actions/location-members.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getUserLocationRole } from "@/lib/db/repositories/access-conditions";
import { LocationSettingsActions } from "./LocationSettingsActions";
import { MembersSection } from "@/components/dashboard/locations/MembersSection";

export const dynamic = "force-dynamic";

export default async function LocationSettingsPage({
  params,
}: {
  params: Promise<{ locale: string; locationId: string }>;
}) {
  const { locale, locationId } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.settings" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tBreadcrumbs = await getTranslations({ locale, namespace: "breadcrumbs" });

  const { userId } = await getAuthenticatedUserId();

  let location;
  try {
    location = await getLocation({ locationId });
  } catch {
    redirect(`/${locale}/dashboard/home`);
  }

  const role = await getUserLocationRole(userId, locationId);
  const currentUserRole = role ?? "admin";
  const isOwner = currentUserRole === "owner";

  const [members, requests, invitations] = await Promise.all([
    getLocationMembers({ locationId }),
    isOwner ? getPendingRequests({ locationId }) : Promise.resolve([]),
    isOwner ? getPendingInvitations({ locationId }) : Promise.resolve([]),
  ]);

  return (
    <PageContainer>
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName: location.name,
            locationId,
            currentSection: "settings",
            t: tBreadcrumbs,
          })}
        />
      </div>

      <PageHeader title={location.name} description={location.address} />

      <MembersSection
        locationId={locationId}
        currentUserRole={currentUserRole}
        currentUserId={userId}
        initialMembers={members}
        initialRequests={requests}
        initialInvitations={invitations}
      />

      <LocationSettingsActions
        location={location}
        currentUserRole={currentUserRole}
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
