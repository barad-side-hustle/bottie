import { pgTable, text, timestamp, uuid, index, check, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { locations } from "./locations.schema";
import { reviews } from "./reviews.schema";
import { googleAccounts } from "./accounts.schema";
import { user } from "./auth.schema";

export const reviewResponses = pgTable(
  "review_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => googleAccounts.id, { onDelete: "cascade" }),

    text: text("text").notNull(),
    status: text("status").notNull(),
    type: text("type").$type<"imported" | "ai_generated" | "human_generated">().notNull().default("ai_generated"),
    feedback: text("feedback").$type<"liked" | "disliked">(),
    feedbackComment: text("feedback_comment"),

    generatedBy: text("generated_by").references(() => user.id, { onDelete: "set null" }),
    postedBy: text("posted_by").references(() => user.id, { onDelete: "set null" }),
    postedAt: timestamp("posted_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("review_responses_location_id_idx").on(table.locationId),
    index("review_responses_review_id_idx").on(table.reviewId),
    index("review_responses_status_idx").on(table.status),
    index("review_responses_created_at_idx").on(table.createdAt),
    index("review_responses_location_status_created_idx").on(table.locationId, table.status, table.createdAt),

    check("review_responses_status_check", sql`${table.status} IN ('draft', 'posted', 'rejected')`),
    check(
      "review_responses_feedback_check",
      sql`${table.feedback} IS NULL OR ${table.feedback} IN ('liked', 'disliked')`
    ),
    index("review_responses_location_feedback_created_idx").on(table.locationId, table.feedback, table.createdAt),

    pgPolicy("review_responses_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewResponses.reviewId],
    references: [reviews.id],
  }),
  location: one(locations, {
    fields: [reviewResponses.locationId],
    references: [locations.id],
  }),
  account: one(googleAccounts, {
    fields: [reviewResponses.accountId],
    references: [googleAccounts.id],
  }),
}));

export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type ReviewResponseInsert = typeof reviewResponses.$inferInsert;
