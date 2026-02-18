import { pgTable, text, timestamp, uuid, index, pgPolicy, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth.schema";

export const USER_CONFIG_KEYS = {
  EMAIL_ON_NEW_REVIEW: "EMAIL_ON_NEW_REVIEW",
  WEEKLY_SUMMARY_ENABLED: "WEEKLY_SUMMARY_ENABLED",
} as const;

export type UserConfigKey = keyof typeof USER_CONFIG_KEYS;

export type UserConfigMap = {
  EMAIL_ON_NEW_REVIEW: boolean;
  WEEKLY_SUMMARY_ENABLED: boolean;
};

export type UserConfigValue<K extends UserConfigKey> = UserConfigMap[K];

export const usersConfigs = pgTable(
  "users_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    configs: jsonb("configs")
      .$type<UserConfigMap>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("users_configs_user_id_idx").on(table.userId),

    pgPolicy("users_configs_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export type UsersConfig = typeof usersConfigs.$inferSelect;
export type UsersConfigInsert = typeof usersConfigs.$inferInsert;
