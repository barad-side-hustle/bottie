import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, index, pgPolicy, check } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { locations } from "./locations.schema";
import type { ReplyStatus, FailureReason } from "../../types/review.types";
import type { ReviewClassification } from "../../types/classification.types";
import { reviewResponses } from "./review-responses.schema";

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    googleReviewId: text("google_review_id").notNull().unique(),
    googleReviewName: text("google_review_name"),

    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    isAnonymous: boolean("is_anonymous").notNull().default(false),

    rating: integer("rating").notNull(),
    text: text("text"),
    date: timestamp("date", { withTimezone: true }).notNull(),

    replyStatus: text("reply_status").$type<ReplyStatus>().notNull().default("pending"),
    failureReason: text("failure_reason").$type<FailureReason>(),

    consumesQuota: boolean("consumes_quota").notNull().default(true),

    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    updateTime: timestamp("update_time", { withTimezone: true }),

    classifications: jsonb("classifications").$type<ReviewClassification>(),

    notificationSent: boolean("notification_sent").notNull().default(false),
  },
  (table) => [
    index("reviews_location_id_idx").on(table.locationId),
    index("reviews_google_review_id_idx").on(table.googleReviewId),
    index("reviews_reply_status_idx").on(table.replyStatus),
    index("reviews_received_at_idx").on(table.receivedAt),
    index("reviews_location_status_idx").on(table.locationId, table.replyStatus),
    index("reviews_received_status_idx").on(table.receivedAt, table.replyStatus),
    index("reviews_location_date_idx").on(table.locationId, table.date),
    index("reviews_consumes_quota_received_at_idx").on(table.consumesQuota, table.receivedAt),
    index("reviews_location_rating_idx").on(table.locationId, table.rating),
    index("reviews_notification_sent_idx").on(table.notificationSent, table.replyStatus),

    check("reviews_reply_status_check", sql`${table.replyStatus} IN ('pending', 'posted', 'failed')`),

    check(
      "reviews_failure_reason_check",
      sql`${table.failureReason} IS NULL OR ${table.failureReason} IN ('generation', 'posting', 'quota')`
    ),

    pgPolicy("reviews_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const reviewsRelations = relations(reviews, ({ many, one }) => ({
  location: one(locations, {
    fields: [reviews.locationId],
    references: [locations.id],
  }),

  responses: many(reviewResponses),
}));

export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;
