import { ReviewFilters, ReviewSortField, ReviewSortOptions, Sentiment } from "@/lib/types";
import { format } from "date-fns";

export const DEFAULT_REVIEW_SORT: ReviewSortOptions = {
  orderBy: "date",
  orderDirection: "desc",
};

export function parseFiltersFromSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): ReviewFilters {
  const filters: ReviewFilters = {
    sort: DEFAULT_REVIEW_SORT,
  };

  const replyStatus = searchParams.replyStatus;
  if (typeof replyStatus === "string") {
    filters.replyStatus = replyStatus.split(",") as ("pending" | "posted" | "failed")[];
  }

  const rating = searchParams.rating;
  if (typeof rating === "string") {
    filters.rating = rating.split(",").map(Number);
  }

  const sentiment = searchParams.sentiment;
  if (typeof sentiment === "string") {
    filters.sentiment = sentiment.split(",") as Sentiment[];
  }

  if (typeof searchParams.dateFrom === "string") {
    filters.dateFrom = new Date(searchParams.dateFrom);
  }
  if (typeof searchParams.dateTo === "string") {
    filters.dateTo = new Date(searchParams.dateTo);
  }

  filters.sort = {
    orderBy: (searchParams.sortBy as ReviewSortField) || DEFAULT_REVIEW_SORT.orderBy,
    orderDirection: (searchParams.sortDir as "asc" | "desc") || DEFAULT_REVIEW_SORT.orderDirection,
  };

  return filters;
}

export function buildSearchParams(filters: Partial<ReviewFilters>): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.replyStatus?.length) {
    params.set("replyStatus", filters.replyStatus.join(","));
  }

  if (filters.rating?.length) {
    params.set("rating", filters.rating.join(","));
  }

  if (filters.sentiment?.length) {
    params.set("sentiment", filters.sentiment.join(","));
  }

  if (filters.dateFrom) {
    params.set("dateFrom", format(filters.dateFrom, "yyyy-MM-dd"));
  }

  if (filters.dateTo) {
    params.set("dateTo", format(filters.dateTo, "yyyy-MM-dd"));
  }

  if (filters.sort) {
    params.set("sortBy", filters.sort.orderBy);
    params.set("sortDir", filters.sort.orderDirection);
  }

  return params;
}
