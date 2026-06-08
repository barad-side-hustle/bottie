"use client";

import { useRouter } from "@/i18n/routing";
import { ReviewDetailPanel } from "@/components/dashboard/reviews/ReviewDetailPanel";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

interface ReviewDetailPageProps {
  review: ReviewWithLatestGeneration;
  locationId: string;
}

export function ReviewDetailPage({ review, locationId }: ReviewDetailPageProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card">
      <ReviewDetailPanel
        review={review}
        locationId={locationId}
        variant="page"
        onUpdate={() => router.refresh()}
        onPublished={() => router.refresh()}
      />
    </div>
  );
}
