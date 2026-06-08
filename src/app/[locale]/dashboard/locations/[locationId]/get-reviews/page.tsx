import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { SolicitationContent } from "@/components/dashboard/solicitation/SolicitationContent";

export const dynamic = "force-dynamic";

export default async function GetReviewsPage({ params }: { params: Promise<{ locale: string; locationId: string }> }) {
  const { locale, locationId } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.solicitation" });

  const location = await getLocation({ locationId });

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mt-6">
        <SolicitationContent
          reviewUrl={location.reviewUrl}
          mapsUrl={location.mapsUrl}
          locationName={location.name}
          locationId={location.id}
          qrCodeSettings={location.qrCodeSettings ?? null}
        />
      </div>
    </PageContainer>
  );
}
