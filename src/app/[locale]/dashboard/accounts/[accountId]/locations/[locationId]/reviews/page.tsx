import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getReviews } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsList } from "@/components/dashboard/reviews/ReviewsList";
import { ReviewsFilterBar } from "@/components/dashboard/reviews/filters/ReviewsFilterBar";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";

export const dynamic = "force-dynamic";

interface LocationReviewsPageProps {
  params: Promise<{ locale: string; accountId: string; locationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LocationReviewsPage({ params, searchParams }: LocationReviewsPageProps) {
  const { locale, accountId, locationId } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.reviews" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const [location, reviews] = await Promise.all([
    getLocation({ locationId }),
    getReviews({
      accountId,
      locationId,
      filters: {
        ...filters,
        limit: 10,
      },
    }),
  ]);

  return (
    <PageContainer>
      <div className="mb-6">
        <BackButton label={tCommon("back")} />
      </div>

      <PageHeader title={t("reviewsFor", { businessName: location.name })} description={t("allReviews")} />

      <div className="space-y-4 mt-6">
        <Suspense>
          <ReviewsFilterBar />
        </Suspense>
        {reviews.length === 0 ? (
          <EmptyState title={t("noReviews")} description={t("noReviewsDescription")} />
        ) : (
          <Suspense>
            <ReviewsList reviews={reviews} accountId={accountId} locationId={locationId} userId={userId} />
          </Suspense>
        )}
      </div>
    </PageContainer>
  );
}
