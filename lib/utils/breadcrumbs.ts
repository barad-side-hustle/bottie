export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function buildLocationBreadcrumbs(params: {
  locationName: string;
  accountId: string;
  locationId: string;
  currentSection: "reviews" | "insights" | "settings" | "getReviews";
  t: (key: string) => string;
  reviewerName?: string;
}): BreadcrumbItem[] {
  const { locationName, accountId, locationId, currentSection, t, reviewerName } = params;
  const locationReviewsHref = `/dashboard/accounts/${accountId}/locations/${locationId}/reviews`;

  const items: BreadcrumbItem[] = [
    { label: t("overview"), href: "/dashboard/home" },
    { label: locationName, href: locationReviewsHref },
  ];

  if (reviewerName) {
    items.push({ label: t("reviews"), href: locationReviewsHref });
    items.push({ label: reviewerName });
  } else {
    items.push({ label: t(currentSection) });
  }

  return items;
}
