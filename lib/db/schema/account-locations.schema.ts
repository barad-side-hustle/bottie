import { boolean, pgTable, text, timestamp, uuid, index, pgPolicy, unique } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { authenticatedRole, authUid } from "./roles";
import { accounts } from "./accounts.schema";
import { locations } from "./locations.schema";

export const accountLocations = pgTable(
  "account_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    googleBusinessId: text("google_business_id").notNull(),

    connected: boolean("connected").notNull().default(true),
    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("account_locations_account_location_unique").on(table.accountId, table.locationId),
    index("account_locations_account_id_idx").on(table.accountId),
    index("account_locations_location_id_idx").on(table.locationId),
    index("account_locations_connected_idx").on(table.connected),
    index("account_locations_google_business_id_idx").on(table.googleBusinessId),

    pgPolicy("account_locations_select_associated", {
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("account_locations_insert_associated", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("account_locations_update_associated", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
      )`,
    }),
    pgPolicy("account_locations_delete_owner", {
      for: "delete",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM user_accounts ua
        WHERE ua.account_id = ${table.accountId}
        AND ua.user_id = ${authUid()}
        AND ua.role = 'owner'
      )`,
    }),
  ]
);

export const accountLocationsRelations = relations(accountLocations, ({ one }) => ({
  account: one(accounts, {
    fields: [accountLocations.accountId],
    references: [accounts.id],
  }),
  location: one(locations, {
    fields: [accountLocations.locationId],
    references: [locations.id],
  }),
}));

export type AccountLocation = typeof accountLocations.$inferSelect;
export type AccountLocationInsert = typeof accountLocations.$inferInsert;
