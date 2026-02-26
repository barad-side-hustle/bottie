import type { Review as DrizzleReview, ReviewInsert } from "@/lib/db/schema";

export type ReplyStatus = "pending" | "posted" | "failed";

export type FailureReason = "generation" | "posting" | "quota";

export type Review = DrizzleReview;

export type ReviewCreate = Omit<ReviewInsert, "id" | "receivedAt" | "updateTime">;
