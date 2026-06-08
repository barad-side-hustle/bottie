import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getReview } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewDetailPage } from "@/components/dashboard/reviews/ReviewDetailPage";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: Promise<{ locale: string; locationId: string; reviewId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { locale, locationId, reviewId } = await params;
  await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.reviewDetail" });

  const [location, review] = await Promise.all([
    getLocation({ locationId }),
    getReview({ locationId, reviewId }) as Promise<ReviewWithLatestGeneration>,
  ]);

  return (
    <PageContainer>
      <PageHeader title={t("reviewFrom", { reviewerName: review.name })} description={location.name} />

      <div className="mt-6 max-w-3xl">
        <ReviewDetailPage review={review} locationId={locationId} />
      </div>
    </PageContainer>
  );
}
