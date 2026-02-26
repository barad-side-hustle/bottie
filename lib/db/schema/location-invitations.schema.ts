import { pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { user } from "./auth.schema";
import { locations } from "./locations.schema";

export const locationInvitations = pgTable(
  "location_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").$type<"admin">().notNull().default("admin"),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    status: text("status").$type<"pending" | "accepted" | "expired" | "cancelled">().notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("location_invitations_location_id_idx").on(table.locationId),
    index("location_invitations_token_idx").on(table.token),
    index("location_invitations_status_idx").on(table.status),

    pgPolicy("location_invitations_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationInvitationsRelations = relations(locationInvitations, ({ one }) => ({
  location: one(locations, { fields: [locationInvitations.locationId], references: [locations.id] }),
  inviter: one(user, { fields: [locationInvitations.invitedBy], references: [user.id] }),
}));

export type LocationInvitation = typeof locationInvitations.$inferSelect;
export type LocationInvitationInsert = typeof locationInvitations.$inferInsert;
