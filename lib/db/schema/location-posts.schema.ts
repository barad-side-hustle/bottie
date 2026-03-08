import { jsonb, pgTable, text, timestamp, uuid, index, pgPolicy } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { locations } from "./locations.schema";

export type PostType = "STANDARD" | "EVENT" | "OFFER";
export type PostStatus = "draft" | "published" | "failed";
export type CallToActionType = "BOOK" | "ORDER" | "SHOP" | "LEARN_MORE" | "SIGN_UP" | "CALL";

export interface PostCallToAction {
  actionType: CallToActionType;
  url: string;
}

export interface PostEvent {
  title: string;
  startDate: string;
  endDate: string;
}

export interface PostOffer {
  couponCode?: string;
  redeemOnlineUrl?: string;
  termsConditions?: string;
}

export const locationPosts = pgTable(
  "location_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),

    topicType: text("topic_type").$type<PostType>().notNull().default("STANDARD"),
    summary: text("summary").notNull(),
    mediaUrl: text("media_url"),
    callToAction: jsonb("call_to_action").$type<PostCallToAction>(),
    event: jsonb("event").$type<PostEvent>(),
    offer: jsonb("offer").$type<PostOffer>(),

    status: text("status").$type<PostStatus>().notNull().default("draft"),
    googlePostId: text("google_post_id"),
    googlePostName: text("google_post_name"),

    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("location_posts_location_id_idx").on(table.locationId),
    index("location_posts_status_idx").on(table.status),
    index("location_posts_created_at_idx").on(table.createdAt),

    pgPolicy("location_posts_service_role_access", {
      for: "all",
      to: ["postgres", "service_role"],
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ]
);

export const locationPostsRelations = relations(locationPosts, ({ one }) => ({
  location: one(locations, {
    fields: [locationPosts.locationId],
    references: [locations.id],
  }),
}));

export type LocationPost = typeof locationPosts.$inferSelect;
export type LocationPostInsert = typeof locationPosts.$inferInsert;
