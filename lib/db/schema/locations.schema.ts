import { integer, jsonb, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { reviews } from "./reviews.schema";
import { accountLocations } from "./account-locations.schema";
import { locationMembers } from "./location-members.schema";
import { locationAccessRequests } from "./location-access-requests.schema";
import { locationInvitations } from "./location-invitations.schema";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    googleLocationId: text("google_location_id").notNull().unique(),

    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    phoneNumber: text("phone_number"),
    websiteUrl: text("website_url"),
    mapsUrl: text("maps_url"),
    reviewUrl: text("review_url"),
    description: text("description"),
    photoUrl: text("photo_url"),

    toneOfVoice: text("tone_of_voice")
      .$type<"friendly" | "formal" | "humorous" | "professional">()
      .notNull()
      .default("friendly"),
    languageMode: text("language_mode")
      .$type<"hebrew" | "english" | "spanish" | "auto-detect">()
      .notNull()
      .default("auto-detect"),
    maxSentences: integer("max_sentences"),
    allowedEmojis: jsonb("allowed_emojis").$type<string[]>(),
    signature: text("signature"),
    starConfigs: jsonb("star_configs")
      .$type<{
        1: { customInstructions: string; autoReply: boolean };
        2: { customInstructions: string; autoReply: boolean };
        3: { customInstructions: string; autoReply: boolean };
        4: { customInstructions: string; autoReply: boolean };
        5: { customInstructions: string; autoReply: boolean };
      }>()
      .notNull(),
    qrCodeSettings: jsonb("qr_code_settings").$type<QrCodeSettings>(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("locations_google_location_id_idx").on(table.googleLocationId),

    pgPolicy("locations_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationsRelations = relations(locations, ({ many }) => ({
  reviews: many(reviews),
  accountLocations: many(accountLocations),
  members: many(locationMembers),
  accessRequests: many(locationAccessRequests),
  invitations: many(locationInvitations),
}));

export type Location = typeof locations.$inferSelect;
export type LocationInsert = typeof locations.$inferInsert;
