import { pgTable, text, timestamp, uuid, index, unique, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.schema";
import { locations } from "./locations.schema";

export const locationSubscriptions = pgTable(
  "location_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    status: text("status").$type<"active" | "canceled">().notNull().default("active"),

    polarSubscriptionId: text("polar_subscription_id"),

    activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("location_subscriptions_user_location_unique").on(table.userId, table.locationId),
    index("location_subscriptions_user_id_idx").on(table.userId),
    index("location_subscriptions_location_id_idx").on(table.locationId),
    index("location_subscriptions_status_idx").on(table.status),

    pgPolicy("location_subscriptions_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export type LocationSubscription = typeof locationSubscriptions.$inferSelect;
export type LocationSubscriptionInsert = typeof locationSubscriptions.$inferInsert;
