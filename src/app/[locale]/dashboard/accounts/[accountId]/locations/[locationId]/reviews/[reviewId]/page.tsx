import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";
import { getLocation } from "@/lib/actions/locations.actions";
import { getReview } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewCardWithRefresh } from "@/components/dashboard/reviews/ReviewCard";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: Promise<{ locale: string; accountId: string; locationId: string; reviewId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { locale, accountId, locationId, reviewId } = await params;
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.reviewDetail" });
  const tBreadcrumbs = await getTranslations({ locale, namespace: "breadcrumbs" });

  const [location, review] = await Promise.all([
    getLocation({ locationId }),
    getReview({ accountId, locationId, reviewId }) as Promise<ReviewWithLatestGeneration>,
  ]);

  return (
    <PageContainer>
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName: location.name,
            accountId,
            locationId,
            currentSection: "reviews",
            t: tBreadcrumbs,
            reviewerName: review.name,
          })}
        />
      </div>
      <PageHeader title={t("reviewFrom", { reviewerName: review.name })} description={location.name} />

      <div className="mt-6">
        <ReviewCardWithRefresh review={review} accountId={accountId} locationId={locationId} userId={userId} />
      </div>
    </PageContainer>
  );
}
