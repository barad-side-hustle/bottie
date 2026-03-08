CREATE TABLE "location_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"search_impressions_desktop" integer DEFAULT 0 NOT NULL,
	"search_impressions_mobile" integer DEFAULT 0 NOT NULL,
	"maps_impressions_desktop" integer DEFAULT 0 NOT NULL,
	"maps_impressions_mobile" integer DEFAULT 0 NOT NULL,
	"website_clicks" integer DEFAULT 0 NOT NULL,
	"phone_call_clicks" integer DEFAULT 0 NOT NULL,
	"direction_requests" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "location_metrics_location_date_unique" UNIQUE("location_id","date")
);
--> statement-breakpoint
ALTER TABLE "location_metrics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "location_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"topic_type" text DEFAULT 'STANDARD' NOT NULL,
	"summary" text NOT NULL,
	"media_url" text,
	"call_to_action" jsonb,
	"event" jsonb,
	"offer" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"google_post_id" text,
	"google_post_name" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "location_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "retry_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "location_metrics" ADD CONSTRAINT "location_metrics_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_posts" ADD CONSTRAINT "location_posts_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "location_metrics_location_id_idx" ON "location_metrics" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_metrics_date_idx" ON "location_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "location_posts_location_id_idx" ON "location_posts" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "location_posts_status_idx" ON "location_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "location_posts_created_at_idx" ON "location_posts" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "location_metrics_service_role_access" ON "location_metrics" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "location_posts_service_role_access" ON "location_posts" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);