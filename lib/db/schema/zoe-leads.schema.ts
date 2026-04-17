import { pgTable, text, timestamp, uuid, index, pgPolicy, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const zoeLeads = pgTable(
  "zoe_leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    googlePlaceId: text("google_place_id").notNull().unique(),
    businessName: text("business_name").notNull(),
    email: text("email"),
    websiteUrl: text("website_url"),
    googleMapsUrl: text("google_maps_url"),
    address: text("address"),
    city: text("city"),

    country: text("country").notNull().default("IL"),

    status: text("status").$type<"pending" | "sent" | "failed" | "skipped">().notNull().default("pending"),
    searchQuery: text("search_query"),
    error: text("error"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => [
    index("zoe_leads_google_place_id_idx").on(table.googlePlaceId),
    index("zoe_leads_status_idx").on(table.status),
    index("zoe_leads_email_idx").on(table.email),
    index("zoe_leads_created_at_idx").on(table.createdAt),
    index("zoe_leads_country_idx").on(table.country),
    index("zoe_leads_needs_email_idx")
      .on(table.createdAt)
      .where(sql`status = 'pending' AND website_url IS NOT NULL AND email IS NULL`),

    check("zoe_leads_status_check", sql`${table.status} IN ('pending', 'sent', 'failed', 'skipped')`),

    pgPolicy("zoe_leads_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export type ZoeLead = typeof zoeLeads.$inferSelect;
export type ZoeLeadInsert = typeof zoeLeads.$inferInsert;
