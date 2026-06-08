import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
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
  const t = await getTranslations({ locale, namespace: "dashboard.profileHealth" });

  try {
    await getLocation({ locationId });
  } catch {
    redirect(`/${locale}/dashboard/home`);
  }

  const profileHealth = await getProfileHealth({ locationId }).catch(() => null);

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="mt-6">
        <ProfileHealthPage result={profileHealth} />
      </div>
    </PageContainer>
  );
}
