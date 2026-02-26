"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { ReviewFilters } from "@/lib/types";
import { parseFiltersFromSearchParams, buildSearchParams, DEFAULT_REVIEW_SORT } from "@/lib/utils/filter-utils";
import { useFiltersStore } from "@/lib/store/filters-store";
import { ReviewFiltersForm } from "./ReviewFiltersForm";
import { ResponsiveFilterPanel } from "./ResponsiveFilterPanel";
import { ActiveFilters } from "./ActiveFilters";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";

function useReviewFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const locationId = params.locationId as string;

  const { getFilters, setFilters: storeSetFilters, clearFilters } = useFiltersStore();

  const paramsObj: { [key: string]: string | string[] | undefined } = {};
  searchParams.forEach((value, key) => {
    paramsObj[key] = value;
  });

  const hasUrlParams = Object.keys(paramsObj).some((key) =>
    ["replyStatus", "rating", "dateFrom", "dateTo", "sortBy", "sortDir"].includes(key)
  );

  let filters: ReviewFilters;
  if (hasUrlParams) {
    filters = parseFiltersFromSearchParams(paramsObj);
  } else {
    const storedFilters = getFilters(locationId);
    filters = storedFilters || { sort: DEFAULT_REVIEW_SORT };
  }

  const activeCount =
    (filters.replyStatus?.length ?? 0) +
    (filters.rating?.length ?? 0) +
    (filters.sentiment?.length ?? 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  const handleFilterChange = (newFilters: ReviewFilters) => {
    storeSetFilters(locationId, newFilters);
    const params = buildSearchParams(newFilters);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    clearFilters(locationId);
    router.push(pathname);
  };

  const handleRemoveFilter = (key: keyof ReviewFilters, value?: string | number) => {
    const newFilters = { ...filters };

    if (key === "replyStatus" && newFilters.replyStatus) {
      newFilters.replyStatus = newFilters.replyStatus.filter((s) => s !== value);
    } else if (key === "rating" && newFilters.rating) {
      newFilters.rating = newFilters.rating.filter((r) => r !== value);
    } else if (key === "sentiment" && newFilters.sentiment) {
      newFilters.sentiment = newFilters.sentiment.filter((s) => s !== value);
    } else if (key === "dateFrom" || key === "dateTo") {
      delete newFilters.dateFrom;
      delete newFilters.dateTo;
    }

    handleFilterChange(newFilters);
  };

  return { filters, activeCount, isOpen, setIsOpen, handleFilterChange, handleReset, handleRemoveFilter };
}

export function ReviewsFilterBar() {
  const { filters, activeCount, isOpen, setIsOpen, handleFilterChange, handleReset, handleRemoveFilter } =
    useReviewFilters();

  return (
    <div className="mb-6">
      <ResponsiveFilterPanel activeCount={activeCount} open={isOpen} onOpenChange={setIsOpen}>
        <ReviewFiltersForm filters={filters} onApply={handleFilterChange} onReset={handleReset} />
      </ResponsiveFilterPanel>
      <ActiveFilters filters={filters} onRemove={handleRemoveFilter} onClearAll={handleReset} />
    </div>
  );
}

export function ReviewsDesktopFilterPanel() {
  const t = useTranslations("dashboard.reviews.filters");
  const { filters, handleFilterChange, handleReset } = useReviewFilters();

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<Filter className="size-5" />}>{t("filters")}</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardContent>
        <ReviewFiltersForm filters={filters} onApply={handleFilterChange} onReset={handleReset} />
      </DashboardCardContent>
    </DashboardCard>
  );
}

export function ReviewsActiveFilters() {
  const { filters, handleReset, handleRemoveFilter } = useReviewFilters();

  return <ActiveFilters filters={filters} onRemove={handleRemoveFilter} onClearAll={handleReset} />;
}
