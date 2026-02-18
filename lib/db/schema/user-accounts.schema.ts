import { pgTable, primaryKey, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { googleAccounts } from "./accounts.schema";
import { user } from "./auth.schema";

export const userAccounts = pgTable(
  "user_accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => googleAccounts.id, { onDelete: "cascade" }),

    role: text("role").notNull().default("owner"),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.accountId] }),
    index("user_accounts_user_id_idx").on(table.userId),
    index("user_accounts_account_id_idx").on(table.accountId),

    pgPolicy("user_accounts_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const userAccountsRelations = relations(userAccounts, ({ one }) => ({
  account: one(googleAccounts, {
    fields: [userAccounts.accountId],
    references: [googleAccounts.id],
  }),
}));

export type UserAccount = typeof userAccounts.$inferSelect;
export type UserAccountInsert = typeof userAccounts.$inferInsert;
