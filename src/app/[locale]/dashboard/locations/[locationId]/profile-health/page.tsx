import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getProfileHealth } from "@/lib/actions/profile-health.actions";
import { ProfileHealthPage } from "@/components/dashboard/locations/ProfileHealthPage";

export const dynamic = "force-dynamic";

export default async function ProfileHealthRoute({
  params,
}: {
  params: Promise<{ locale: string; locationId: string }>;
}) {
  const { locale, locationId } = await params;
  const tBreadcrumbs = await getTranslations({ locale, namespace: "breadcrumbs" });

  let location;
  try {
    location = await getLocation({ locationId });
  } catch {
    redirect(`/${locale}/dashboard/home`);
  }

  const profileHealth = await getProfileHealth({ locationId }).catch(() => null);

  return (
    <PageContainer>
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName: location.name,
            locationId,
            currentSection: "profileHealth",
            t: tBreadcrumbs,
          })}
        />
      </div>

      <ProfileHealthPage result={profileHealth} />
    </PageContainer>
  );
}
