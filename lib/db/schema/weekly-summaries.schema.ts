import { pgTable, timestamp, uuid, integer, jsonb, pgPolicy, date, real, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { locations } from "./locations.schema";

export const weeklySummaries = pgTable(
  "weekly_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    weekStartDate: date("week_start_date").notNull(),
    weekEndDate: date("week_end_date").notNull(),

    totalReviews: integer("total_reviews").notNull(),
    averageRating: real("average_rating").notNull(),

    positiveThemes: jsonb("positive_themes").$type<string[]>().default([]),
    negativeThemes: jsonb("negative_themes").$type<string[]>().default([]),
    recommendations: jsonb("recommendations").$type<string[]>().default([]),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("weekly_summaries_location_week_unique").on(table.locationId, table.weekStartDate, table.weekEndDate),
    index("weekly_summaries_location_week_idx").on(table.locationId, table.weekStartDate, table.weekEndDate),

    pgPolicy("weekly_summaries_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export type WeeklySummary = typeof weeklySummaries.$inferSelect;
export type WeeklySummaryInsert = typeof weeklySummaries.$inferInsert;
