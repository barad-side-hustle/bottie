import { pgTable, text, timestamp, uuid, index, unique, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { locations } from "./locations.schema";

export const locationMembers = pgTable(
  "location_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    role: text("role").$type<"owner" | "admin">().notNull().default("admin"),
    invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("location_members_user_location_unique").on(table.userId, table.locationId),
    index("location_members_user_id_idx").on(table.userId),
    index("location_members_location_id_idx").on(table.locationId),

    pgPolicy("location_members_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationMembersRelations = relations(locationMembers, ({ one }) => ({
  user: one(user, { fields: [locationMembers.userId], references: [user.id] }),
  location: one(locations, { fields: [locationMembers.locationId], references: [locations.id] }),
}));

export type LocationMember = typeof locationMembers.$inferSelect;
export type LocationMemberInsert = typeof locationMembers.$inferInsert;
