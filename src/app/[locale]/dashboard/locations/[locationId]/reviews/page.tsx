import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";
import { getLocation } from "@/lib/actions/locations.actions";
import { getReviews } from "@/lib/actions/reviews.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { ReviewsList } from "@/components/dashboard/reviews/ReviewsList";
import {
  ReviewsFilterBar,
  ReviewsDesktopFilterPanel,
  ReviewsActiveFilters,
} from "@/components/dashboard/reviews/filters/ReviewsFilterBar";
import { parseFiltersFromSearchParams } from "@/lib/utils/filter-utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { buildLocationBreadcrumbs } from "@/lib/utils/breadcrumbs";

export const dynamic = "force-dynamic";

interface LocationReviewsPageProps {
  params: Promise<{ locale: string; locationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LocationReviewsPage({ params, searchParams }: LocationReviewsPageProps) {
  const { locale, locationId } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);
  const { userId } = await getAuthenticatedUserId();
  const t = await getTranslations({ locale, namespace: "dashboard.reviews" });
  const tBreadcrumbs = await getTranslations({ locale, namespace: "breadcrumbs" });
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
    <PageContainer>
      <div className="mb-4">
        <Breadcrumbs
          items={buildLocationBreadcrumbs({
            locationName: location.name,
            locationId,
            currentSection: "reviews",
            t: tBreadcrumbs,
          })}
        />
      </div>

      <PageHeader title={t("reviewsFor", { businessName: location.name })} description={t("allReviews")} />

      <div className="lg:flex lg:gap-6 mt-6">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="lg:hidden">
            <Suspense>
              <ReviewsFilterBar />
            </Suspense>
          </div>
          <div className="hidden lg:block">
            <Suspense>
              <ReviewsActiveFilters />
            </Suspense>
          </div>
          {reviews.length === 0 ? (
            <EmptyState title={t("noReviews")} description={t("noReviewsDescription")} />
          ) : (
            <Suspense>
              <ReviewsList reviews={reviews} locationId={locationId} userId={userId} />
            </Suspense>
          )}
        </div>

        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-20">
            <Suspense>
              <ReviewsDesktopFilterPanel />
            </Suspense>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
