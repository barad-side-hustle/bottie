import { ReplyStatus } from "./review.types";
import { SortOptions, ReviewSortOptions } from "./sort.types";

export type Sentiment = "positive" | "neutral" | "negative";

export interface TFilters {
  ids?: string[];
  limit?: number;
  offset?: number;
  sort?: SortOptions<string>;
}
export interface ReviewFilters extends TFilters {
  replyStatus?: ReplyStatus[];
  rating?: number[];
  sentiment?: Sentiment[];
  dateFrom?: Date;
  dateTo?: Date;
  sort: ReviewSortOptions;
}

export interface LocationFilters extends TFilters {
  connected?: boolean;
}

export interface AccountLocationFilters extends TFilters {
  connected?: boolean;
}

export interface AccountFilters extends TFilters {
  email?: string;
}
