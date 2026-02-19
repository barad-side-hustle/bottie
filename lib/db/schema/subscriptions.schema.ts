import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.schema";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    status: text("status").notNull().default("active"),

    polarCustomerId: text("polar_customer_id"),
    polarSubscriptionId: text("polar_subscription_id"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_user_status_idx").on(table.userId, table.status),

    pgPolicy("subscriptions_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;
