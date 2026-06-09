import {
  doublePrecision,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { locations } from "./locations.schema";

export type CompetitorSnapshotStatus = "ok" | "no_competitors" | "resolution_failed" | "api_error";

export interface CompetitorEntry {
  placeId: string;
  displayName: string;
  rating: number | null;
  userRatingCount: number | null;
  primaryType: string | null;
  businessStatus: string | null;
}

export interface BenchmarkStats {
  competitorCount: number;
  avgRating: number | null;
  medianRating: number | null;
  avgReviewCount: number | null;
  medianReviewCount: number | null;
  ownRank: number | null;
  totalRanked: number;
  ratingPercentile: number | null;
  reviewCountGap: number | null;
}

export const locationCompetitorSnapshots = pgTable(
  "location_competitor_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    placeId: text("place_id"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    primaryType: text("primary_type"),
    ownRating: doublePrecision("own_rating"),
    ownReviewCount: integer("own_review_count"),
    businessStatus: text("business_status"),

    competitors: jsonb("competitors").$type<CompetitorEntry[]>().notNull().default([]),
    stats: jsonb("stats").$type<BenchmarkStats | null>(),
    radiusMeters: integer("radius_meters").notNull().default(2000),

    status: text("status").$type<CompetitorSnapshotStatus>().notNull().default("ok"),
    errorReason: text("error_reason"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    unique("location_competitor_snapshots_location_unique").on(table.locationId),
    index("location_competitor_snapshots_location_id_idx").on(table.locationId),

    pgPolicy("location_competitor_snapshots_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationCompetitorSnapshotsRelations = relations(locationCompetitorSnapshots, ({ one }) => ({
  location: one(locations, {
    fields: [locationCompetitorSnapshots.locationId],
    references: [locations.id],
  }),
}));

export type LocationCompetitorSnapshot = typeof locationCompetitorSnapshots.$inferSelect;
export type LocationCompetitorSnapshotInsert = typeof locationCompetitorSnapshots.$inferInsert;
