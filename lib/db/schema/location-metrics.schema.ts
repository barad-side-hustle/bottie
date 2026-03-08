import { integer, pgTable, timestamp, uuid, index, pgPolicy, unique } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { locations } from "./locations.schema";

export const locationMetrics = pgTable(
  "location_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    date: timestamp("date", { withTimezone: true }).notNull(),

    searchImpressionsDesktop: integer("search_impressions_desktop").notNull().default(0),
    searchImpressionsMobile: integer("search_impressions_mobile").notNull().default(0),
    mapsImpressionsDesktop: integer("maps_impressions_desktop").notNull().default(0),
    mapsImpressionsMobile: integer("maps_impressions_mobile").notNull().default(0),

    websiteClicks: integer("website_clicks").notNull().default(0),
    phoneCallClicks: integer("phone_call_clicks").notNull().default(0),
    directionRequests: integer("direction_requests").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("location_metrics_location_date_unique").on(table.locationId, table.date),
    index("location_metrics_location_id_idx").on(table.locationId),
    index("location_metrics_date_idx").on(table.date),

    pgPolicy("location_metrics_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationMetricsRelations = relations(locationMetrics, ({ one }) => ({
  location: one(locations, {
    fields: [locationMetrics.locationId],
    references: [locations.id],
  }),
}));

export type LocationMetric = typeof locationMetrics.$inferSelect;
export type LocationMetricInsert = typeof locationMetrics.$inferInsert;
