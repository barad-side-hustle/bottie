CREATE TABLE "location_competitor_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"place_id" text,
	"latitude" double precision,
	"longitude" double precision,
	"primary_type" text,
	"own_rating" double precision,
	"own_review_count" integer,
	"business_status" text,
	"competitors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stats" jsonb,
	"radius_meters" integer DEFAULT 2000 NOT NULL,
	"status" text DEFAULT 'ok' NOT NULL,
	"error_reason" text,
	"fetched_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "location_competitor_snapshots_location_unique" UNIQUE("location_id")
);
--> statement-breakpoint
ALTER TABLE "location_competitor_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "location_competitor_snapshots" ADD CONSTRAINT "location_competitor_snapshots_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "location_competitor_snapshots_location_id_idx" ON "location_competitor_snapshots" USING btree ("location_id");--> statement-breakpoint
CREATE POLICY "location_competitor_snapshots_service_role_access" ON "location_competitor_snapshots" AS PERMISSIVE FOR ALL TO "postgres", "service_role" USING (true) WITH CHECK (true);