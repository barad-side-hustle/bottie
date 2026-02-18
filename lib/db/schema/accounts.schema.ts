import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { accountLocations } from "./account-locations.schema";
import { userAccounts } from "./user-accounts.schema";

export const googleAccounts = pgTable(
  "google_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    email: text("email").notNull(),
    accountName: text("account_name").notNull(),
    googleAccountName: text("google_account_name"),

    googleRefreshToken: text("google_refresh_token").notNull(),

    connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
    lastSynced: timestamp("last_synced", { withTimezone: true }),
  },
  (table) => [
    index("google_accounts_email_idx").on(table.email),
    index("google_accounts_connected_at_idx").on(table.connectedAt),

    pgPolicy("google_accounts_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const googleAccountsRelations = relations(googleAccounts, ({ many }) => ({
  accountLocations: many(accountLocations),
  userAccounts: many(userAccounts),
}));

export type GoogleAccount = typeof googleAccounts.$inferSelect;
export type GoogleAccountInsert = typeof googleAccounts.$inferInsert;
