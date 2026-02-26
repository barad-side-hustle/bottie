import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { locations } from "./locations.schema";

export const locationAccessRequests = pgTable(
  "location_access_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    status: text("status").$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
    message: text("message"),
    reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("location_access_requests_requester_id_idx").on(table.requesterId),
    index("location_access_requests_location_id_idx").on(table.locationId),
    index("location_access_requests_status_idx").on(table.status),

    pgPolicy("location_access_requests_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationAccessRequestsRelations = relations(locationAccessRequests, ({ one }) => ({
  requester: one(user, { fields: [locationAccessRequests.requesterId], references: [user.id] }),
  location: one(locations, { fields: [locationAccessRequests.locationId], references: [locations.id] }),
}));

export type LocationAccessRequest = typeof locationAccessRequests.$inferSelect;
export type LocationAccessRequestInsert = typeof locationAccessRequests.$inferInsert;
