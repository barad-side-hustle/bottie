export interface SortOptions<T extends string> {
  orderBy: T;
  orderDirection: "asc" | "desc";
}

export type ReviewSortField = "receivedAt" | "rating" | "date" | "replyStatus";
export type ReviewSortOptions = SortOptions<ReviewSortField>;
