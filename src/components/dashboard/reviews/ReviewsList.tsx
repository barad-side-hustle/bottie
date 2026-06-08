"use client";

import { ReviewsInbox } from "@/components/dashboard/reviews/ReviewsInbox";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

interface ReviewsListProps {
  reviews: ReviewWithLatestGeneration[];
  locationId: string;
  userId: string;
}

export function ReviewsList({ reviews, locationId, userId }: ReviewsListProps) {
  return <ReviewsInbox reviews={reviews} locationId={locationId} userId={userId} />;
}
