import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getReviews } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsInbox } from "@/components/dashboard/reviews/ReviewsInbox";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";

export const dynamic = "force-dynamic";

const FILTER_PARAM_KEYS = ["replyStatus", "rating", "sentiment", "dateFrom", "dateTo", "search"];

interface LocationReviewsPageProps {
  params: Promise<{ locale: string; locationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LocationReviewsPage({ params, searchParams }: LocationReviewsPageProps) {
  const { locale, locationId } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);
  const hasActiveFilters = FILTER_PARAM_KEYS.some((key) => resolvedSearchParams[key]);
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.reviews" });
  const [location, reviews] = await Promise.all([
    getLocation({ locationId }),
    getReviews({
      locationId,
      filters: {
        ...filters,
        limit: 10,
      },
    }),
  ]);

  return (
    <PageContainer className="max-w-[1440px] space-y-0">
      <PageHeader title={t("reviewsFor", { businessName: location.name })} description={t("allReviews")} />

      {reviews.length === 0 && !hasActiveFilters ? (
        <div className="mt-6">
          <EmptyState title={t("noReviews")} description={t("noReviewsDescription")} />
        </div>
      ) : (
        <div className="mt-6">
          <Suspense>
            <ReviewsInbox reviews={reviews} locationId={locationId} userId={userId} />
          </Suspense>
        </div>
      )}
    </PageContainer>
  );
}
