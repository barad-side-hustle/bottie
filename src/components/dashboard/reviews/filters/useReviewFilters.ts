"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { ReviewFilters } from "@/lib/types";
import { parseFiltersFromSearchParams, buildSearchParams, DEFAULT_REVIEW_SORT } from "@/lib/utils/filter-utils";
import { useFiltersStore } from "@/lib/store/filters-store";

const URL_FILTER_KEYS = ["replyStatus", "rating", "sentiment", "dateFrom", "dateTo", "search", "sortBy", "sortDir"];

export function useReviewFilters() {
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

  const hasUrlParams = Object.keys(paramsObj).some((key) => URL_FILTER_KEYS.includes(key));

  let filters: ReviewFilters;
  if (hasUrlParams) {
    filters = parseFiltersFromSearchParams(paramsObj);
  } else {
    const storedFilters = getFilters(locationId);
    filters = storedFilters || { sort: DEFAULT_REVIEW_SORT };
  }

  const activeCount =
    (filters.rating?.length ?? 0) +
    (filters.sentiment?.length ?? 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  const handleFilterChange = (newFilters: ReviewFilters) => {
    storeSetFilters(locationId, newFilters);
    const params = buildSearchParams(newFilters);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleReset = () => {
    clearFilters(locationId);
    router.push(pathname);
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange({ ...filters, search: search.trim() || undefined });
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

  return {
    filters,
    activeCount,
    isOpen,
    setIsOpen,
    handleFilterChange,
    handleReset,
    handleSearchChange,
    handleRemoveFilter,
  };
}
